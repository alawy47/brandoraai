// BRANDORA API (Express). For Netlify, the same handlers run as functions: see netlify/functions.
//   text   → Claude, OpenAI or Gemini (brand strategy, logo directions, refinements)
//   image  → OpenAI or Gemini (symbol explorations)
//   edit   → OpenAI or Gemini (photo mockups from the real logo, image edits)
//   vector → Vectorizer.AI or local Potrace (raster → clean SVG)
//   fonts  → Google Fonts API or the curated library
// Keys come from environment variables only. Start with: node --env-file=.env index.js
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { buildRegistry } from './core/setup.js';
import { verifyUser } from './core/auth.js';
import { createHandlers, JOB_TYPES, publicError } from './core/handlers.js';
import { JobQueue } from './core/jobs.js';
import { rateLimit } from './core/rateLimit.js';

const env = process.env;
const supabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY) : null;
const registry = buildRegistry(env, {
  sink: supabase ? (e) => supabase.from('api_usage').insert({ provider: e.provider, task: e.task, model: e.model, ok: e.ok, ms: e.ms, cost_usd: e.costUsd, error: e.error }) : undefined,
});
const handlers = createHandlers(registry);
const jobs = new JobQueue({ concurrency: Number(env.JOB_CONCURRENCY || 2) });

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '12mb' })); // reference images for mockups and vectorising
const limiter = rateLimit({ perMinute: Number(env.RATE_LIMIT_PER_MIN || 20), burst: 10 });

const requireUser = async (req, res, next) => {
  try { req.user = await verifyUser(req.headers.authorization, env); next(); } catch (e) { res.status(e.status || 401).json({ error: e.message }); }
};
const fail = (res, e) => {
  console.error(e.message);
  const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
  res.status(status).json({ error: publicError(e), detail: env.NODE_ENV === 'production' ? undefined : e.message });
};
const route = (name) => async (req, res) => { try { res.json(await handlers[name](req.body ?? {})); } catch (e) { fail(res, e); } };

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/providers/status', (_req, res) => res.json({
  providers: registry.status(),
  routing: Object.fromEntries(Object.keys(registry.order).map((t) => [t, registry.available(t)])),
  usage: registry.usage.summary(), recent: registry.usage.recent(15), cache: registry.cache.stats(), jobs: jobs.stats(),
}));

// Background jobs: every AI task can run as a job; the app polls GET /api/jobs/:id.
app.post('/api/jobs', requireUser, limiter, (req, res) => {
  const { type, ...payload } = req.body ?? {};
  if (!JOB_TYPES.includes(type)) return res.status(400).json({ error: 'Unknown job type.' });
  const job = jobs.create(type, ({ progress }) => handlers[type](payload, progress).catch((e) => { console.error(e.message); e.publicMessage = publicError(e); throw e; }), req.user?.id);
  res.status(202).json({ jobId: job.id });
});
app.get('/api/jobs/:id', requireUser, (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || (job.owner && job.owner !== req.user?.id)) return res.status(404).json({ error: 'Job not found.' });
  res.json(jobs.public(job));
});

// Direct routes for scripts and simple clients.
app.post('/api/brands/generate', requireUser, limiter, route('brand'));
app.post('/api/logos/directions', requireUser, limiter, route('directions'));
app.post('/api/logos/refine', requireUser, limiter, route('refine'));
app.post('/api/images/symbol', requireUser, limiter, route('symbol'));
app.post('/api/images/mockup', requireUser, limiter, route('mockup'));
app.post('/api/images/edit', requireUser, limiter, route('edit'));
app.post('/api/vectorize', requireUser, limiter, route('vectorize'));
app.get('/api/fonts', async (req, res) => { try { res.json(await handlers.fonts(req.query)); } catch (e) { fail(res, e); } });

export { app, registry, jobs };

if (process.argv[1]?.endsWith('index.js')) {
  const PORT = env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`BRANDORA API on http://localhost:${PORT}`);
    for (const t of ['text', 'image', 'edit', 'vector']) console.log(`  ${t.padEnd(6)} → ${registry.available(t).join(', ') || 'no provider configured'}`);
  });
}
