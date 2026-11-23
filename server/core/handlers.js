// The AI tasks, independent of the web framework. Express (server/index.js) and Netlify
// Functions (netlify/functions) call these with the same inputs and get the same results.
import { BrandResult, LogoList, LogoPatch, BriefInput, IgIdeas, IgInput, normalizeLogo, normalizeFonts } from '../lib/schemas.js';
import { SYSTEM, brandPrompt, directionsPrompt, refinePrompt, mockupPrompt, symbolPrompt, igPrompt } from '../lib/prompts.js';

// Anthropic's SDK refuses non-streaming requests that could run past 10 minutes (about 21,000 output tokens or more),
// so keep every request below that.
export const BRAND_MAX_TOKENS = 16000;

export class InputError extends Error { constructor(m) { super(m); this.status = 400; } }

const HEX = /^#[0-9A-F]{6}$/i;
const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'brand';
const dataUrl = (img) => `data:${img.mime};base64,${img.b64}`;
export const parseDataUrl = (u) => { const m = /^data:([^;]+);base64,(.+)$/.exec(u || ''); return m ? { mime: m[1], b64: m[2] } : null; };
let seq = 0;

function finishConcept(c, input) {
  const lang = input.language === 'ar' ? 'ar' : 'en';
  const slug = slugify(input.name);
  seq++;
  return {
    ...c,
    id: `concept_${Date.now().toString(36)}${seq.toString(36)}`,
    palette: c.palette.map((p) => ({ ...p, hex: HEX.test(p.hex) ? p.hex.toUpperCase() : '#777777' })),
    fonts: normalizeFonts(c.fonts),
    logo: { ...normalizeLogo(c.logo), id: `${normalizeLogo(c.logo).style}-ai-${Date.now().toString(36)}${seq}` },
    social: { posts: c.social.posts, stories: [{ type: 'arrival', ...c.social.stories.arrival }, { type: 'poll', ...c.social.stories.poll }], hashtags: c.social.hashtags },
    card: { name: lang === 'ar' ? 'ليلى حداد' : 'Layla Haddad', title: lang === 'ar' ? 'المؤسسة' : 'Founder', phone: '+971 50 123 4567', email: `hello@${slug}.com`, web: `${slug}.com`, city: lang === 'ar' ? 'دبي، الإمارات' : 'Dubai, UAE' },
  };
}

export function createHandlers(registry) {
  return {
    /** Creative brief + three concepts. */
    async brand(payload, progress = () => {}) {
      const parsed = BriefInput.safeParse(payload.input ?? payload);
      if (!parsed.success) throw new InputError('The brief is missing a name, category or personality.');
      const input = parsed.data;
      progress(0.1);
      const out = await registry.run('text', { system: SYSTEM, prompt: brandPrompt(input), schema: BrandResult, maxTokens: BRAND_MAX_TOKENS }, { cacheable: true });
      progress(0.95);
      return { seed: Date.now(), brief: out.data.brief, concepts: out.data.concepts.slice(0, 3).map((c) => finishConcept(c, input)), provider: out.provider };
    },
    async directions({ input, direction, count = 6 }) {
      if (!input?.name || !direction) throw new InputError('Send the brief and a direction.');
      const out = await registry.run('text', { system: SYSTEM, prompt: directionsPrompt(input, direction, Math.min(9, count)), schema: LogoList, maxTokens: 6000, effort: 'low' });
      return { logos: out.data.logos.map((l) => normalizeLogo(l)).map((l, i) => ({ ...l, id: `${l.style}-ai-${Date.now().toString(36)}-${i}` })), provider: out.provider };
    },
    async refine({ input, logo, request }) {
      if (!input?.name || !logo || !request?.trim()) throw new InputError('Send the brief, the logo and what to change.');
      const out = await registry.run('text', { system: SYSTEM, prompt: refinePrompt(input, logo, request.slice(0, 500)), schema: LogoPatch, maxTokens: 3000, effort: 'low' });
      // The model returns the whole updated logo (it skips fields in partial patches); send only what changed.
      const next = normalizeLogo(out.data.logo, false, logo);
      const patch = Object.fromEntries(Object.entries(next).filter(([key, v]) => key !== 'id' && v !== logo[key]));
      return { patch, applied: out.data.applied, note: out.data.note, provider: out.provider };
    },
    /** Image model draws a flat symbol, then it is vectorised into one clean SVG path. */
    async symbol({ input, idea, direction }) {
      if (!input?.name || !idea) throw new InputError('Describe the symbol you want.');
      const img = await registry.run('image', { prompt: symbolPrompt({ input, idea: idea.slice(0, 300), direction }), size: '1024x1024' });
      const vec = await registry.run('vector', { b64: img.image.b64, mime: img.image.mime }, { cacheable: true });
      return { custom: { d: vec.d, viewBox: vec.viewBox }, providers: { image: img.provider, vector: vec.provider } };
    },
    /** Photo mockup with the real logo as the reference image. */
    async mockup({ input, scene, palette, tagline, logoPng }) {
      const ref = parseDataUrl(logoPng);
      if (!input?.name || !ref) throw new InputError('Send the brief and the logo image.');
      const out = await registry.run('edit', { prompt: mockupPrompt({ input, scene, palette, tagline }), images: [ref], size: '1536x1024', format: 'jpeg' });
      return { image: dataUrl(out.image), provider: out.provider };
    },
    async edit({ image, prompt }) {
      const ref = parseDataUrl(image);
      if (!ref || !prompt) throw new InputError('Send an image and the change you want.');
      const out = await registry.run('edit', { prompt: prompt.slice(0, 1000), images: [ref] });
      return { image: dataUrl(out.image), provider: out.provider };
    },
    async vectorize({ image, threshold }) {
      const ref = parseDataUrl(image);
      if (!ref) throw new InputError('Send a PNG or JPG as a data URL.');
      const out = await registry.run('vector', { ...ref, threshold }, { cacheable: true });
      return { svg: out.svg, d: out.d, viewBox: out.viewBox, provider: out.provider };
    },
    /** Three post ideas for an Instagram account, from its profile and recent captions (the client sends them; no token reaches this code). */
    async instagram(payload, progress = () => {}) {
      const parsed = IgInput.safeParse(payload);
      if (!parsed.success) throw new InputError('Connect an Instagram account first, then ask for ideas.');
      progress(0.15);
      const out = await registry.run('text', { system: SYSTEM, prompt: igPrompt(parsed.data), schema: IgIdeas, maxTokens: 6000, effort: 'medium' });
      progress(0.95);
      return { ...out.data, ideas: out.data.ideas.slice(0, 3), provider: out.provider };
    },
    async fonts({ category, script } = {}) {
      const out = await registry.run('fonts', { category, script }, { cacheable: true });
      return { fonts: out.fonts, source: out.model };
    },
  };
}

/** Job types that run in the background (long AI calls). */
export const JOB_TYPES = ['brand', 'directions', 'refine', 'symbol', 'mockup', 'edit', 'instagram'];

/** A message that is safe to show users; provider details stay in the logs. */
export function publicError(e) {
  if (e.status === 400 || e.status === 401 || e.status === 503) return e.message;
  if (e.status === 422) return 'This request could not be processed. Change the wording and try again.';
  return 'The AI providers could not complete this request. Try again.';
}
