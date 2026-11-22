// What the language models must return. Fonts and symbols are limited to what the app can render.
import { z } from 'zod';
import { FONT_LIBRARY } from '../../src/data/fontLibrary.js';

export const MARKS = ['monogram-circle', 'monogram-square', 'monogram-split', 'hexagon', 'orbit', 'petals', 'spark', 'pillars', 'wave', 'arch', 'diamond', 'bloom', 'crescent', 'bean', 'shield',
  'star8', 'crown', 'leaf', 'drop', 'flame', 'mountain', 'sunrise', 'infinity', 'chevrons', 'mosaic', 'halves', 'prism', 'cube', 'lotus', 'bubble', 'seal',
  'heart', 'bolt', 'anchor', 'compass', 'feather', 'palm', 'knot', 'cup', 'house', 'initials', 'mascot-fox', 'mascot-owl', 'mascot-bear'];
export const DIRECTIONS = ['minimal', 'luxury', 'geometric', 'abstract', 'wordmark', 'lettermark', 'mascot', 'vintage', 'futuristic', 'streetwear', 'corporate', 'emblem'];
export const LAYOUTS = ['horizontal', 'stacked', 'icon', 'wordmark', 'crest', 'badge', 'emblem', 'box', 'corporate'];
const LATIN = FONT_LIBRARY.filter((f) => f.script === 'latin').map((f) => f.family);
const ARABIC = FONT_LIBRARY.filter((f) => f.script === 'arabic').map((f) => f.family);

const Bilingual = z.object({ en: z.string(), ar: z.string() });
const Color = z.object({ role: z.enum(['primary', 'secondary', 'accent', 'dark', 'light']), hex: z.string().describe('#RRGGBB'), name: Bilingual });
const Post = z.object({ type: z.enum(['launch', 'product', 'quote']), kicker: z.string(), headline: z.string(), sub: z.string(), cta: z.string(), caption: z.string() });

export const LogoConfig = z.object({
  style: z.enum(DIRECTIONS), mark: z.enum(MARKS), layout: z.enum(LAYOUTS),
  font: z.enum(LATIN), fontAr: z.enum(ARABIC), weight: z.number().int().describe('100-900'),
  case: z.enum(['asis', 'upper', 'lower']), tracking: z.number().describe('letter spacing in em, -0.05 to 0.45'),
  colorway: z.enum(['primary', 'accent', 'ink']), rationale: z.string().describe('one or two sentences in the brand language'),
});

export const Brief = z.object({
  objective: z.string(), insight: z.string(), positioning: z.string(),
  personality: z.array(z.string()).describe('3 adjectives'), cues: z.array(z.string()).describe('4 visual direction notes'),
  avoid: z.array(z.string()).describe('4 things to avoid'), deliverables: z.array(z.string()),
});

const Concept = z.object({
  direction: z.enum(['signature', 'contrast', 'expressive']), title: z.string(), summary: z.string(), tagline: z.string(), story: z.string(), mission: z.string(),
  values: z.array(z.string()), voice: z.object({ traits: z.array(z.string()), sample: z.string() }), match: z.number().int(),
  palette: z.array(Color).describe('exactly 5: primary, secondary, accent, dark, light'),
  fonts: z.object({ heading: z.enum(LATIN), body: z.enum(LATIN), headingAr: z.enum(ARABIC), bodyAr: z.enum(ARABIC) }),
  logo: LogoConfig,
  social: z.object({
    posts: z.array(Post).describe('3 posts: launch, product, quote'),
    stories: z.object({ arrival: z.object({ kicker: z.string(), headline: z.string(), cta: z.string() }), poll: z.object({ kicker: z.string(), headline: z.string(), a: z.string(), b: z.string() }) }),
    hashtags: z.array(z.string()),
  }),
});

export const BrandResult = z.object({ brief: Brief, concepts: z.array(Concept).describe('exactly 3: signature, contrast, expressive') });
export const LogoList = z.object({ logos: z.array(LogoConfig) });
export const LogoPatch = z.object({
  patch: LogoConfig.partial().describe('only the fields that should change'),
  applied: z.array(z.string()).describe('each change in a few words, in the language of the request'),
  note: z.string().describe('one sentence of design reasoning'),
});

export const BriefInput = z.object({
  name: z.string().trim().min(1).max(40), category: z.string(), personality: z.string(),
  audience: z.string().max(200).optional().default(''), colors: z.array(z.string()).max(3).optional().default([]),
  customColor: z.string().optional().default(''), language: z.enum(['en', 'ar']), description: z.string().max(1000).optional().default(''),
});
