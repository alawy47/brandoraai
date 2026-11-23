// BRANDORA API for Netlify. Two entry points share this file:
//   handleApi  : the fast function (creates jobs, reports status). Answers in well under 10 s.
//   runJob     : the background function (up to 15 min). Runs the AI task and stores the result.
// Job state lives in a key-value store (Netlify Blobs in production, in memory in tests).
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { buildRegistry } from '../../server/core/setup.js';
import { verifyUser, authEnabled } from '../../server/core/auth.js';
import { createHandlers, JOB_TYPES, publicError } from '../../server/core/handlers.js';
import { UsageTracker } from '../../server/core/usage.js';
import { handleInstagram } from './instagram.js';

const JOB_TTL_MS = 60 * 60 * 1000;
const STALE_RUNNING_MS = 16 * 60 * 1000; // background functions are killed at 15 minutes
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const idTime = (id) => parseInt(id.split('-')[0], 36);

/** Store interface used here: get(key), set(key, obj), del(key), keys(prefix). */
export function blobsAdapter(getStore) {
  const open = (name) => getStore({ name, consistency: 'strong' });
  return (name) => {
    const s = open(name);
    return {
      get: (k) => s.get(k, { type: 'json' }),
      set: (k, v) => s.setJSON(k, v),
      del: (k) => s.delete(k),
      keys: async (prefix = '') => (await s.list({ prefix })).blobs.map((b) => b.key),
    };
  };
}

export function memoryStores() {
  const maps = {};
  return (name) => {
    const m = (maps[name] ||= new Map());
    return {
      get: async (k) => (m.has(k) ? structuredClone(m.get(k)) : null),
      set: async (k, v) => { m.set(k, structuredClone(v)); },
      del: async (k) => { m.delete(k); },
      keys: async (prefix = '') => [...m.keys()].filter((k) => k.startsWith(prefix)).sort(),
    };
  };
}

const publicJob = (j) => { const { payload, token, owner, ...rest } = j; return rest; }; // eslint-disable-line no-unused-vars

async function rateLimited(stores, key, perMinute = 20) {
  const store = stores('ratelimit');
  const now = Date.now();
  const rec = (await store.get(key)) || { n: 0, t: now };
  if (now - rec.t > 60000) { rec.n = 0; rec.t = now; }
  rec.n++;
  await store.set(key, rec);
  return rec.n > perMinute;
}

async function sweep(stores) {
  const store = stores('jobs');
  const old = (await store.keys()).filter((k) => Date.now() - idTime(k) > JOB_TTL_MS).slice(0, 20);
  await Promise.all(old.map((k) => store.del(k)));
}

/**
 * @param {Request} req
 * @param {object} deps { stores, env, trigger(jobId, token), verify?, makeRegistry? }
 */
export async function handleApi(req, deps) {
  const { stores, env = process.env } = deps;
  const verify = deps.verify || ((h) => verifyUser(h, env));
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)/, '') || '/';
  const method = req.method;
  const registry = (deps.makeRegistry || ((sink) => buildRegistry(env, { sink })))();

  try {
    if (path.startsWith('/instagram')) return handleInstagram(req, path, { stores, env, fetch: deps.fetch });
    if (method === 'GET' && path === '/health') return json({ ok: true });

    if (method === 'GET' && path === '/providers/status') {
      const events = await readUsage(stores);
      return json({
        providers: registry.status(),
        routing: Object.fromEntries(Object.keys(registry.order).map((t) => [t, registry.available(t)])),
        usage: events.summary(), recent: events.recent(15), cache: { entries: 0, hits: 0, misses: 0, shared: 0 },
        jobs: await jobStats(stores), host: 'netlify', auth: authEnabled(env),
      });
    }

    if (method === 'GET' && path === '/fonts') {
      const out = await createHandlers(registry).fonts(Object.fromEntries(url.searchParams));
      return json(out);
    }

    if (method === 'POST' && path === '/jobs') {
      const user = await verify(req.headers.get('authorization'));
      const client = user?.id || req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'anon';
      if (await rateLimited(stores, client, Number(env.RATE_LIMIT_PER_MIN || 20))) return json({ error: 'Too many requests. Wait a moment and try again.' }, 429);
      const { type, ...payload } = await req.json().catch(() => ({}));
      if (!JOB_TYPES.includes(type)) return json({ error: 'Unknown job type.' }, 400);
      if (!registry.available(['brand', 'directions', 'refine', 'instagram'].includes(type) ? 'text' : type === 'symbol' ? 'image' : 'edit').length) {
        return json({ error: 'No AI provider is configured for this task. Add an API key in the site settings.' }, 503);
      }
      const id = `${Date.now().toString(36)}-${randomUUID()}`;
      const token = randomBytes(24).toString('hex');
      await stores('jobs').set(id, { id, type, owner: user?.id || null, status: 'queued', progress: 0, createdAt: Date.now(), token, payload });
      await deps.trigger(id, token);
      sweep(stores).catch(() => {});
      return json({ jobId: id }, 202);
    }

    const m = path.match(/^\/jobs\/([\w-]+)$/);
    if (method === 'GET' && m) {
      const user = await verify(req.headers.get('authorization'));
      const store = stores('jobs');
      const job = await store.get(m[1]);
      if (!job || (job.owner && job.owner !== user?.id)) return json({ error: 'Job not found.' }, 404);
      if (job.status === 'running' && Date.now() - (job.startedAt || job.createdAt) > STALE_RUNNING_MS) {
        job.status = 'failed'; job.error = 'The generation timed out. Try again.'; await store.set(job.id, job);
      }
      return json(publicJob(job));
    }
    return json({ error: 'Not found.' }, 404);
  } catch (e) {
    console.error(e.message);
    const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
    return json({ error: status === 500 ? 'Something went wrong. Try again.' : publicError(e) }, status);
  }
}

async function jobStats(stores) {
  const store = stores('jobs');
  const s = { queued: 0, running: 0, done: 0, failed: 0 };
  for (const k of (await store.keys()).slice(-50)) { const j = await store.get(k); if (j) s[j.status] = (s[j.status] || 0) + 1; }
  return s;
}

async function readUsage(stores) {
  const store = stores('usage');
  const keys = await store.keys();
  const tracker = new UsageTracker({ keep: 500 });
  for (const k of keys.slice(-200)) { const e = await store.get(k); if (e) tracker.events.push(e); }
  if (keys.length > 500) await Promise.all(keys.slice(0, keys.length - 300).map((k) => store.del(k)));
  return tracker;
}

/** Runs a queued job. Called by the background function. */
export async function runJob({ jobId, token }, deps) {
  const { stores, env = process.env } = deps;
  const store = stores('jobs');
  const job = await store.get(jobId);
  const ok = job && job.status === 'queued' && typeof token === 'string' && token.length === job.token.length && timingSafeEqual(Buffer.from(token), Buffer.from(job.token));
  if (!ok) return { skipped: true }; // unknown job, replay, or a caller without the job's secret

  const pending = [];
  const sink = (e) => { const p = stores('usage').set(`${e.ts}-${Math.random().toString(36).slice(2, 7)}`, e); pending.push(p); return p; };
  const registry = (deps.makeRegistry || ((s) => buildRegistry(env, { sink: s })))(sink);
  const handlers = createHandlers(registry);

  job.status = 'running'; job.startedAt = Date.now(); delete job.token;
  await store.set(jobId, job);
  // All writes go through one queue and the final write waits for it. Otherwise a slow progress write
  // can land after the result and turn a finished job back into "running".
  let queue = Promise.resolve(), finished = false, last = 0;
  const write = (v) => { queue = queue.then(() => store.set(jobId, v)).catch(() => {}); return queue; };
  const progress = (n) => { if (finished || Date.now() - last < 1500) return; last = Date.now(); write({ ...job, progress: n }); };
  let final;
  try {
    const result = await handlers[job.type](job.payload, progress);
    final = { ...publicJob(job), owner: job.owner, status: 'done', progress: 1, result, finishedAt: Date.now() };
  } catch (e) {
    console.error(e.message);
    final = { ...publicJob(job), owner: job.owner, status: 'failed', error: publicError(e), finishedAt: Date.now() };
  }
  finished = true;
  await queue;
  await store.set(jobId, final);
  await Promise.allSettled(pending);
  return { ok: true };
}
