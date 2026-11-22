// Offline logo edits: understands plain requests ("bolder", "serif", "stacked", "أخف") and
// turns them into config changes. Used when no AI provider is connected; the UI labels it as offline.
import { FONT_LIBRARY, findLibraryFont } from '../data/fontLibrary';
import { MARKS } from './generator';
import { findDirection } from './logoDirections';

const has = (q, words) => words.some((w) => q.includes(w));
const pickFont = (cat, script, current) => {
  const list = FONT_LIBRARY.filter((f) => (script === 'arabic' ? f.script === 'arabic' && (cat === 'any' || f.style === cat) : f.cat === cat));
  const i = list.findIndex((f) => f.family === current);
  return list[(i + 1) % list.length]?.family;
};

/** @returns {{ patch: object, applied: string[] }} */
export function interpretLogoRequest(request, logo, lang = 'en') {
  const q = request.toLowerCase();
  const patch = {};
  const applied = [];
  const say = (en, ar) => applied.push(lang === 'ar' ? ar : en);

  if (has(q, ['bolder', 'bold', 'heavier', 'thicker', 'عريض', 'أعرض', 'أثقل', 'سميك'])) { patch.weight = 800; say('Heavier weight', 'وزن أثقل'); }
  if (has(q, ['lighter', 'thin', 'light', 'delicate', 'أخف', 'رفيع', 'نحيف'])) { patch.weight = 300; say('Lighter weight', 'وزن أخف'); }
  if (has(q, ['wider', 'more space', 'spacing', 'spread', 'تباعد', 'مسافة أكبر', 'أوسع'])) { patch.tracking = Math.min(0.45, (logo.tracking ?? 0) + 0.08); say('More letter spacing', 'تباعد أكبر بين الحروف'); }
  if (has(q, ['tighter', 'closer', 'condensed', 'أضيق', 'متقارب'])) { patch.tracking = Math.max(-0.05, (logo.tracking ?? 0) - 0.05); say('Tighter letter spacing', 'تقارب أكبر بين الحروف'); }
  if (has(q, ['uppercase', 'capital', 'caps', 'حروف كبيرة'])) { patch.case = 'upper'; say('Uppercase', 'حروف كبيرة'); }
  if (has(q, ['lowercase', 'small letters', 'حروف صغيرة'])) { patch.case = 'lower'; say('Lowercase', 'حروف صغيرة'); }
  if (has(q, ['italic', 'slant', 'مائل'])) { patch.italic = !logo.italic; say(logo.italic ? 'Upright' : 'Slanted', logo.italic ? 'مستقيم' : 'مائل'); }

  const fontMap = [
    [['serif', 'classic', 'elegant', 'كلاسيكي', 'أنيق'], 'luxury', 'naskh'],
    [['editorial', 'magazine', 'تحريري'], 'editorial', 'naskh'],
    [['modern', 'clean', 'sans', 'حديث', 'نظيف'], 'sans', 'sans'],
    [['geometric', 'هندسي'], 'geometric', 'kufi'],
    [['futur', 'tech', 'مستقبل', 'تقني'], 'futuristic', 'kufi'],
    [['handwritten', 'script', 'hand', 'يدوي', 'خط يد'], 'script', 'calligraphic'],
    [['retro', 'vintage', 'ريترو', 'قديم'], 'vintage', 'display'],
    [['playful', 'fun', 'friendly', 'rounded', 'مرح', 'ودود'], 'rounded', 'rounded'],
    [['fashion', 'أزياء'], 'fashion', 'display'],
  ];
  for (const [words, cat, arStyle] of fontMap) {
    if (has(q, words)) {
      const f = pickFont(cat, 'latin', logo.font); const fa = pickFont(arStyle, 'arabic', logo.fontAr);
      if (f) patch.font = f;
      if (fa) patch.fontAr = fa;
      say(`Typeface: ${f}`, `الخط: ${fa || f}`);
      break;
    }
  }

  if (has(q, ['vertical', 'stacked', 'عمودي'])) { patch.layout = 'stacked'; say('Vertical lockup', 'تخطيط عمودي'); }
  else if (has(q, ['horizontal', 'side by side', 'أفقي'])) { patch.layout = 'horizontal'; say('Horizontal lockup', 'تخطيط أفقي'); }
  else if (has(q, ['icon only', 'symbol only', 'أيقونة فقط'])) { patch.layout = 'icon'; say('Icon only', 'أيقونة فقط'); }
  else if (has(q, ['badge', 'stamp', 'ختم'])) { patch.layout = 'badge'; say('Badge', 'ختم'); }
  else if (has(q, ['circle', 'emblem', 'دائري'])) { patch.layout = 'emblem'; say('Circular emblem', 'شعار دائري'); }
  else if (has(q, ['text only', 'wordmark', 'no symbol', 'نص فقط', 'بدون رمز'])) { patch.layout = 'wordmark'; say('Wordmark only', 'نص فقط'); }

  if (has(q, ['black', 'dark', 'monochrome', 'أسود', 'داكن'])) { patch.colorway = 'ink'; say('Dark ink colourway', 'ألوان داكنة'); }
  else if (has(q, ['accent', 'gold', 'brighter', 'ذهبي', 'أفتح', 'لافت'])) { patch.colorway = 'accent'; say('Accent colourway', 'اللون المميِّز'); }
  else if (has(q, ['brand colour', 'brand color', 'primary', 'لون العلامة'])) { patch.colorway = 'primary'; say('Brand colourway', 'لون العلامة'); }

  if (has(q, ['symbol', 'another', 'different icon', 'new mark', 'رمز', 'أيقونة أخرى'])) {
    const pool = findDirection(logo.style)?.marks.filter((m) => m !== logo.mark) || MARKS;
    patch.mark = pool[Math.floor(Math.random() * pool.length)] || MARKS[0];
    say('New symbol', 'رمز جديد');
  }
  if (patch.font && !findLibraryFont(patch.font)) delete patch.font;
  return { patch, applied };
}
