import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { handleApi, memoryStores } from '../lib/api.js';
import { createHandlers } from '../../server/core/handlers.js';
import { ProviderRegistry } from '../../server/core/registry.js';
import { UsageTracker } from '../../server/core/usage.js';

const env = { INSTAGRAM_APP_ID: 'APP', INSTAGRAM_APP_SECRET: 'SECRET' };
const call = (path, { method = 'GET', body, headers = {} } = {}) => new Request(`https://site.test${path}`, { method, headers, body });

// A stand-in for Instagram's endpoints that records what was asked.
function fakeInstagram(over = {}) {
  const seen = [];
  const fetch = async (url, init = {}) => {
    const u = new URL(url); seen.push({ host: u.host, path: u.pathname, q: Object.fromEntries(u.searchParams), body: init.body ? Object.fromEntries(new URLSearchParams(init.body)) : null });
    const R = (b, status = 200) => new Response(JSON.stringify(b), { status });
    if (u.host === 'api.instagram.com') return over.token ? over.token() : R({ access_token: 'SHORT', user_id: 111 });
    if (u.pathname === '/access_token') return R({ access_token: 'LONG', expires_in: 5184000 });
    if (u.pathname === '/refresh_access_token') return R({ access_token: 'REFRESHED', expires_in: 5184000 });
    if (u.pathname.endsWith('/me/media')) return over.media ? over.media(u) : R({ data: [{ id: 'm1', caption: 'Fresh beans', media_type: 'IMAGE', like_count: 42, comments_count: 3, permalink: 'https://instagram.com/p/x', timestamp: '2026-11-01T10:00:00+0000' }] });
    if (u.pathname.endsWith('/me')) return R({ user_id: '111', username: 'noorcoffee', name: 'Noor Coffee', account_type: 'BUSINESS', followers_count: 1200, media_count: 80, biography: 'Specialty coffee, Dubai' });
    return R({ error: { message: 'unexpected', code: 1 } }, 404);
  };
  return { fetch, seen };
}
const setup = (over) => { const stores = memoryStores(); const ig = fakeInstagram(over); return { stores, ig, deps: { stores, env, fetch: ig.fetch, trigger: async () => {}, verify: async () => null, makeRegistry: () => ({ available: () => [], status: () => [], order: {}, usage: new UsageTracker() }) } }; };

async function connect(ctx) {
  const login = await (await handleApi(call('/api/instagram/login'), ctx.deps)).json();
  const state = new URL(login.url).searchParams.get('state');
  const res = await handleApi(call(`/api/instagram/callback?code=CODE123%23_&state=${state}`), ctx.deps);
  return { login, state, res, conn: res.headers.get('location')?.split('#c=')[1] };
}

test('login URL carries the right client, redirect, scope and a state', async () => {
  const ctx = setup();
  const { login } = await connect(ctx);
  const u = new URL(login.url);
  assert.equal(u.origin + u.pathname, 'https://www.instagram.com/oauth/authorize');
  assert.equal(u.searchParams.get('client_id'), 'APP'); assert.equal(u.searchParams.get('redirect_uri'), 'https://site.test/api/instagram/callback');
  assert.equal(u.searchParams.get('scope'), 'instagram_business_basic'); assert.equal(u.searchParams.get('response_type'), 'code');
});

test('callback exchanges the code, upgrades to a long-lived token and hands the browser only an opaque id', async () => {
  const ctx = setup();
  const { res, conn } = await connect(ctx);
  assert.equal(res.status, 302); assert.match(res.headers.get('location'), /^\/instagram#c=[a-f0-9]{64}$/);
  const [t1, t2] = ctx.ig.seen;
  assert.equal(t1.host, 'api.instagram.com'); assert.equal(t1.body.code, 'CODE123'); assert.equal(t1.body.grant_type, 'authorization_code'); assert.equal(t1.body.client_secret, 'SECRET');
  assert.equal(t2.path, '/access_token'); assert.equal(t2.q.grant_type, 'ig_exchange_token'); assert.equal(t2.q.access_token, 'SHORT');
  assert.ok(!res.headers.get('location').includes('LONG'));
  assert.equal((await ctx.stores('ig-conn').get(conn)).token, 'LONG');
});

test('state is required, single use and checked', async () => {
  const ctx = setup();
  const { state } = await connect(ctx);
  assert.equal((await handleApi(call(`/api/instagram/callback?code=x&state=${state}`), ctx.deps)).headers.get('location'), '/instagram?error=state'); // replay
  assert.equal((await handleApi(call('/api/instagram/callback?code=x&state=nope'), ctx.deps)).headers.get('location'), '/instagram?error=state');
  assert.equal((await handleApi(call('/api/instagram/callback?code=x'), ctx.deps)).headers.get('location'), '/instagram?error=state');
  assert.equal((await handleApi(call('/api/instagram/callback?error=access_denied'), ctx.deps)).headers.get('location'), '/instagram?error=denied');
});

test('account returns profile and posts but never the token', async () => {
  const ctx = setup();
  const { conn } = await connect(ctx);
  const res = await handleApi(call('/api/instagram/account', { headers: { 'x-ig-conn': conn } }), ctx.deps);
  const text = await res.text(); const body = JSON.parse(text);
  assert.equal(res.status, 200); assert.equal(body.profile.username, 'noorcoffee'); assert.equal(body.posts[0].caption, 'Fresh beans');
  assert.ok(!text.includes('LONG') && !text.includes('access_token'));
  const mediaCall = ctx.ig.seen.find((s) => s.path.endsWith('/me/media'));
  assert.equal(mediaCall.q.access_token, 'LONG'); assert.match(mediaCall.q.fields, /caption/);
});

test('account without a valid connection id is refused', async () => {
  const ctx = setup();
  assert.equal((await handleApi(call('/api/instagram/account'), ctx.deps)).status, 401);
  assert.equal((await handleApi(call('/api/instagram/account', { headers: { 'x-ig-conn': 'f'.repeat(64) } }), ctx.deps)).status, 401);
  assert.equal((await handleApi(call('/api/instagram/account', { headers: { 'x-ig-conn': '../etc' } }), ctx.deps)).status, 401);
});

test('a token close to expiry is refreshed and stored', async () => {
  const ctx = setup();
  const { conn } = await connect(ctx);
  const rec = await ctx.stores('ig-conn').get(conn); rec.expiresAt = Date.now() + 3 * 24 * 3600 * 1000; await ctx.stores('ig-conn').set(conn, rec);
  await handleApi(call('/api/instagram/account', { headers: { 'x-ig-conn': conn } }), ctx.deps);
  assert.ok(ctx.ig.seen.some((s) => s.path === '/refresh_access_token'));
  assert.equal((await ctx.stores('ig-conn').get(conn)).token, 'REFRESHED');
});

test('an expired token (error 190) drops the connection and asks to reconnect', async () => {
  const ctx = setup({ media: () => new Response(JSON.stringify({ error: { message: 'Invalid OAuth access token', code: 190 } }), { status: 400 }) });
  const { conn } = await connect(ctx);
  const res = await handleApi(call('/api/instagram/account', { headers: { 'x-ig-conn': conn } }), ctx.deps);
  assert.equal(res.status, 401); assert.equal((await res.json()).code, 'expired');
  assert.equal(await ctx.stores('ig-conn').get(conn), null);
});

test('reconnecting the same account replaces the old connection; disconnect forgets it', async () => {
  const ctx = setup();
  const a = await connect(ctx); const b = await connect(ctx);
  assert.equal(await ctx.stores('ig-conn').get(a.conn), null); assert.ok(await ctx.stores('ig-conn').get(b.conn));
  await handleApi(call('/api/instagram/disconnect', { method: 'POST', headers: { 'x-ig-conn': b.conn } }), ctx.deps);
  assert.equal(await ctx.stores('ig-conn').get(b.conn), null);
});

test('Meta deauthorize and data-deletion callbacks require a valid signature and remove the data', async () => {
  const ctx = setup();
  const { conn } = await connect(ctx);
  const sign = (obj, secret = 'SECRET') => { const p = Buffer.from(JSON.stringify(obj)).toString('base64url'); return `${createHmac('sha256', secret).update(p).digest('base64url')}.${p}`; };
  const post = (path, signed) => handleApi(call(path, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: `signed_request=${signed}` }), ctx.deps);
  assert.equal((await post('/api/instagram/data-deletion', sign({ user_id: '111' }, 'WRONG'))).status, 400);
  assert.ok(await ctx.stores('ig-conn').get(conn));
  const res = await post('/api/instagram/data-deletion', sign({ user_id: '111' }));
  const body = await res.json();
  assert.equal(res.status, 200); assert.match(body.url, /\/instagram\?deleted=/); assert.ok(body.confirmation_code);
  assert.equal(await ctx.stores('ig-conn').get(conn), null); assert.equal(await ctx.stores('ig-user').get('111'), null);
});

test('not configured: status says so and login is refused with a clear code', async () => {
  const ctx = setup(); ctx.deps.env = {};
  const status = await (await handleApi(call('/api/instagram/status'), ctx.deps)).json();
  assert.equal(status.configured, false); assert.equal(status.redirectUri, 'https://site.test/api/instagram/callback');
  const login = await handleApi(call('/api/instagram/login'), ctx.deps);
  assert.equal(login.status, 503); assert.equal((await login.json()).code, 'not_configured');
});

test('idea handler validates input and returns three ideas from the account data', async () => {
  const visual = { template: 'tips', kicker: 'Tip', headline: 'Brew better', sub: '', cta: '', big: '', items: ['a', 'b', 'c'], author: '' };
  const idea = (t) => ({ title: t, why: 'w', hook: 'h', caption: 'c', hashtags: ['#a'], visual });
  let prompt = '';
  const registry = new ProviderRegistry({ providers: { f: { id: 'f', label: 'F', configured: true, models: {}, tasks: { text: async (i) => { prompt = i.prompt; return { data: { analysis: { niche: 'coffee', tone: 'warm', audience: 'locals', themes: ['a', 'b', 'c'], opportunity: 'o' }, ideas: [idea('1'), idea('2'), idea('3'), idea('4')] } }; } } } }, order: { text: ['f'] }, usage: new UsageTracker(), retries: 0 });
  const h = createHandlers(registry);
  await assert.rejects(h.instagram({}), /Connect an Instagram account/);
  const out = await h.instagram({ profile: { username: 'noorcoffee', biography: 'Specialty coffee' }, posts: [{ caption: 'Fresh beans', like_count: 42 }], brand: { name: 'Noor', language: 'ar' } });
  assert.equal(out.ideas.length, 3);
  assert.match(prompt, /@noorcoffee/); assert.match(prompt, /Fresh beans/); assert.match(prompt, /42 likes/); assert.match(prompt, /Arabic/);
});
