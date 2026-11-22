// Sample brand engine. It produces the same JSON shape the real AI backend returns
// (see services/ai.js), so the UI does not change when you switch to live models.
import { createRng, hashString, uid } from './random';
import { hslToHex, hexToHsl, clamp, wrapHue, colorName, contrastRatio } from './color';
import { findCategory, findPersonality, COLOR_FAMILIES, PERSONALITIES } from '../data/options';
import { TAGLINES, DIRECTIONS, VALUES, VOICE, MARK_RATIONALE, SOCIAL, SOCIAL_EXTRA, CARD_PEOPLE } from './copy';

export const MARKS = ['monogram-circle', 'monogram-square', 'monogram-split', 'hexagon', 'orbit', 'petals', 'spark', 'pillars', 'wave', 'arch', 'diamond', 'bloom', 'crescent', 'bean', 'shield',
  'star8', 'crown', 'leaf', 'drop', 'flame', 'mountain', 'sunrise', 'infinity', 'chevrons', 'mosaic', 'halves', 'prism', 'cube', 'lotus', 'bubble', 'seal',
  'heart', 'bolt', 'anchor', 'compass', 'feather', 'palm', 'knot', 'cup', 'house'];
export const LAYOUTS = ['horizontal', 'stacked'];

const ARABIC_RE = /[؀-ۿ]/;
export const isArabicText = (s = '') => ARABIC_RE.test(s);

const TRANSLIT = { ا: 'a', أ: 'a', إ: 'i', آ: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'h', خ: 'kh', د: 'd', ذ: 'th', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 's', ض: 'd', ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', ة: 'a', و: 'w', ي: 'y', ى: 'a', ء: '', ئ: 'e', ؤ: 'o' };
export function slugify(name) {
  const latin = name.split('').map((c) => TRANSLIT[c] ?? c).join('');
  return latin.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'brand';
}

export const initialOf = (name = '') => {
  const ch = name.trim().charAt(0);
  return isArabicText(ch) ? ch : ch.toUpperCase() || 'B';
};

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

function baseHues(input, category, rng) {
  const fams = (input.colors || []).map((id) => COLOR_FAMILIES.find((f) => f.id === id)).filter(Boolean);
  const hues = [];
  if (input.customColor) hues.push({ hue: hexToHsl(input.customColor).h, custom: input.customColor });
  fams.forEach((f) => hues.push({ hue: f.hue + rng.range(-6, 6), mono: f.mono, earthy: f.earthy }));
  if (!hues.length) hues.push({ hue: category.hue + rng.range(-10, 10) });
  return hues;
}

function buildPalette(direction, ctx) {
  const { personality: p, hues, rng } = ctx;
  const main = hues[0];
  const second = hues[1];
  const H = main.hue;
  let s = rng.range(...p.sat);
  let l = rng.range(...p.light);
  if (main.earthy) s *= 0.6;
  const gold = hslToHex(40 + rng.range(-4, 6), 0.55, 0.62);
  let primary, secondary, accent, dark, light;

  if (main.mono) {
    primary = hslToHex(H, 0.12, direction === 'expressive' ? 0.16 : 0.1);
    secondary = hslToHex(H, 0.06, 0.55);
    accent = second ? hslToHex(second.hue, 0.7, 0.55) : direction === 'contrast' ? hslToHex(H + 100, 0.65, 0.55) : gold;
    dark = '#0E0E11';
    light = hslToHex(40, 0.2, 0.96);
  } else if (direction === 'signature') {
    primary = main.custom || hslToHex(H, s, clamp(l, 0.16, 0.56));
    secondary = hslToHex(H + 28, s * 0.7, clamp(l + 0.28, 0.6, 0.85));
    accent = p.accentGold ? gold : second ? hslToHex(second.hue, 0.7, 0.58) : hslToHex(H - 38, clamp(s + 0.15), 0.6);
    dark = hslToHex(H, 0.3, 0.09);
    light = hslToHex(H, 0.35, 0.965);
  } else if (direction === 'contrast') {
    primary = hslToHex(H, clamp(s * 0.95), clamp(l * 0.8, 0.14, 0.45));
    accent = second ? hslToHex(second.hue + 8, 0.75, 0.56) : hslToHex(H + 180, clamp(s + 0.2, 0.55, 0.9), 0.56);
    secondary = hslToHex(H, 0.22, 0.78);
    dark = hslToHex(H + 180, 0.18, 0.08);
    light = hslToHex(38, 0.4, 0.95);
  } else {
    const shift = second ? second.hue - H : -42;
    primary = hslToHex(H + shift * 0.5, clamp(s + 0.12, 0.4, 0.92), clamp(l + 0.06, 0.25, 0.55));
    secondary = hslToHex(H + 120, 0.55, 0.74);
    accent = hslToHex(H + 240, 0.8, 0.6);
    dark = hslToHex(H + shift * 0.5, 0.15, 0.1);
    light = hslToHex(H + 120, 0.3, 0.96);
  }
  // Keep the primary usable for logos on a light background.
  if (contrastRatio(primary, light) < 3) {
    const hsl = hexToHsl(primary);
    primary = hslToHex(hsl.h, hsl.s, Math.max(0.12, hsl.l - 0.2));
  }
  return [
    ['primary', primary], ['secondary', secondary], ['accent', accent], ['dark', dark], ['light', light],
  ].map(([role, hex]) => ({ role, hex, name: colorName(hex) }));
}

function fontsFor(direction, personality, rng) {
  if (direction === 'expressive') {
    const other = rng.pick(PERSONALITIES.filter((x) => x.id !== personality.id && x.id !== 'minimal'));
    return { heading: other.heading[0], body: personality.body[1], headingAr: other.headingAr[0], bodyAr: personality.bodyAr[0] };
  }
  const i = direction === 'signature' ? 0 : 1;
  return { heading: personality.heading[i], body: personality.body[i], headingAr: personality.headingAr[i], bodyAr: personality.bodyAr[i] };
}

export function buildSocial(lang, vars) {
  const s = SOCIAL[lang];
  const f = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? fill(v, vars) : v]));
  const tagSlug = vars.slug;
  const hashtags = lang === 'ar'
    ? [`#${vars.name.replace(/\s+/g, '_')}`, '#علامة_تجارية', '#جديد', `#${vars.nounTag}`]
    : [`#${tagSlug}`, `#${vars.nounTag}`, '#newlaunch', '#smallbusiness'];
  return {
    posts: [
      { type: 'launch', ...f(s.launch), caption: fill(s.captions[0], vars) },
      { type: 'product', ...f(s.product), caption: fill(s.captions[1], vars) },
      { type: 'quote', ...f(s.quote), caption: fill(s.captions[2], vars) },
    ],
    stories: [{ type: 'arrival', ...f(s.arrival) }, { type: 'poll', ...f(s.poll) }],
    hashtags,
  };
}

export function generateConcepts(input, seed = Date.now()) {
  const rng = createRng(hashString(`${input.name}|${input.category}|${input.personality}|${seed}`));
  const category = findCategory(input.category);
  const personality = findPersonality(input.personality);
  const lang = input.language === 'ar' ? 'ar' : 'en';
  const hues = baseHues(input, category, rng);
  const ctx = { personality, hues, rng };
  const audience = input.audience?.trim() || (lang === 'ar' ? 'جمهورك' : 'your audience');
  const marks = rng.shuffle([...new Set([...category.marks, ...rng.shuffle(MARKS).slice(0, 3)])]);
  const taglines = rng.shuffle(TAGLINES[personality.id][lang]);
  const slug = slugify(input.name);
  const vars = {
    name: input.name, noun: category.noun[lang], product: category.product[lang], audience,
    personality: personality[lang], slug, nounTag: category.noun.en.normalize('NFD').replace(/[^A-Za-z]/g, ''),
  };
  const directions = ['signature', 'contrast', 'expressive'];
  return directions.map((dir, i) => {
    const d = DIRECTIONS[dir];
    const palette = buildPalette(dir, ctx);
    const fonts = fontsFor(dir, personality, rng);
    const mark = marks[i % marks.length];
    const tagline = fill(taglines[i % taglines.length], vars);
    const values = rng.shuffle(VALUES[personality.id]).slice(0, 3);
    const person = CARD_PEOPLE[lang][i % 3];
    return {
      id: uid('concept'),
      direction: dir,
      title: d.titles[personality.id][lang],
      summary: fill(d.summary[lang], vars),
      tagline,
      story: fill(d.story[lang], vars),
      mission: fill(d.mission[lang], vars),
      values: values.map((v) => v[lang]),
      voice: { traits: VOICE[personality.id].traits.map((t) => t[lang]), sample: VOICE[personality.id].sample[lang] },
      match: Math.round(97 - i * rng.range(2, 4.5)),
      palette,
      fonts,
      logo: { mark, layout: i === 1 ? 'stacked' : 'horizontal', rationale: MARK_RATIONALE[mark][lang] },
      social: buildSocial(lang, { ...vars, tagline, taglineBare: tagline.replace(/[.。]$/, '') }),
      card: { ...person, phone: '+971 50 123 4567', email: `hello@${slug}.com`, web: `${slug}.com`, city: lang === 'ar' ? 'دبي، الإمارات' : 'Dubai, UAE' },
    };
  });
}

// Extra logo explorations for one concept: different marks and layouts on the same palette.
export function generateLogoVariants(concept, seed) {
  const rng = createRng(hashString(`${concept.id}|${seed}`));
  const lang = isArabicText(concept.title) ? 'ar' : 'en';
  const picks = rng.shuffle(MARKS.filter((m) => m !== concept.logo.mark)).slice(0, 9);
  return picks.map((mark, i) => ({
    mark,
    layout: ['horizontal', 'stacked', 'emblem'][i % 3],
    colorway: i % 2 === 0 ? 'primary' : 'accent',
    rationale: MARK_RATIONALE[mark][lang],
  }));
}

export function extraSocial(project, concept) {
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const cat = findCategory(project.input.category);
  const vars = { name: project.input.name, product: cat.product[lang] };
  const t = SOCIAL_EXTRA[lang];
  const f = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => fill(x, vars)) : fill(v, vars)]));
  return {
    posts: [{ type: 'testimonial', ...f(t.testimonial) }, { type: 'sale', ...f(t.sale) }, { type: 'tips', ...f(t.tips) }],
    stories: [{ type: 'sale', ...f(t.sale) }],
  };
}

export const GENERATION_STEPS = {
  en: ['Reading your brief', 'Mapping the category', 'Composing color palettes', 'Pairing typefaces', 'Drawing logo marks', 'Writing brand story', 'Designing social & print assets'],
  ar: ['قراءة طلبك', 'تحليل الفئة والمنافسين', 'تركيب لوحات الألوان', 'اختيار أزواج الخطوط', 'رسم رموز الشعار', 'كتابة قصة العلامة', 'تصميم منشورات التواصل والمطبوعات'],
};

export { wrapHue };
