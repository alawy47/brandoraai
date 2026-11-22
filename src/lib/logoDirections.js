// Twelve logo directions. Each one changes the construction (symbol type, typeface family,
// case, tracking, lockup and colour treatment), not just the colour or the font.
import { createRng, hashString } from './random';
import { MARK_RATIONALE } from './copy';
import { findCategory } from '../data/options';
import { isArabicText } from './generator';

export const DIRECTIONS = [
  { id: 'minimal', en: 'Minimalist', ar: 'بسيط', idea: { en: 'A light, lowercase wordmark with generous spacing and a quiet symbol. Calm and confident.', ar: 'كلمة بحروف صغيرة ومسافات واسعة مع رمز هادئ. سكينة وثقة.' },
    marks: ['orbit', 'halves', 'drop', 'arch', 'leaf', 'spark', 'infinity'], fonts: ['Jost', 'Josefin Sans', 'Questrial', 'Tenor Sans', 'Raleway'], fontsAr: ['Readex Pro', 'Alexandria', 'Harmattan'],
    weight: 400, case: 'lower', tracking: 0.14, layout: 'horizontal', colorways: ['ink', 'primary'] },
  { id: 'luxury', en: 'Luxury', ar: 'فاخر', idea: { en: 'A framed crest above widely spaced capitals, finished with hairline rules. Made for embossing and foil.', ar: 'شعار داخل إطار فوق حروف كبيرة متباعدة مع خطوط رفيعة. مصمم للطباعة البارزة والتذهيب.' },
    marks: ['initials', 'crown', 'diamond', 'star8', 'crescent', 'arch'], fonts: ['Cinzel', 'Bodoni Moda', 'Cormorant Garamond', 'Italiana', 'Marcellus', 'Gilda Display'], fontsAr: ['Amiri', 'El Messiri', 'Aref Ruqaa'],
    weight: 500, case: 'upper', tracking: 0.32, layout: 'crest', colorways: ['ink'] },
  { id: 'geometric', en: 'Modern geometric', ar: 'هندسي حديث', idea: { en: 'A symbol built from circles and squares on a strict grid, paired with a geometric sans.', ar: 'رمز مبني من دوائر ومربعات على شبكة دقيقة مع خط هندسي حديث.' },
    marks: ['mosaic', 'cube', 'prism', 'hexagon', 'chevrons', 'halves'], fonts: ['Outfit', 'Urbanist', 'Lexend', 'League Spartan', 'Red Hat Display', 'Kumbh Sans'], fontsAr: ['Noto Kufi Arabic', 'Kufam', 'Reem Kufi'],
    weight: 700, case: 'asis', tracking: -0.01, layout: 'horizontal', colorways: ['primary', 'accent'] },
  { id: 'abstract', en: 'Abstract symbol', ar: 'رمز تجريدي', idea: { en: 'A non-literal symbol that carries an idea (connection, flow, balance) and can stand alone as an icon.', ar: 'رمز غير مباشر يحمل فكرة (ترابط، انسياب، توازن) ويعمل وحده كأيقونة.' },
    marks: ['knot', 'halves', 'infinity', 'wave', 'orbit', 'petals', 'bloom'], fonts: ['Plus Jakarta Sans', 'Manrope', 'Figtree', 'Onest', 'Albert Sans'], fontsAr: ['IBM Plex Sans Arabic', 'Cairo', 'Mada'],
    weight: 600, case: 'asis', tracking: -0.02, layout: 'horizontal', colorways: ['primary', 'accent'] },
  { id: 'wordmark', en: 'Wordmark', ar: 'شعار نصي', idea: { en: 'The name alone, made ownable with one device: an accent dot, a coloured final letter or a swash.', ar: 'الاسم وحده، مميز بلمسة واحدة: نقطة ملونة أو حرف أخير بلون مختلف أو خط انسيابي.' },
    marks: ['monogram-circle'], fonts: ['DM Serif Display', 'Fraunces', 'Young Serif', 'Gloock', 'Syne', 'Instrument Serif'], fontsAr: ['El Messiri', 'Lemonada', 'Aref Ruqaa'],
    weight: 700, case: 'lower', tracking: -0.02, layout: 'wordmark', accents: ['dot', 'lastLetter', 'underline'], colorways: ['primary'] },
  { id: 'lettermark', en: 'Lettermark', ar: 'حروف أولى', idea: { en: 'Interlocking initials inside a ring, a compact monogram for labels, tags and app icons.', ar: 'حروف أولى متداخلة داخل حلقة، مونوغرام مدمج للملصقات والبطاقات وأيقونات التطبيقات.' },
    marks: ['initials'], fonts: ['Playfair Display', 'Bodoni Moda', 'Cinzel', 'Montserrat', 'Archivo Black'], fontsAr: ['Reem Kufi', 'Amiri', 'Aref Ruqaa'],
    weight: 700, case: 'upper', tracking: 0.18, layout: 'stacked', colorways: ['primary', 'ink'] },
  { id: 'mascot', en: 'Mascot', ar: 'شخصية', idea: { en: 'A friendly geometric character built from simple shapes, so it still reads at small sizes.', ar: 'شخصية ودودة مبنية من أشكال بسيطة لتبقى واضحة حتى بالأحجام الصغيرة.' },
    marks: ['mascot-fox', 'mascot-owl', 'mascot-bear'], fonts: ['Fredoka', 'Baloo 2', 'Nunito', 'Chewy', 'Varela Round'], fontsAr: ['Baloo Bhaijaan 2', 'Marhey', 'Lemonada'],
    weight: 700, case: 'asis', tracking: 0, layout: 'stacked', colorways: ['primary', 'accent'] },
  { id: 'vintage', en: 'Vintage & retro', ar: 'كلاسيكي وريترو', idea: { en: 'A stamped badge with the name on the arc and a founding line below, inspired by old labels and enamel signs.', ar: 'ختم دائري بالاسم على القوس وسطر التأسيس في الأسفل، مستوحى من الملصقات واللوحات القديمة.' },
    marks: ['star8', 'anchor', 'cup', 'crown', 'mountain', 'compass', 'sunrise'], fonts: ['Rye', 'Bitter', 'Alfa Slab One', 'Playfair Display SC', 'Ultra', 'Zilla Slab'], fontsAr: ['Rakkas', 'Reem Kufi', 'Aref Ruqaa'],
    weight: 700, case: 'upper', tracking: 0.1, layout: 'badge', colorways: ['primary', 'ink'] },
  { id: 'futuristic', en: 'Futuristic', ar: 'مستقبلي', idea: { en: 'Extended capitals with wide tracking and a sharp, directional symbol. Built for screens and motion.', ar: 'حروف كبيرة ممتدة بمسافات واسعة ورمز حاد يدل على الاتجاه. مصمم للشاشات والحركة.' },
    marks: ['chevrons', 'bolt', 'orbit', 'prism', 'cube'], fonts: ['Michroma', 'Orbitron', 'Audiowide', 'Oxanium', 'Exo 2', 'Syncopate'], fontsAr: ['Lalezar', 'Kufam', 'Changa'],
    weight: 700, case: 'upper', tracking: 0.22, layout: 'horizontal', colorways: ['accent', 'primary'] },
  { id: 'streetwear', en: 'Fashion & streetwear', ar: 'أزياء وستريت وير', idea: { en: 'A heavy, slanted box logo that works as a print on tees, caps and tote bags.', ar: 'شعار صندوقي عريض ومائل يعمل كطبعة على القمصان والقبعات والحقائب.' },
    marks: ['bolt', 'flame', 'spark', 'crown', 'knot'], fonts: ['Anton', 'Bebas Neue', 'Archivo Black', 'Big Shoulders Display', 'Six Caps'], fontsAr: ['Lalezar', 'Rakkas', 'Blaka'],
    weight: 800, case: 'upper', tracking: 0.02, layout: 'box', colorways: ['primary', 'ink', 'accent'] },
  { id: 'corporate', en: 'Corporate & tech', ar: 'مؤسسي وتقني', idea: { en: 'A sturdy symbol and a neutral sans with a descriptor line. Reads clearly in reports, apps and on signage.', ar: 'رمز متين وخط محايد مع سطر وصفي. واضح في التقارير والتطبيقات واللافتات.' },
    marks: ['shield', 'pillars', 'hexagon', 'chevrons', 'compass', 'monogram-square'], fonts: ['IBM Plex Sans', 'Source Sans 3', 'Inter', 'Work Sans', 'Sora'], fontsAr: ['IBM Plex Sans Arabic', 'Tajawal', 'Almarai'],
    weight: 600, case: 'asis', tracking: 0, layout: 'corporate', colorways: ['primary'] },
  { id: 'emblem', en: 'Creative emblem', ar: 'شعار دائري إبداعي', idea: { en: 'A circular emblem with the name set on the arc. A seal of quality for packaging and storefronts.', ar: 'شعار دائري بالاسم على القوس. ختم جودة للتغليف وواجهات المتاجر.' },
    marks: ['seal', 'star8', 'compass', 'sunrise', 'leaf', 'crown', 'palm'], fonts: ['Cinzel', 'Montserrat', 'Bitter', 'Josefin Sans'], fontsAr: ['Reem Kufi', 'Cairo', 'El Messiri'],
    weight: 600, case: 'upper', tracking: 0.12, layout: 'emblem', colorways: ['primary', 'ink'] },
];

export const findDirection = (id) => DIRECTIONS.find((d) => d.id === id);

const MASCOT_FOR = { coffee: 'mascot-bear', restaurant: 'mascot-bear', ecommerce: 'mascot-bear', fitness: 'mascot-bear', education: 'mascot-owl', finance: 'mascot-owl', tech: 'mascot-fox', agency: 'mascot-fox', fashion: 'mascot-fox' };

function rationale(dir, mark, lang) {
  const markLine = MARK_RATIONALE[mark]?.[lang];
  return [dir.idea[lang], mark !== 'initials' && dir.id !== 'wordmark' && markLine ? markLine : ''].filter(Boolean).join(' ');
}

/** One logo config for a direction. `n` picks the variation within it. */
export function logoForDirection(dirId, project, n = 0) {
  const dir = findDirection(dirId);
  const rng = createRng(hashString(`${project.id || project.input.name}|${dirId}|${n}`));
  const lang = project.input.language === 'ar' ? 'ar' : 'en';
  const cat = findCategory(project.input.category);
  // Prefer symbols that belong to the category, then fall back to the direction's own set.
  const relevant = dir.marks.filter((m) => cat.marks.includes(m));
  let mark = n === 0 && relevant.length ? relevant[0] : rng.pick(dir.marks);
  if (dir.id === 'mascot' && n === 0) mark = MASCOT_FOR[project.input.category] || 'mascot-fox';
  const font = n === 0 ? dir.fonts[0] : rng.pick(dir.fonts);
  const fontAr = n === 0 ? dir.fontsAr[0] : rng.pick(dir.fontsAr);
  return {
    id: `${dirId}-${n}`,
    style: dirId,
    mark,
    layout: dir.layout,
    font,
    fontAr,
    weight: dir.weight,
    case: dir.case,
    tracking: dir.tracking,
    accent: dir.accents ? dir.accents[n % dir.accents.length] : undefined,
    colorway: dir.colorways[n % dir.colorways.length],
    italic: dir.id === 'streetwear' || (dir.id === 'futuristic' && n % 2 === 1),
    rationale: rationale(dir, mark, lang),
  };
}

/** The 12 starting concepts for a project, one per direction. */
export const generateLogoConcepts = (project) => DIRECTIONS.map((d) => logoForDirection(d.id, project, 0));

/** More options inside one direction: different symbols, typefaces and treatments. */
export function generateDirectionVariations(dirId, project, start = 1, count = 6) {
  const seen = new Set();
  const out = [];
  for (let n = start; out.length < count && n < start + 40; n++) {
    const l = logoForDirection(dirId, project, n);
    const key = `${l.mark}|${l.font}|${l.colorway}|${l.accent}`;
    if (!seen.has(key)) { seen.add(key); out.push(l); }
  }
  return out;
}

export const descriptorFor = (project) => {
  const lang = isArabicText(project.input.name) || project.input.language === 'ar' ? 'ar' : 'en';
  return findCategory(project.input.category).noun[lang];
};
