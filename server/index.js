// BRANDORA API: turns a brand brief into three concepts with Claude.
// The response matches the shape of src/lib/generator.js, so the frontend
// renders it with no changes. Start with: ANTHROPIC_API_KEY=... npm start
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { createClient } from '@supabase/supabase-js';
import { CATEGORIES, PERSONALITIES } from '../src/data/options.js';

const PORT = process.env.PORT || 8787;
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

// Optional auth: when Supabase is configured, every request needs a valid user token.
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function requireUser(req, res, next) {
  if (!supabase) return next();
  const token = req.headers.authorization?.replace(/^Bearer /, '');
  const { data, error } = token ? await supabase.auth.getUser(token) : { data: null, error: true };
  if (error || !data?.user) return res.status(401).json({ error: 'Sign in to generate brands.' });
  req.user = data.user;
  next();
}

// ---- Output schema (what Claude must return) ---------------------------------
const MARKS = ['monogram-circle', 'monogram-square', 'monogram-split', 'hexagon', 'orbit', 'petals', 'spark', 'pillars', 'wave', 'arch', 'diamond', 'bloom', 'crescent', 'bean', 'shield',
  'star8', 'crown', 'leaf', 'drop', 'flame', 'mountain', 'sunrise', 'infinity', 'chevrons', 'mosaic', 'halves', 'prism', 'cube', 'lotus', 'bubble', 'seal',
  'heart', 'bolt', 'anchor', 'compass', 'feather', 'palm', 'knot', 'cup', 'house'];
const LATIN_HEADINGS = ['Playfair Display', 'Cormorant Garamond', 'Fraunces', 'Space Grotesk', 'Outfit', 'Sora', 'Unbounded', 'Syne', 'Poppins', 'Montserrat'];
const LATIN_BODY = ['Inter', 'Manrope', 'DM Sans', 'Lora'];
const ARABIC_HEADINGS = ['Amiri', 'El Messiri', 'Readex Pro', 'Lalezar', 'Reem Kufi', 'Changa', 'Cairo'];
const ARABIC_BODY = ['IBM Plex Sans Arabic', 'Tajawal', 'Almarai', 'Cairo'];

const Bilingual = z.object({ en: z.string(), ar: z.string() });
const Color = z.object({
  role: z.enum(['primary', 'secondary', 'accent', 'dark', 'light']),
  hex: z.string().describe('#RRGGBB uppercase'),
  name: Bilingual.describe('Evocative color name, e.g. { en: "Midnight Plum", ar: "برقوقي ليلي" }'),
});
const Post = z.object({
  type: z.enum(['launch', 'product', 'quote']),
  kicker: z.string(), headline: z.string(), sub: z.string(), cta: z.string(), caption: z.string(),
});
const Concept = z.object({
  direction: z.enum(['signature', 'contrast', 'expressive']),
  title: z.string().describe('Two or three word name for this creative direction'),
  summary: z.string(), tagline: z.string(), story: z.string(), mission: z.string(),
  values: z.array(z.string()).describe('Exactly 3 one-word values'),
  voice: z.object({ traits: z.array(z.string()).describe('Exactly 3 adjectives'), sample: z.string() }),
  match: z.number().int().describe('How closely this concept follows the brief, 80-98'),
  palette: z.array(Color).describe('Exactly 5 colors, one per role, in order primary, secondary, accent, dark, light'),
  fonts: z.object({
    heading: z.enum(LATIN_HEADINGS), body: z.enum(LATIN_BODY),
    headingAr: z.enum(ARABIC_HEADINGS), bodyAr: z.enum(ARABIC_BODY),
  }),
  logo: z.object({ mark: z.enum(MARKS), layout: z.enum(['horizontal', 'stacked', 'emblem']), rationale: z.string() }),
  social: z.object({
    posts: z.array(Post).describe('Exactly 3 posts: launch, product, quote'),
    stories: z.object({
      arrival: z.object({ kicker: z.string(), headline: z.string(), cta: z.string() }),
      poll: z.object({ kicker: z.string(), headline: z.string(), a: z.string(), b: z.string() }),
    }),
    hashtags: z.array(z.string()).describe('4 hashtags including the # sign'),
  }),
});
const BrandResult = z.object({ concepts: z.array(Concept).describe('Exactly 3 concepts: signature, contrast, expressive') });

const LogoResult = z.object({
  logos: z.array(z.object({ mark: z.enum(MARKS), layout: z.enum(['horizontal', 'stacked', 'emblem']), colorway: z.enum(['primary', 'accent']), rationale: z.string() })),
});

// ---- Prompts -------------------------------------------------------------------
// The system prompt never changes between requests, so it is cached.
const SYSTEM = `You are the senior brand strategist and identity designer at BRANDORA, a brand studio for founders in the Gulf and worldwide.

From a short brief you produce three distinct, production-ready brand identity concepts:
1. "signature": the most faithful reading of the brief and the client's preferred colors.
2. "contrast": a higher-contrast route built on the complement of the base color, made to stand out in feeds and on shelves.
3. "expressive": the unexpected route, with a triadic palette and a more characterful type pairing.

Write every piece of copy (title, summary, tagline, story, mission, values, voice, logo rationale, social copy, color names' primary language) in the brief's brand language. Arabic copy must read as native Modern Standard Arabic suited to marketing, not a translation. Keep the brand name exactly as given.

Design rules:
- Palettes: the primary must reach at least 4.5:1 contrast against the light color. The dark color is near-black and the light color is a near-white tint. Respect preferred colors when given; otherwise choose colors that fit the category and audience.
- Pick fonts only from the allowed lists. Pair a characterful heading face with a quiet body face.
- Pick the logo mark whose meaning best fits the brand, and explain it in one or two sentences.
- Taglines are under 6 words. Stories are 3 to 4 sentences. Captions are 1 to 3 sentences. Avoid clichés such as "elevate", "unleash" and "journey".`;

const briefText = (input) => {
  const cat = CATEGORIES.find((c) => c.id === input.category);
  const per = PERSONALITIES.find((p) => p.id === input.personality);
  return [
    `Brand name: ${input.name}`,
    `Category: ${cat?.en ?? input.category}`,
    `Target audience: ${input.audience || 'not specified'}`,
    `Personality: ${per?.en ?? input.personality} (${per?.desc.en ?? ''})`,
    `Preferred colors: ${[...(input.colors || []), input.customColor].filter(Boolean).join(', ') || 'none, suggest colors'}`,
    `Brand language: ${input.language === 'ar' ? 'Arabic' : 'English'}`,
    input.description ? `Notes from the founder: ${input.description}` : '',
  ].filter(Boolean).join('\n');
};

// ---- Claude calls ------------------------------------------------------------
async function askClaude(userText, format) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default', // if a safety classifier declines, Anthropic re-runs on its recommended fallback model
    output_config: { effort: 'medium', format },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userText }],
  });
  if (response.stop_reason === 'refusal') {
    const err = new Error('This brief could not be processed. Change the wording and try again.');
    err.status = 422;
    throw err;
  }
  if (response.stop_reason === 'max_tokens' || !response.parsed_output) {
    const err = new Error('The generated brand was incomplete. Try again.');
    err.status = 502;
    throw err;
  }
  return response.parsed_output;
}

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
    social: { posts: c.social.posts, stories: [{ type: 'arrival', ...c.social.stories.arrival }, { type: 'poll', ...c.social.stories.poll }], hashtags: c.social.hashtags },
    card: {
      name: lang === 'ar' ? 'ليلى حداد' : 'Layla Haddad',
      title: lang === 'ar' ? 'المؤسسة' : 'Founder',
      phone: '+971 50 123 4567', email: `hello@${slug}.com`, web: `${slug}.com`, city: lang === 'ar' ? 'دبي، الإمارات' : 'Dubai, UAE',
    },
  };
}

function sendError(res, e) {
  console.error(e);
  if (e instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'The studio is busy. Try again in a minute.' });
  if (e instanceof Anthropic.AuthenticationError) return res.status(500).json({ error: 'The AI service is not configured. Check ANTHROPIC_API_KEY on the server.' });
  if (e instanceof Anthropic.APIConnectionError) return res.status(503).json({ error: 'The AI service could not be reached. Try again.' });
  if (e instanceof Anthropic.APIError) return res.status(502).json({ error: 'The AI service returned an error. Try again.' });
  res.status(e.status && e.status < 600 ? e.status : 500).json({ error: e.message || 'Generation failed.' });
}

// ---- HTTP --------------------------------------------------------------------
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '200kb' }));

const BriefInput = z.object({
  name: z.string().trim().min(1).max(40),
  category: z.string(), personality: z.string(),
  audience: z.string().max(200).optional().default(''),
  colors: z.array(z.string()).max(3).optional().default([]),
  customColor: z.string().optional().default(''),
  language: z.enum(['en', 'ar']),
  description: z.string().max(1000).optional().default(''),
});

app.post('/api/brands/generate', requireUser, async (req, res) => {
  const parsed = BriefInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'The brief is missing a name, category or personality.' });
  try {
    const out = await askClaude(briefText(parsed.data), betaZodOutputFormat(BrandResult));
    res.json({ seed: Date.now(), concepts: out.concepts.slice(0, 3).map((c) => finishConcept(c, parsed.data)) });
  } catch (e) {
    sendError(res, e);
  }
});

app.post('/api/logos/generate', requireUser, async (req, res) => {
  const { concept, input } = req.body ?? {};
  if (!concept || !input) return res.status(400).json({ error: 'Send the concept and the brief.' });
  try {
    const text = `${briefText(input)}\n\nCurrent concept: "${concept.title}" with the "${concept.logo?.mark}" mark.\nPropose 9 alternative logo directions using other marks. Write each rationale in the brand language.`;
    const out = await askClaude(text, betaZodOutputFormat(LogoResult));
    res.json({ logos: out.logos.slice(0, 9) });
  } catch (e) {
    sendError(res, e);
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL }));

app.listen(PORT, () => console.log(`BRANDORA API on http://localhost:${PORT}`));
