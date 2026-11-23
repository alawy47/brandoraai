import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { ProviderRegistry } from '../core/registry.js';
import { UsageTracker } from '../core/usage.js';
import { ProviderError } from '../core/http.js';
import { JobQueue } from '../core/jobs.js';
import { openaiProvider } from '../providers/openai.js';
import { geminiProvider } from '../providers/gemini.js';
import { potraceProvider } from '../providers/vector.js';

const fake = (id, impl) => ({ id, label: id, configured: true, tasks: { text: impl } });
const reg = (providers, order = Object.keys(providers)) => new ProviderRegistry({ providers, order: { text: order }, usage: new UsageTracker(), retries: 2, baseDelayMs: 5 });

test('falls back to the next provider on a non-retryable error', async () => {
  const r = reg({
    a: fake('a', async () => { throw new ProviderError('bad key', { status: 401 }); }),
    b: fake('b', async () => ({ data: { ok: 1 }, usage: { inputTokens: 10, outputTokens: 5 } })),
  });
  const out = await r.run('text', {});
  assert.equal(out.provider, 'b');
  assert.equal(r.usage.summary().a.failures, 1);
});

test('retries transient errors with backoff before succeeding', async () => {
  let calls = 0;
  const r = reg({ a: fake('a', async () => { if (++calls < 3) throw new ProviderError('busy', { status: 503, retryable: true }); return { data: 1 }; }) });
  const out = await r.run('text', {});
  assert.equal(out.provider, 'a');
  assert.equal(calls, 3);
});

test('cools a provider down after a long rate limit and skips it next time', async () => {
  let aCalls = 0;
  const r = reg({
    a: fake('a', async () => { aCalls++; throw new ProviderError('429', { status: 429, retryable: true, retryAfterMs: 60000 }); }),
    b: fake('b', async () => ({ data: 'b' })),
  });
  await r.run('text', {});
  await r.run('text', {});
  assert.equal(aCalls, 1);
});

test('cache returns identical requests and shares in-flight calls', async () => {
  let calls = 0;
  const r = reg({ a: fake('a', async () => { calls++; await new Promise((s) => setTimeout(s, 20)); return { data: 'x' }; }) });
  const [one, two] = await Promise.all([r.run('text', { q: 1 }, { cacheable: true }), r.run('text', { q: 1 }, { cacheable: true })]);
  const three = await r.run('text', { q: 1 }, { cacheable: true });
  assert.equal(calls, 1);
  assert.equal(one.data, 'x'); assert.equal(two.cached, true); assert.equal(three.cached, true);
});

test('reports a clear error when nothing is configured', async () => {
  const r = reg({});
  await assert.rejects(r.run('text', {}), /No provider is configured/);
});

test('job queue runs jobs with progress and records failures', async () => {
  const q = new JobQueue({ concurrency: 1 });
  const ok = q.create('t', async ({ progress }) => { progress(0.5); return 42; });
  const bad = q.create('t', async () => { throw new Error('boom'); });
  await new Promise((s) => setTimeout(s, 30));
  assert.equal(q.get(ok.id).status, 'done'); assert.equal(q.get(ok.id).result, 42);
  assert.equal(q.get(bad.id).status, 'failed');
});

test('OpenAI text, image and edit requests are shaped correctly and parsed', async () => {
  const seen = [];
  globalThis.fetch = async (url, init) => {
    seen.push({ url, init });
    if (url.endsWith('/chat/completions')) return new Response(JSON.stringify({ model: 'm', choices: [{ message: { content: '{"name":"Noor"}' } }], usage: { prompt_tokens: 12, completion_tokens: 4 } }));
    return new Response(JSON.stringify({ data: [{ b64_json: 'aGk=' }] }));
  };
  const p = openaiProvider({ OPENAI_API_KEY: 'k' });
  const t = await p.tasks.text({ system: 's', prompt: 'p', schema: z.object({ name: z.string() }) });
  assert.equal(t.data.name, 'Noor'); assert.equal(t.usage.inputTokens, 12);
  const body = JSON.parse(seen[0].init.body);
  assert.equal(body.response_format.type, 'json_object'); assert.match(body.messages[0].content, /JSON Schema/);
  const img = await p.tasks.image({ prompt: 'x', transparent: true });
  assert.equal(img.image.b64, 'aGk='); assert.equal(JSON.parse(seen[1].init.body).background, 'transparent');
  await p.tasks.edit({ prompt: 'x', images: [{ b64: 'aGk=', mime: 'image/png' }] });
  assert.ok(seen[2].init.body instanceof FormData); assert.ok(seen[2].init.body.getAll('image[]').length === 1);
});

test('OpenAI errors are classified for retry', async () => {
  globalThis.fetch = async () => new Response('{"error":{"message":"slow down"}}', { status: 429, headers: { 'retry-after': '2' } });
  const p = openaiProvider({ OPENAI_API_KEY: 'k' });
  await assert.rejects(p.tasks.image({ prompt: 'x' }), (e) => e.retryable && e.status === 429 && e.retryAfterMs === 2000);
});

test('Gemini JSON and image responses are parsed', async () => {
  globalThis.fetch = async (url) => url.includes('image')
    ? new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }, { inlineData: { mimeType: 'image/png', data: 'aGk=' } }] } }] }))
    : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '```json\n{"name":"قمر"}\n```' }] } }], usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 3 } }));
  const g = geminiProvider({ GEMINI_API_KEY: 'k' });
  const t = await g.tasks.text({ system: 's', prompt: 'p', schema: z.object({ name: z.string() }) });
  assert.equal(t.data.name, 'قمر');
  const i = await g.tasks.image({ prompt: 'x' });
  assert.equal(i.image.mime, 'image/png');
});

test('invalid JSON from a provider is retryable', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }));
  const p = openaiProvider({ OPENAI_API_KEY: 'k' });
  await assert.rejects(p.tasks.text({ system: 's', prompt: 'p', schema: z.object({ a: z.string() }) }), (e) => e.retryable);
});

test('Potrace vectorises a real logo PNG into SVG path data', async () => {
  const png = readFileSync(process.env.TEST_PNG || new URL('./fixtures/logo-icon.png', import.meta.url));
  const out = await potraceProvider().tasks.vector({ b64: png.toString('base64') });
  assert.ok(out.d.length > 100);
  assert.match(out.svg, /^<svg[^>]+viewBox="[\d. ]+"><path d="/);
});

test('Anthropic provider: brand-sized requests pass the SDK non-streaming guard', async () => {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const { BRAND_MAX_TOKENS } = await import('../core/handlers.js');
  const client = new Anthropic({ apiKey: 'k', maxRetries: 0, fetch: async () => new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'x' } }), { status: 401 }) });
  const ask = async (max_tokens) => client.messages.create({ model: 'claude-opus-5-5', max_tokens, messages: [{ role: 'user', content: 'hi' }] });
  await assert.rejects(ask(BRAND_MAX_TOKENS), (e) => !/Streaming is required/.test(e.message)); // reaches the network, which answers 401
  await assert.rejects(ask(32000), /Streaming is required/); // documents why the limit exists
});

test('anthropic falls back to JSON in the prompt when the structured-output grammar is too large', async () => {
  const { anthropicProvider } = await import('../providers/anthropic.js');
  const { z } = await import('zod');
  const schema = z.object({ title: z.string(), n: z.number().int() });
  const bodies = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body); bodies.push(body);
    if (body.output_config?.format) return new Response(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'The compiled grammar is too large, which would cause performance issues.' } }), { status: 400, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'Here: {"title":"Qahwa","n":3}' }], usage: { input_tokens: 10, output_tokens: 5 } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const p = anthropicProvider({ ANTHROPIC_API_KEY: 'test' });
    const a = await p.tasks.text({ system: 's', prompt: 'p', schema });
    assert.deepEqual(a.data, { title: 'Qahwa', n: 3 });
    assert.equal(bodies.length, 2);
    assert.match(bodies[1].messages[0].content, /JSON Schema/);
    await p.tasks.text({ system: 's', prompt: 'p', schema });
    assert.equal(bodies.length, 3, 'the second call skips the strict attempt');
  } finally { globalThis.fetch = realFetch; }
});

test('refine returns only the fields that changed, mapped onto valid values', async () => {
  const { createHandlers } = await import('../core/handlers.js');
  const logo = { style: 'minimal', mark: 'arch', layout: 'horizontal', font: 'Fraunces', fontAr: 'Amiri', weight: 600, case: 'asis', tracking: 0, colorway: 'primary', rationale: 'old' };
  const registry = { run: async () => ({ provider: 'fake', data: { logo: { ...logo, case: 'upper', tracking: 0.2, colorway: 'accent', mark: 'not-a-mark', rationale: 'new' }, applied: ['Uppercase'], note: 'n' } }) };
  const r = await createHandlers(registry).refine({ input: { name: 'Dar Qahwa' }, logo, request: 'uppercase, wider, gold' });
  assert.deepEqual(r.patch, { case: 'upper', tracking: 0.2, colorway: 'accent', rationale: 'new' });
});

test('cloudflare draws the image when Gemini is over quota, at zero cost', async () => {
  const { buildRegistry } = await import('../core/setup.js');
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    if (String(url).includes('generativelanguage')) return new Response(JSON.stringify({ error: { code: 429, message: 'You exceeded your current quota' } }), { status: 429, headers: { 'content-type': 'application/json' } });
    assert.match(init.headers.Authorization, /^Bearer cf-token$/);
    return new Response(JSON.stringify({ success: true, result: { image: 'QUJD' } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const reg = buildRegistry({ GEMINI_API_KEY: 'g', CLOUDFLARE_ACCOUNT_ID: 'acct', CLOUDFLARE_API_TOKEN: 'cf-token', PROVIDER_RETRIES: '0' });
    assert.deepEqual(reg.available('image'), ['gemini', 'cloudflare']);
    assert.deepEqual(reg.available('edit'), ['gemini'], 'cloudflare cannot edit a reference image');
    const out = await reg.run('image', { prompt: 'a flat coffee symbol' });
    assert.equal(out.provider, 'cloudflare');
    assert.equal(out.image.b64, 'QUJD');
    assert.ok(calls.some((u) => u.includes('/accounts/acct/ai/run/@cf/black-forest-labs/flux-1-schnell')));
    assert.equal(reg.usage.summary().cloudflare.costUsd, 0);
  } finally { globalThis.fetch = realFetch; }
});
