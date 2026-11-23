import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleApi, runJob, memoryStores } from '../lib/api.js';
import { ProviderRegistry } from '../../server/core/registry.js';
import { UsageTracker } from '../../server/core/usage.js';

const concept = (d) => ({ direction: d, title: 'T', summary: 's', tagline: 'tag', story: 'st', mission: 'm', values: ['a', 'b', 'c'], voice: { traits: ['x', 'y', 'z'], sample: 'hi' }, match: 90,
  palette: ['primary', 'secondary', 'accent', 'dark', 'light'].map((role, i) => ({ role, hex: ['#5B3A29', '#C9B79C', '#D9A441', '#1C1410', '#F7F2EA'][i], name: { en: role, ar: role } })),
  fonts: { heading: 'Fraunces', body: 'Manrope', headingAr: 'El Messiri', bodyAr: 'Tajawal' },
  logo: { style: 'minimal', mark: 'leaf', layout: 'horizontal', font: 'Jost', fontAr: 'Readex Pro', weight: 400, case: 'lower', tracking: 0.1, colorway: 'primary', rationale: 'r' },
  social: { posts: ['launch', 'product', 'quote'].map((type) => ({ type, kicker: 'k', headline: 'h', sub: 's', cta: 'c', caption: 'x' })), stories: { arrival: { kicker: 'k', headline: 'h', cta: 'c' }, poll: { kicker: 'k', headline: 'h', a: 'a', b: 'b' } }, hashtags: ['#a'] } });
const brandData = { brief: { objective: 'o', insight: 'i', positioning: 'p', personality: ['a', 'b', 'c'], cues: ['c'], avoid: ['a'], deliverables: ['d'] }, concepts: [concept('signature'), concept('contrast'), concept('expressive')] };

const fakeRegistry = (text) => (sink) => new ProviderRegistry({
  providers: { fake: { id: 'fake', label: 'Fake', configured: true, tasks: { text }, models: {} } },
  order: { text: ['fake'], image: [], edit: [], vector: [], fonts: [] }, usage: new UsageTracker({ sink }), retries: 0,
});
const call = (path, { method = 'GET', body, headers = {} } = {}) => new Request(`https://site.test${path}`, { method, headers: { 'content-type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined });
const setup = (text = async () => ({ data: brandData, usage: { inputTokens: 100, outputTokens: 50 } }), extra = {}) => {
  const stores = memoryStores(); const triggered = [];
  const deps = { stores, env: { RATE_LIMIT_PER_MIN: '3' }, trigger: async (jobId, token) => { triggered.push({ jobId, token }); }, makeRegistry: fakeRegistry(text), verify: async () => null, ...extra };
  return { stores, triggered, deps };
};
const input = { name: 'Noor', category: 'coffee', personality: 'natural', language: 'en' };

test('full cycle: create job, background run, poll result', async () => {
  const { triggered, deps } = setup();
  const res = await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps);
  assert.equal(res.status, 202);
  const { jobId } = await res.json();
  assert.equal(triggered.length, 1);

  let poll = await (await handleApi(call(`/api/jobs/${jobId}`), deps)).json();
  assert.equal(poll.status, 'queued'); assert.equal(poll.token, undefined); assert.equal(poll.payload, undefined);

  await runJob(triggered[0], deps);
  poll = await (await handleApi(call(`/api/jobs/${jobId}`), deps)).json();
  assert.equal(poll.status, 'done'); assert.equal(poll.progress, 1);
  assert.equal(poll.result.concepts.length, 3); assert.equal(poll.result.brief.objective, 'o');
  assert.ok(poll.result.concepts[0].card.email.endsWith('.com'));
  assert.equal(poll.token, undefined); assert.equal(poll.owner, undefined);
});

test('usage recorded by the background run shows up in status', async () => {
  const { triggered, deps } = setup();
  const { jobId } = await (await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps)).json();
  await runJob(triggered[0], deps);
  const status = await (await handleApi(call('/api/providers/status'), deps)).json();
  assert.equal(status.usage.fake.calls, 1); assert.equal(status.jobs.done, 1); assert.equal(status.host, 'netlify');
  assert.ok(jobId);
});

test('background run refuses a wrong token, and a replay', async () => {
  const { triggered, deps } = setup();
  await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps);
  const { jobId, token } = triggered[0];
  assert.deepEqual(await runJob({ jobId, token: 'x'.repeat(token.length) }, deps), { skipped: true });
  assert.deepEqual(await runJob({ jobId, token: 'short' }, deps), { skipped: true });
  assert.deepEqual(await runJob({ jobId: 'nope', token }, deps), { skipped: true });
  assert.deepEqual(await runJob({ jobId, token }, deps), { ok: true });
  assert.deepEqual(await runJob({ jobId, token }, deps), { skipped: true });
});

test('a provider failure becomes a failed job with a safe message', async () => {
  const { triggered, deps } = setup(async () => { throw new Error('secret upstream detail sk-123'); });
  const { jobId } = await (await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps)).json();
  await runJob(triggered[0], deps);
  const poll = await (await handleApi(call(`/api/jobs/${jobId}`), deps)).json();
  assert.equal(poll.status, 'failed'); assert.match(poll.error, /could not complete/); assert.ok(!JSON.stringify(poll).includes('sk-123'));
});

test('invalid brief fails with the input message', async () => {
  const { triggered, deps } = setup();
  const { jobId } = await (await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input: { name: '' } } }), deps)).json();
  await runJob(triggered[0], deps);
  const poll = await (await handleApi(call(`/api/jobs/${jobId}`), deps)).json();
  assert.equal(poll.status, 'failed'); assert.match(poll.error, /missing a name/);
});

test('rejects unknown job types, and tasks with no provider configured', async () => {
  const { deps } = setup();
  assert.equal((await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'rm -rf' } }), deps)).status, 400);
  const res = await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'symbol', input, idea: 'x' } }), deps);
  assert.equal(res.status, 503); assert.match((await res.json()).error, /No AI provider/);
});

test('rate limit returns 429 after the allowed requests', async () => {
  const { deps } = setup();
  const post = () => handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input }, headers: { 'x-nf-client-connection-ip': '1.2.3.4' } }), deps);
  assert.deepEqual([await post(), await post(), await post()].map((r) => r.status), [202, 202, 202]);
  assert.equal((await post()).status, 429);
});

test('jobs belong to their owner when sign-in is on', async () => {
  const { triggered, deps } = setup(undefined, { verify: async (h) => { if (!h) { const e = new Error('Sign in to use the studio.'); e.status = 401; throw e; } return { id: h.replace('Bearer ', '') }; } });
  assert.equal((await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps)).status, 401);
  const { jobId } = await (await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input }, headers: { authorization: 'Bearer alice' } }), deps)).json();
  assert.equal((await handleApi(call(`/api/jobs/${jobId}`, { headers: { authorization: 'Bearer alice' } }), deps)).status, 200);
  assert.equal((await handleApi(call(`/api/jobs/${jobId}`, { headers: { authorization: 'Bearer mallory' } }), deps)).status, 404);
  assert.equal(triggered.length, 1);
});

test('health, fonts and unknown paths; both URL forms are accepted', async () => {
  const { deps } = setup();
  assert.deepEqual(await (await handleApi(call('/api/health'), deps)).json(), { ok: true });
  assert.deepEqual(await (await handleApi(call('/.netlify/functions/api/health'), deps)).json(), { ok: true });
  assert.equal((await handleApi(call('/api/nope'), deps)).status, 404);
});

test('a slow progress write can never overwrite the finished result', async () => {
  const base = memoryStores();
  // Progress writes (status running, progress > 0) are slow; every other write is instant. Without ordering, they land last.
  const stores = (name) => { const st = base(name); return { ...st, set: async (k, v) => { if (name === 'jobs' && v.status === 'running' && v.progress > 0) await new Promise((r) => setTimeout(r, 60)); return st.set(k, v); } }; };
  const handler = async (i, progress) => { progress?.(0.5); return { data: { ...brandData }, usage: {} }; };
  const { triggered, deps } = setup(handler, { stores });
  const { jobId } = await (await handleApi(call('/api/jobs', { method: 'POST', body: { type: 'brand', input } }), deps)).json();
  await runJob(triggered[0], deps);
  await new Promise((r) => setTimeout(r, 150)); // let any stray slow write land
  const poll = await (await handleApi(call(`/api/jobs/${jobId}`), deps)).json();
  assert.equal(poll.status, 'done'); assert.equal(poll.result.concepts.length, 3);
});
