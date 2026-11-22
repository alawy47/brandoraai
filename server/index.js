// BRANDORA API. Multi-provider AI behind one interface:
//   text   → Claude, OpenAI or Gemini (brand strategy, logo directions, refinements)
//   image  → OpenAI or Gemini (symbol explorations)
//   edit   → OpenAI or Gemini (photo mockups from the real logo, image edits)
//   vector → Vectorizer.AI or local Potrace (raster → clean SVG)
//   fonts  → Google Fonts API or the curated library
// Keys come from environment variables only. Start with: node --env-file=.env index.js
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { ProviderRegistry } from './core/registry.js';
import { UsageTracker } from './core/usage.js';
import { JobQueue } from './core/jobs.js';
import { rateLimit } from './core/rateLimit.js';
import { anthropicProvider } from './providers/anthropic.js';
import { openaiProvider } from './providers/openai.js';
import { geminiProvider } from './providers/gemini.js';
import { potraceProvider, vectorizerProvider } from './providers/vector.js';
import { googleFontsProvider } from './providers/fonts.js';
import { BrandResult, LogoList, LogoPatch, BriefInput } from './lib/schemas.js';
import { SYSTEM, brandPrompt, directionsPrompt, refinePrompt, mockupPrompt, symbolPrompt } from './lib/prompts.js';

const env = process.env;
const list = (v, d) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : d);

// ---- Auth and persistence (optional, Supabase) -------------------------------------------
const supabase = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY) : null;
async function requireUser(req, res, next) {
  if (!supabase) return next();
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  const { data, error } = token ? await supabase.auth.getUser(token) : { data: null, error: true };
  if (error || !data?.user) return res.status(401).json({ error: 'Sign in to use the studio.' });
  req.user = data.user;
  next();
}

// ---- Providers ---------------------------------------------------------------------------
const usage = new UsageTracker({
  sink: supabase ? (e) => supabase.from('api_usage').insert({ provider: e.provider, task: e.task, model: e.model, ok: e.ok, ms: e.ms, cost_usd: e.costUsd, error: e.error }) : undefined,
});
export function buildRegistry(overrides = {}) {
  const providers = {
    anthropic: anthropicProvider(env), openai: openaiProvider(env), gemini: geminiProvider(env),
    vectorizer: vectorizerProvider(env), potrace: potraceProvider(), googlefonts: googleFontsProvider(env), ...overrides,
  };
  const order = {
    text: list(env.TEXT_PROVIDERS, ['anthropic', 'openai', 'gemini']),
    image: list(env.IMAGE_PROVIDERS, ['openai', 'gemini']),
    edit: list(env.EDIT_PROVIDERS, ['openai', 'gemini']),
    vector: list(env.VECTOR_PROVIDERS, ['vectorizer', 'potrace']),
    fonts: ['googlefonts'],
  };
  return new ProviderRegistry({ providers, order, usage, retries: Number(env.PROVIDER_RETRIES ?? 2) });
}
const registry = buildRegistry();
const jobs = new JobQueue({ concurrency: Number(env.JOB_CONCURRENCY || 2) });

// ---- Helpers -----------------------------------------------------------------------------
const HEX = /^#[0-9A-F]{6}$/i;
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'brand';
let seq = 0;
function finishConcept(c, input) {
  const lang = input.language === 'ar' ? 'ar' : 'en';
  const slug = slugify(input.name);
  return {
    ...c,
    id: `concept_${Date.now().toString(36)}${(seq++).toString(36)}`,
    palette: c.palette.map((p) => ({ ...p, hex: HEX.test(p.hex) ? p.hex.toUpperCase() : '#777777' })),
    logo: { ...c.logo, id: `${c.logo.style}-ai-${seq}` },
    social: { posts: c.social.posts, stories: [{ type: 'arrival', ...c.social.stories.arrival }, { type: 'poll', ...c.social.stories.poll }], hashtags: c.social.hashtags },
    card: { name: lang === 'ar' ? 'ليلى حداد' : 'Layla Haddad', title: lang === 'ar' ? 'المؤسسة' : 'Founder', phone: '+971 50 123 4567', email: `hello@${slug}.com`, web: `${slug}.com`, city: lang === 'ar' ? 'دبي، الإمارات' : 'Dubai, UAE' },
  };
}
const dataUrl = (img) => `data:${img.mime};base64,${img.b64}`;
const parseDataUrl = (u) => { const m = /^data:([^;]+);base64,(.+)$/.exec(u || ''); return m ? { mime: m[1], b64: m[2] } : null; };
const send = (res, e) => {
  console.error(e.message);
  const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
  res.status(status).json({ error: status === 503 ? e.message : status === 422 ? 'This request could not be processed. Change the wording and try again.' : 'The AI providers could not complete this request. Try again.', detail: env.NODE_ENV === 'production' ? undefined : e.message });
};

async function generateBrand(input, progress = () => {}) {
  progress(0.1);
  const out = await registry.run('text', { system: SYSTEM, prompt: brandPrompt(input), schema: BrandResult, maxTokens: 24000 }, { cacheable: true });
  progress(0.9);
  return { seed: Date.now(), brief: out.data.brief, concepts: out.data.concepts.slice(0, 3).map((c) => finishConcept(c, input)), provider: out.provider };
}

// ---- HTTP --------------------------------------------------------------------------------
const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '12mb' })); // reference images for mockups and vectorisation
const limiter = rateLimit({ perMinute: Number(env.RATE_LIMIT_PER_MIN || 20), burst: 10 });

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/providers/status', (_req, res) => res.json({
  providers: registry.status(),
  routing: Object.fromEntries(Object.keys(registry.order).map((t) => [t, registry.available(t)])),
  usage: usage.summary(), recent: usage.recent(15), cache: registry.cache.stats(), jobs: jobs.stats(),
}));

// Background job: full brand generation (strategy, three concepts, logos, copy).
app.post('/api/jobs', requireUser, limiter, (req, res) => {
  const { type, input } = req.body ?? {};
  if (type !== 'brand') return res.status(400).json({ error: 'Unknown job type.' });
  const parsed = BriefInput.safeParse(input);
  if (!parsed.success) return res.status(400).json({ error: 'The brief is missing a name, category or personality.' });
  const job = jobs.create('brand', ({ progress }) => generateBrand(parsed.data, progress), req.user?.id);
  res.status(202).json({ jobId: job.id });
});
app.get('/api/jobs/:id', requireUser, (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || (job.owner && job.owner !== req.user?.id)) return res.status(404).json({ error: 'Job not found.' });
  res.json(jobs.public(job));
});

// Synchronous version for scripts and simple clients.
app.post('/api/brands/generate', requireUser, limiter, async (req, res) => {
  const parsed = BriefInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'The brief is missing a name, category or personality.' });
  try { res.json(await generateBrand(parsed.data)); } catch (e) { send(res, e); }
});

app.post('/api/logos/directions', requireUser, limiter, async (req, res) => {
  const { input, direction, count = 6 } = req.body ?? {};
  if (!input?.name || !direction) return res.status(400).json({ error: 'Send the brief and a direction.' });
  try {
    const out = await registry.run('text', { system: SYSTEM, prompt: directionsPrompt(input, direction, Math.min(9, count)), schema: LogoList, maxTokens: 6000, effort: 'low' });
    res.json({ logos: out.data.logos.map((l, i) => ({ ...l, id: `${l.style}-ai-${Date.now().toString(36)}-${i}` })), provider: out.provider });
  } catch (e) { send(res, e); }
});

app.post('/api/logos/refine', requireUser, limiter, async (req, res) => {
  const { input, logo, request } = req.body ?? {};
  if (!input?.name || !logo || !request?.trim()) return res.status(400).json({ error: 'Send the brief, the logo and what to change.' });
  try {
    const out = await registry.run('text', { system: SYSTEM, prompt: refinePrompt(input, logo, request.slice(0, 500)), schema: LogoPatch, maxTokens: 3000, effort: 'low' });
    res.json({ ...out.data, provider: out.provider });
  } catch (e) { send(res, e); }
});

// Custom symbol: image model draws a flat symbol, then it is vectorised into clean SVG paths.
app.post('/api/images/symbol', requireUser, limiter, async (req, res) => {
  const { input, idea, direction } = req.body ?? {};
  if (!input?.name || !idea) return res.status(400).json({ error: 'Describe the symbol you want.' });
  try {
    const img = await registry.run('image', { prompt: symbolPrompt({ input, idea: idea.slice(0, 300), direction }), size: '1024x1024' });
    const vec = await registry.run('vector', { b64: img.image.b64, mime: img.image.mime }, { cacheable: true });
    res.json({ preview: dataUrl(img.image), custom: { d: vec.d, viewBox: vec.viewBox }, providers: { image: img.provider, vector: vec.provider } });
  } catch (e) { send(res, e); }
});

// Photo mockup: the real logo is sent as a reference image so the model places it, not redraws it.
app.post('/api/images/mockup', requireUser, limiter, async (req, res) => {
  const { input, scene, palette, tagline, logoPng } = req.body ?? {};
  const ref = parseDataUrl(logoPng);
  if (!input?.name || !ref) return res.status(400).json({ error: 'Send the brief and the logo image.' });
  try {
    const out = await registry.run('edit', { prompt: mockupPrompt({ input, scene, palette, tagline }), images: [ref], size: '1536x1024' });
    res.json({ image: dataUrl(out.image), provider: out.provider });
  } catch (e) { send(res, e); }
});

app.post('/api/images/edit', requireUser, limiter, async (req, res) => {
  const { image, prompt } = req.body ?? {};
  const ref = parseDataUrl(image);
  if (!ref || !prompt) return res.status(400).json({ error: 'Send an image and the change you want.' });
  try {
    const out = await registry.run('edit', { prompt: prompt.slice(0, 1000), images: [ref] });
    res.json({ image: dataUrl(out.image), provider: out.provider });
  } catch (e) { send(res, e); }
});

app.post('/api/vectorize', requireUser, limiter, async (req, res) => {
  const ref = parseDataUrl(req.body?.image);
  if (!ref) return res.status(400).json({ error: 'Send a PNG or JPG as a data URL.' });
  try {
    const out = await registry.run('vector', { ...ref, threshold: req.body.threshold }, { cacheable: true });
    res.json({ svg: out.svg, d: out.d, viewBox: out.viewBox, provider: out.provider });
  } catch (e) { send(res, e); }
});

app.get('/api/fonts', async (req, res) => {
  try {
    const out = await registry.run('fonts', { category: req.query.category, script: req.query.script }, { cacheable: true });
    res.json({ fonts: out.fonts, source: out.model });
  } catch (e) { send(res, e); }
});

export { app, registry, usage, jobs };

if (process.argv[1]?.endsWith('index.js')) {
  const PORT = env.PORT || 8787;
  app.listen(PORT, () => {
    console.log(`BRANDORA API on http://localhost:${PORT}`);
    for (const t of ['text', 'image', 'edit', 'vector']) console.log(`  ${t.padEnd(6)} → ${registry.available(t).join(', ') || 'no provider configured'}`);
  });
}
