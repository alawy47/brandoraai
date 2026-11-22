// Builds every logo as an SVG string. The same function powers on-screen previews,
// SVG/PNG downloads and the PDF, so what users see is exactly what they export.
import { FONTS, fontStack } from '../data/fonts';
import { findLibraryFont, closestWeight, loadLibraryFont, libraryFontFaceCss } from '../data/fontLibrary';
import { isArabicText, initialOf } from './generator';

/** Up to two initials, one per word (e.g. "Noor Coffee" → "NC"). */
export function initialsOf(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const pick = (w) => (isArabicText(w[0]) ? (w.startsWith('ال') && w.length > 2 ? w[2] : w[0]) : w[0].toUpperCase());
  return words.slice(0, 2).map(pick).join('') || 'B';
}

let idCounter = 0;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let measureCtx;
export function measureText(text, family, weight, size, letterSpacing = 0) {
  if (typeof document === 'undefined') return text.length * size * 0.6;
  measureCtx ||= document.createElement('canvas').getContext('2d');
  measureCtx.font = `${weight} ${size}px "${family}"`;
  return measureCtx.measureText(text).width + letterSpacing * Math.max(0, [...text].length - 1);
}

export function wordmarkStyle(concept, name, cfg = concept.logo || {}) {
  const arabic = isArabicText(name);
  const family = (arabic ? cfg.fontAr : cfg.font) || (arabic ? concept.fonts.headingAr : concept.fonts.heading);
  const lib = findLibraryFont(family);
  const meta = FONTS[family];
  const weight = cfg.weight ? (lib ? closestWeight(family, cfg.weight) : meta?.weight || 700) : lib ? closestWeight(family, 700) : meta?.weight || 700;
  const cat = meta?.category || lib?.cat || 'sans';
  const autoUpper = !arabic && (cat === 'display' || ['Cormorant Garamond', 'Montserrat'].includes(family));
  const kase = arabic ? 'asis' : cfg.case || (autoUpper ? 'upper' : 'asis');
  const text = kase === 'upper' ? name.toUpperCase() : kase === 'lower' ? name.toLowerCase() : name;
  const tracking = arabic ? 0 : cfg.tracking ?? (kase === 'upper' ? 0.08 : cat === 'serif' ? 0.01 : -0.01);
  return { family, weight, arabic, text, tracking, italic: !!cfg.italic && !arabic };
}

export function logoColors(palette, variant = 'primary', colorway = 'primary') {
  const P = Object.fromEntries(palette.map((c) => [c.role, c.hex]));
  let base = colorway === 'accent' ? P.accent : P.primary;
  let acc = colorway === 'accent' ? P.primary : P.accent;
  if (colorway === 'ink') { base = P.dark; acc = P.accent; }
  switch (variant) {
    case 'inverse': return { fill: P.light, inner: P.dark, accent: P.accent, text: P.light, ink: P.dark };
    case 'mono': return { fill: '#111114', inner: '#FFFFFF', accent: '#111114', text: '#111114', ink: '#FFFFFF' };
    case 'white': return { fill: '#FFFFFF', inner: P.primary, accent: '#FFFFFF', text: '#FFFFFF', ink: P.primary };
    case 'onPrimary': return { fill: P.light, inner: P.primary, accent: P.accent, text: P.light, ink: P.dark };
    default: return { fill: base, inner: P.light, accent: acc, text: P.dark, ink: P.dark };
  }
}

function letter(ch, c, family, weight, size = 52, y = 50) {
  const ar = isArabicText(ch);
  return `<text x="50" y="${y}" dy="${ar ? '0.25em' : '0.36em'}" text-anchor="middle" font-family="${esc(fontStack(family))}" font-weight="${weight}" font-size="${size}" fill="${c.inner}">${esc(ch)}</text>`;
}

const STAR = 'M50 2C54 38 62 46 98 50C62 54 54 62 50 98C46 62 38 54 2 50C38 46 46 38 50 2Z';

export function markSvg(mark, c, ch, family, weight, custom) {
  const uid = `m${++idCounter}`;
  switch (mark) {
    case 'custom': {
      // An AI-drawn symbol, vectorised to one path and fitted into the 100×100 mark box.
      if (!custom?.d) return `<circle cx="50" cy="50" r="48" fill="${c.fill}"/>`;
      return `<svg x="2" y="2" width="96" height="96" viewBox="${esc(custom.viewBox)}" preserveAspectRatio="xMidYMid meet"><path d="${esc(custom.d)}" fill="${c.fill}" fill-rule="evenodd"/></svg>`;
    }
    case 'monogram-circle':
      return `<circle cx="50" cy="50" r="48" fill="${c.fill}"/>${letter(ch, c, family, weight)}<circle cx="80" cy="20" r="6" fill="${c.accent}"/>`;
    case 'monogram-square':
      return `<rect x="3" y="3" width="94" height="94" rx="26" fill="${c.fill}"/>${letter(ch, c, family, weight)}`;
    case 'monogram-split':
      return `<rect x="3" y="3" width="94" height="94" rx="10" fill="${c.fill}"/>${letter(ch, c, family, weight, 58)}<line x1="8" y1="92" x2="92" y2="8" stroke="${c.fill}" stroke-width="5"/><circle cx="82" cy="82" r="7" fill="${c.accent}"/>`;
    case 'hexagon':
      return `<polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="${c.fill}"/>${letter(ch, c, family, weight, 46)}`;
    case 'orbit':
      return `<circle cx="50" cy="50" r="20" fill="${c.fill}"/><ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="${c.fill}" stroke-width="5" transform="rotate(-30 50 50)"/><circle cx="88" cy="28" r="7.5" fill="${c.accent}"/>`;
    case 'petals':
      return [0, 90, 180, 270].map((r) => `<ellipse cx="50" cy="28" rx="15" ry="26" fill="${c.fill}" fill-opacity="0.88" transform="rotate(${r} 50 50)"/>`).join('') + `<circle cx="50" cy="50" r="9" fill="${c.accent}"/>`;
    case 'spark':
      return `<path d="${STAR}" fill="${c.fill}"/><path d="${STAR}" fill="${c.accent}" transform="translate(70 4) scale(0.26)"/>`;
    case 'pillars':
      return `<rect x="8" y="52" width="22" height="44" rx="11" fill="${c.fill}"/><rect x="39" y="30" width="22" height="66" rx="11" fill="${c.fill}"/><rect x="70" y="6" width="22" height="90" rx="11" fill="${c.accent}"/>`;
    case 'wave':
      return `<circle cx="50" cy="50" r="48" fill="${c.fill}"/><path d="M14 44Q32 28 50 44T86 44" fill="none" stroke="${c.inner}" stroke-width="7" stroke-linecap="round"/><path d="M14 64Q32 48 50 64T86 64" fill="none" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>`;
    case 'arch':
      return `<path d="M10 98V48a40 40 0 0 1 80 0v50z" fill="${c.fill}"/><path d="M32 98V56a18 18 0 0 1 36 0v42z" fill="${c.inner}"/><path d="${STAR}" fill="${c.accent}" transform="translate(42 14) scale(0.16)"/>`;
    case 'diamond':
      return `<path d="M26 8h48l22 28-46 60L4 36z" fill="${c.fill}"/><path d="M4 36h92M26 8l12 28 12 60 12-60 12-28M38 36l12-28 12 28" fill="none" stroke="${c.inner}" stroke-opacity="0.55" stroke-width="2.4" stroke-linejoin="round"/>`;
    case 'bloom':
      return Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return `<circle cx="${(50 + 32 * Math.cos(a)).toFixed(2)}" cy="${(50 + 32 * Math.sin(a)).toFixed(2)}" r="14" fill="${c.fill}"/>`;
      }).join('') + `<circle cx="50" cy="50" r="17" fill="${c.accent}"/>`;
    case 'crescent':
      return `<defs><mask id="${uid}"><rect width="100" height="100" fill="#fff"/><circle cx="64" cy="40" r="36" fill="#000"/></mask></defs><circle cx="46" cy="52" r="44" fill="${c.fill}" mask="url(#${uid})"/><path d="${STAR}" fill="${c.accent}" transform="translate(58 30) scale(0.3)"/>`;
    case 'bean':
      return `<g transform="rotate(28 50 50)"><ellipse cx="50" cy="50" rx="32" ry="47" fill="${c.fill}"/><path d="M50 7C34 30 66 66 50 93" fill="none" stroke="${c.inner}" stroke-width="6.5" stroke-linecap="round"/></g><circle cx="88" cy="14" r="6" fill="${c.accent}"/>`;
    case 'shield':
      return `<path d="M50 3l40 14v31c0 26-17 42-40 50C27 90 10 74 10 48V17z" fill="${c.fill}"/><path d="M31 50l13 13 26-27" fill="none" stroke="${c.inner}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'star8':
      return `<rect x="18" y="18" width="64" height="64" rx="5" fill="${c.fill}"/><rect x="18" y="18" width="64" height="64" rx="5" fill="${c.fill}" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="17" fill="${c.inner}"/><circle cx="50" cy="50" r="7" fill="${c.accent}"/>`;
    case 'crown':
      return `<path d="M10 76L16 28l20 24 14-32 14 32 20-24 6 48z" fill="${c.fill}" stroke-linejoin="round"/><rect x="10" y="82" width="80" height="11" rx="4" fill="${c.fill}"/><circle cx="16" cy="24" r="6" fill="${c.accent}"/><circle cx="50" cy="16" r="6" fill="${c.accent}"/><circle cx="84" cy="24" r="6" fill="${c.accent}"/>`;
    case 'leaf':
      return `<path d="M50 4C84 26 88 64 50 96 12 64 16 26 50 4z" fill="${c.fill}"/><path d="M50 22v68M50 46l15-12M50 62L35 50M50 76l12-9" fill="none" stroke="${c.inner}" stroke-width="4" stroke-linecap="round"/><circle cx="76" cy="14" r="6" fill="${c.accent}"/>`;
    case 'drop':
      return `<path d="M50 3S86 44 86 63a36 36 0 0 1-72 0C14 44 50 3 50 3z" fill="${c.fill}"/><path d="M32 64a18 18 0 0 0 18 18" fill="none" stroke="${c.inner}" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="44" r="6" fill="${c.accent}"/>`;
    case 'flame':
      return `<path d="M50 3c12 22 34 34 34 59a34 34 0 0 1-68 0c0-16 14-26 18-40 6 12 10 16 16 18 4-12 4-24 0-37z" fill="${c.fill}"/><path d="M50 52c8 10 16 16 16 25a16 16 0 0 1-32 0c0-9 10-15 16-25z" fill="${c.accent}"/>`;
    case 'mountain':
      return `<path d="M3 88L38 28l18 30 12-17 29 47z" fill="${c.fill}" stroke-linejoin="round"/><path d="M38 28L29 43l9-5 8 7z" fill="${c.inner}"/><circle cx="78" cy="20" r="10" fill="${c.accent}"/>`;
    case 'sunrise':
      return `<path d="M12 70a38 38 0 0 1 76 0z" fill="${c.fill}"/><rect x="12" y="50" width="76" height="4" fill="${c.inner}"/><rect x="12" y="60" width="76" height="4" fill="${c.inner}"/><rect x="4" y="76" width="92" height="7" rx="3.5" fill="${c.accent}"/><rect x="22" y="89" width="56" height="7" rx="3.5" fill="${c.fill}"/>`;
    case 'infinity':
      return `<path d="M50 50C40 26 8 26 8 50s32 24 42 0 42-24 42 0-32 24-42 0z" fill="none" stroke="${c.fill}" stroke-width="11" stroke-linejoin="round"/><circle cx="92" cy="22" r="6" fill="${c.accent}"/>`;
    case 'chevrons':
      return `<path d="M16 40L50 14l34 26" fill="none" stroke="${c.fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 64L50 38l34 26" fill="none" stroke="${c.fill}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 88L50 62l34 26" fill="none" stroke="${c.accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'mosaic':
      return `<rect x="5" y="5" width="42" height="42" rx="10" fill="${c.fill}"/><path d="M53 47V5a42 42 0 0 1 42 42z" fill="${c.fill}"/><path d="M5 53h42v42A42 42 0 0 1 5 53z" fill="${c.fill}"/><rect x="53" y="53" width="42" height="42" rx="21" fill="${c.accent}"/>`;
    case 'halves':
      return `<path d="M47 2a44 44 0 0 0 0 88z" fill="${c.fill}"/><path d="M53 10a44 44 0 0 1 0 88z" fill="${c.accent}"/>`;
    case 'prism':
      return `<path d="M50 5L6 90h44z" fill="${c.fill}"/><path d="M50 5l44 85H50z" fill="${c.accent}"/>`;
    case 'cube':
      return `<path d="M50 5l42 23-42 23L8 28z" fill="${c.accent}"/><path d="M8 28l42 23v46L8 74z" fill="${c.fill}"/><path d="M92 28L50 51v46l42-23z" fill="${c.fill}" fill-opacity="0.72"/>`;
    case 'lotus':
      return ['-42', '42'].map((r) => `<path d="M50 20c14 20 14 42 0 62-14-20-14-42 0-62z" fill="${c.fill}" fill-opacity="0.7" transform="rotate(${r} 50 82)"/>`).join('')
        + `<path d="M50 14c15 22 15 46 0 68-15-22-15-46 0-68z" fill="${c.fill}"/><circle cx="50" cy="91" r="5" fill="${c.accent}"/>`;
    case 'bubble':
      return `<path d="M15 6h70a11 11 0 0 1 11 11v46a11 11 0 0 1-11 11H46L24 94V74h-9A11 11 0 0 1 4 63V17A11 11 0 0 1 15 6z" fill="${c.fill}"/>${letter(ch, c, family, weight, 40, 40)}<circle cx="82" cy="20" r="5" fill="${c.accent}"/>`;
    case 'seal': {
      const pts = Array.from({ length: 48 }, (_, i) => {
        const r = i % 2 ? 43 : 48; const a = (i * Math.PI) / 24;
        return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="${c.fill}"/><circle cx="50" cy="50" r="35" fill="none" stroke="${c.inner}" stroke-width="2" stroke-dasharray="2 4"/>${letter(ch, c, family, weight, 40)}<circle cx="50" cy="78" r="3.5" fill="${c.accent}"/>`;
    }
    case 'initials': {
      // Lettermark: up to two initials, the second outlined in the frame colour so they interlock.
      const [a, b] = [...ch];
      const ar = isArabicText(ch);
      const t = (x, l, size, stroke) => `<text x="${x}" y="50" dy="${ar ? '0.25em' : '0.36em'}" text-anchor="middle" font-family="${esc(fontStack(family))}" font-weight="${weight}" font-size="${size}" fill="${c.inner}"${stroke ? ` stroke="${c.fill}" stroke-width="3.5" paint-order="stroke"` : ''}>${esc(l)}</text>`;
      return `<circle cx="50" cy="50" r="48" fill="${c.fill}"/><circle cx="50" cy="50" r="42" fill="none" stroke="${c.accent}" stroke-width="1.5"/>`
        + (b ? t(ar ? 60 : 39, a, 50) + t(ar ? 40 : 61, b, 50, true) : t(50, a, 56));
    }
    case 'mascot-fox':
      return `<path d="M50 92L13 48V8l23 21q14-5 28 0L87 8v40z" fill="${c.fill}" stroke-linejoin="round"/>`
        + `<path d="M22 22l11 10-11 6zM78 22L67 32l11 6z" fill="${c.accent}"/>`
        + `<path d="M50 92L25 60q13 5 25-3 12 8 25 3z" fill="${c.inner}"/>`
        + `<circle cx="37" cy="49" r="4.5" fill="${c.ink}"/><circle cx="63" cy="49" r="4.5" fill="${c.ink}"/><ellipse cx="50" cy="84" rx="6" ry="4.5" fill="${c.ink}"/>`;
    case 'mascot-owl':
      return `<path d="M18 22l14 9h36l14-9v48a32 26 0 0 1-64 0z" fill="${c.fill}" stroke-linejoin="round"/>`
        + `<circle cx="35" cy="47" r="15" fill="${c.inner}"/><circle cx="65" cy="47" r="15" fill="${c.inner}"/>`
        + `<circle cx="37" cy="48" r="7" fill="${c.ink}"/><circle cx="63" cy="48" r="7" fill="${c.ink}"/><circle cx="39" cy="46" r="2" fill="${c.inner}"/><circle cx="65" cy="46" r="2" fill="${c.inner}"/>`
        + `<path d="M44 60h12l-6 10z" fill="${c.accent}"/><path d="M30 80q20 10 40 0" fill="none" stroke="${c.inner}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
    case 'mascot-bear':
      return `<circle cx="21" cy="24" r="14" fill="${c.fill}"/><circle cx="79" cy="24" r="14" fill="${c.fill}"/><circle cx="21" cy="24" r="6.5" fill="${c.accent}"/><circle cx="79" cy="24" r="6.5" fill="${c.accent}"/>`
        + `<circle cx="50" cy="55" r="40" fill="${c.fill}"/><ellipse cx="50" cy="70" rx="18" ry="14" fill="${c.inner}"/>`
        + `<ellipse cx="50" cy="63" rx="7" ry="5" fill="${c.ink}"/><path d="M50 68v6M44 76q6 4 12 0" fill="none" stroke="${c.ink}" stroke-width="2.5" stroke-linecap="round"/>`
        + `<circle cx="35" cy="47" r="4.5" fill="${c.ink}"/><circle cx="65" cy="47" r="4.5" fill="${c.ink}"/>`;
    case 'heart':
      return `<path d="M50 92C20 72 5 54 5 34a22 22 0 0 1 45-8 22 22 0 0 1 45 8c0 20-15 38-45 58z" fill="${c.fill}"/><path d="M24 30a10 10 0 0 1 10-9" fill="none" stroke="${c.inner}" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="12" r="6" fill="${c.accent}"/>`;
    case 'bolt':
      return `<path d="M60 3L15 58h31l-8 39 47-57H54z" fill="${c.fill}" stroke-linejoin="round"/><circle cx="86" cy="14" r="6" fill="${c.accent}"/>`;
    case 'anchor':
      return `<g fill="none" stroke-linecap="round" stroke-width="8"><circle cx="50" cy="15" r="9" stroke="${c.fill}"/><path d="M50 24v68" stroke="${c.fill}"/><path d="M14 58a36 36 0 0 0 72 0" stroke="${c.fill}"/><path d="M30 38h40" stroke="${c.accent}"/></g>`;
    case 'compass':
      return `<circle cx="50" cy="50" r="47" fill="${c.fill}"/><circle cx="50" cy="50" r="38" fill="none" stroke="${c.inner}" stroke-width="1.5" stroke-dasharray="1.5 5"/><path d="M50 12l11 38H39z" fill="${c.accent}"/><path d="M50 88L39 50h22z" fill="${c.inner}"/><circle cx="50" cy="50" r="5" fill="${c.fill}"/>`;
    case 'feather':
      return `<path d="M82 4C42 12 16 46 20 90c32-6 64-38 62-86z" fill="${c.fill}"/><path d="M14 96L70 22" fill="none" stroke="${c.inner}" stroke-width="4" stroke-linecap="round"/><path d="M44 62l18 2M54 48l16 1" fill="none" stroke="${c.inner}" stroke-width="3" stroke-linecap="round"/>`;
    case 'palm':
      return `<path d="M50 96c3-22-2-38 0-56" fill="none" stroke="${c.fill}" stroke-width="8" stroke-linecap="round"/>`
        + ['M50 40C36 22 18 20 4 32c18-4 32 0 46 8z', 'M50 40C42 18 30 6 14 6c14 8 26 18 36 34z'].map((d) => `<path d="${d}" fill="${c.fill}"/><path d="${d}" fill="${c.fill}" transform="matrix(-1 0 0 1 100 0)"/>`).join('')
        + `<circle cx="45" cy="47" r="4.5" fill="${c.accent}"/><circle cx="55" cy="47" r="4.5" fill="${c.accent}"/>`;
    case 'knot':
      return `<circle cx="37" cy="50" r="27" fill="none" stroke="${c.fill}" stroke-width="11"/><circle cx="63" cy="50" r="27" fill="none" stroke="${c.accent}" stroke-width="11"/><path d="M37 23a27 27 0 0 1 22 11" fill="none" stroke="${c.fill}" stroke-width="11"/>`;
    case 'cup':
      return `<path d="M50 4c-5 7 5 10 0 17M36 8c-4 6 4 8 0 13M64 8c-4 6 4 8 0 13" fill="none" stroke="${c.accent}" stroke-width="4" stroke-linecap="round"/><path d="M14 28h60v30a24 24 0 0 1-24 24H38a24 24 0 0 1-24-24z" fill="${c.fill}"/><path d="M74 36h5a12 12 0 0 1 0 24h-6" fill="none" stroke="${c.fill}" stroke-width="7"/><rect x="6" y="88" width="76" height="7" rx="3.5" fill="${c.fill}"/>`;
    case 'house':
      return `<path d="M8 46L50 8l42 38v48H8z" fill="${c.fill}" stroke-linejoin="round"/><path d="M38 94V68a12 12 0 0 1 24 0v26z" fill="${c.inner}"/><circle cx="50" cy="40" r="8" fill="${c.accent}"/>`;
    default:
      return `<circle cx="50" cy="50" r="48" fill="${c.fill}"/>${letter(ch, c, family, weight)}`;
  }
}

/**
 * @param {object} o
 * @param {string} o.name brand name
 * @param {object} o.concept concept with palette, fonts and logo
 * @param {object} [o.logo] overrides: mark, layout, colorway, style, font, fontAr, weight, case, tracking, accent, italic
 * @param {'primary'|'inverse'|'mono'|'white'|'onPrimary'} [o.variant]
 * @param {'horizontal'|'stacked'|'icon'|'wordmark'|'emblem'|'crest'|'badge'|'box'|'corporate'} [o.layout]
 * @param {string} [o.descriptor] short line used by crest, badge and corporate lockups
 * @param {string} [o.fontCss] embedded @font-face CSS for standalone export
 * @param {string} [o.background] optional background fill
 */
export function buildLogoSvg({ name, concept, logo, variant = 'primary', layout, descriptor = '', fontCss = '', background }) {
  const cfg = { ...concept.logo, ...logo };
  const lay = layout || cfg.layout;
  const c = logoColors(concept.palette, variant, cfg.colorway);
  const wm = wordmarkStyle(concept, name, cfg);
  const ch = cfg.mark === 'initials' ? initialsOf(name) : initialOf(name);
  const pad = 16;
  const ff = esc(fontStack(wm.family));
  const dir = wm.arabic ? ' direction="rtl"' : '';
  const mark = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 100})">${markSvg(cfg.mark, c, ch, wm.family, wm.weight, cfg.custom)}</g>`;
  const ls = (size, extra = 0) => (wm.tracking * size + extra).toFixed(2);
  const text = (x, y, size, fill = c.text, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}"${dir} font-family="${ff}" font-weight="${wm.weight}" font-size="${size}" letter-spacing="${ls(size)}" fill="${fill}">${esc(wm.text)}</text>`;
  const small = (x, y, str, size, fill, spacing = 0.28) => `<text x="${x}" y="${y}" text-anchor="middle"${isArabicText(str) ? ' direction="rtl"' : ''} font-family="${ff}" font-weight="${Math.min(wm.weight, 600)}" font-size="${size}" letter-spacing="${isArabicText(str) ? 0 : (spacing * size).toFixed(2)}" fill="${fill}">${esc(str)}</text>`;
  const measure = (size, extra = 0) => measureText(wm.text, wm.family, wm.weight, size, wm.tracking * size + extra);
  const desc = descriptor ? (wm.arabic || isArabicText(descriptor) ? descriptor : descriptor.toUpperCase()) : '';
  const arcText = (id, R, cx, cy, str, size, top = true) => {
    const path = top ? `M${cx - R} ${cy}a${R} ${R} 0 0 1 ${2 * R} 0` : `M${cx - R} ${cy}a${R} ${R} 0 0 0 ${2 * R} 0`;
    return `<defs><path id="${id}" d="${path}"/></defs><text font-family="${ff}" font-weight="${wm.weight}" font-size="${size.toFixed(1)}" letter-spacing="${isArabicText(str) ? 0 : (size * 0.12).toFixed(2)}" fill="${c.text}"${isArabicText(str) ? ' direction="rtl"' : ''}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(str)}</textPath></text>`;
  };

  let w, h, body;
  if (lay === 'emblem') {
    // Circular emblem: mark in the centre, brand name set on the upper arc.
    const R = 92, size0 = wm.arabic ? 34 : 22;
    const size = Math.min(size0, (size0 * 250) / Math.max(measure(size0, 2), 1));
    w = h = 240;
    body = `<circle cx="120" cy="120" r="${R + 20}" fill="none" stroke="${c.fill}" stroke-width="5"/>`
      + `<circle cx="120" cy="120" r="${R - 22}" fill="none" stroke="${c.fill}" stroke-width="1.5"/>`
      + arcText(`arc${++idCounter}`, wm.arabic ? R - 15 : R - 4, 120, 120, wm.text, size)
      + `<circle cx="${120 - R - 1}" cy="132" r="4" fill="${c.accent}"/><circle cx="${120 + R + 1}" cy="132" r="4" fill="${c.accent}"/>`
      + mark(85, 92, 70);
  } else if (lay === 'badge') {
    // Vintage badge: double ring, name on the top arc, descriptor or founding year on the bottom arc.
    const R = 100, cx = 130, cy = 130;
    const top = wm.text;
    const bottom = desc || (wm.arabic ? `تأسست ${new Date().getFullYear()}` : `EST. ${new Date().getFullYear()}`);
    const s0 = wm.arabic ? 40 : 26;
    const size = Math.min(s0, (s0 * 270) / Math.max(measure(s0, 3), 1));
    w = h = 260;
    body = `<circle cx="${cx}" cy="${cy}" r="${R + 24}" fill="${c.fill}"/><circle cx="${cx}" cy="${cy}" r="${R + 18}" fill="none" stroke="${c.inner}" stroke-width="2"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${R - 22}" fill="${c.inner}"/><circle cx="${cx}" cy="${cy}" r="${R - 27}" fill="none" stroke="${c.fill}" stroke-width="1.5"/>`
      + arcText(`bt${++idCounter}`, wm.arabic ? R - 17 : R - 6, cx, cy, top, size).replace(`fill="${c.text}"`, `fill="${c.inner}"`)
      + arcText(`bb${++idCounter}`, R + 9, cx, cy, bottom, isArabicText(bottom) ? 21 : 15, false).replace(`fill="${c.text}"`, `fill="${c.inner}"`)
      + [-1, 1].map((k) => `<path d="M${cx + k * (R - 2)} ${cy - 7}l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z" fill="${c.accent}"/>`).join('')
      + mark(cx - 46, cy - 46, 92);
  } else if (lay === 'crest') {
    // Luxury crest: framed mark, widely tracked name, hairline rules with a centre diamond or descriptor.
    const size = 34 * (wm.arabic ? 1.7 : 1);
    const tw = measure(size);
    w = Math.max(tw, 220) + pad * 4; h = 250;
    const cx = w / 2;
    const rule = desc
      ? small(cx, 222 + (wm.arabic ? 4 : 0), desc, wm.arabic ? 17 : 12, c.text, 0.42) + `<path d="M${cx - Math.max(tw / 2, 110)} 218H${cx - desc.length * 4.2 - 16}M${cx + desc.length * 4.2 + 16} 218H${cx + Math.max(tw / 2, 110)}" stroke="${c.accent}" stroke-width="1"/>`
      : `<path d="M${cx - Math.max(tw / 2, 110)} 216H${cx - 10}M${cx + 10} 216H${cx + Math.max(tw / 2, 110)}" stroke="${c.accent}" stroke-width="1"/><path d="M${cx} 210l6 6-6 6-6-6z" fill="${c.accent}"/>`;
    body = `<circle cx="${cx}" cy="66" r="52" fill="none" stroke="${c.fill}" stroke-width="1.5"/>` + mark(cx - 38, 28, 76)
      + text(cx, 172 + size * 0.36, size) + rule;
  } else if (lay === 'box') {
    // Streetwear box logo: heavy uppercase knocked out of a solid block, slanted.
    const size = 70 * (wm.arabic ? 1.1 : 1);
    const tw = measure(size);
    const bw = tw + 56, bh = size * 1.32;
    w = bw + pad * 2 + 20; h = bh + pad * 2;
    const skew = wm.arabic ? '' : ` transform="translate(${w / 2} ${h / 2}) skewX(-8) translate(${-w / 2} ${-h / 2})"`;
    body = `<g${skew}><rect x="${pad + 10}" y="${pad}" width="${bw}" height="${bh}" fill="${c.fill}"/>`
      + text(pad + 10 + bw / 2, pad + bh / 2 + size * 0.35, size, c.inner) + `<rect x="${pad + 10}" y="${pad + bh - 6}" width="${bw}" height="6" fill="${c.accent}"/></g>`;
  } else if (lay === 'icon') {
    w = h = 100 + pad * 2;
    body = mark(pad, pad, 100);
  } else if (lay === 'wordmark') {
    const size = 64 * (wm.arabic ? 1.2 : 1);
    const tw = measure(size);
    const accent = cfg.accent || '';
    const dot = accent === 'dot' ? size * 0.17 : 0;
    w = tw + pad * 2 + (dot ? dot * 2.6 : 0); h = size * 1.5 + pad * 2;
    const tx = wm.arabic ? pad + dot * 2.6 + tw / 2 : pad + tw / 2;
    const y = pad + size * 1.02;
    let t = text(tx, y, size);
    if (accent === 'lastLetter' && !wm.arabic && wm.text.length > 1) {
      t = `<text x="${tx}" y="${y}" text-anchor="middle" font-family="${ff}" font-weight="${wm.weight}" font-size="${size}" letter-spacing="${ls(size)}" fill="${c.text}">${esc(wm.text.slice(0, -1))}<tspan fill="${c.accent}">${esc(wm.text.slice(-1))}</tspan></text>`;
    }
    body = t;
    if (dot) body += `<circle cx="${wm.arabic ? pad + dot : pad + tw + dot * 1.6}" cy="${y - dot}" r="${dot}" fill="${c.accent}"/>`;
    if (accent === 'underline') body += `<path d="M${tx - tw / 2} ${y + size * 0.22}q${tw / 2} ${size * 0.16} ${tw} 0" fill="none" stroke="${c.accent}" stroke-width="${size * 0.07}" stroke-linecap="round"/>`;
  } else if (lay === 'stacked') {
    const size = 42 * (wm.arabic ? 1.2 : 1);
    const tw = measure(size);
    w = Math.max(100, tw) + pad * 2; h = 100 + 22 + size * 1.25 + pad * 2;
    body = mark((w - 100) / 2, pad, 100) + text(w / 2, pad + 100 + 22 + size * 0.9, size);
  } else {
    // horizontal and corporate (horizontal plus a divider and a descriptor)
    const size = 54 * (wm.arabic ? 1.2 : 1), gap = 26;
    const tw = measure(size);
    const corp = lay === 'corporate' && desc;
    const descW = corp ? measureText(desc, wm.family, 500, 14, 14 * 0.28) : 0;
    const dw = corp ? descW + 42 : 0; // divider block: 20 gap + rule + 20 gap + descriptor
    w = 100 + gap + tw + pad * 2 + dw; h = 100 + pad * 2;
    const textY = pad + 50 + size * (wm.arabic ? 0.3 : 0.34);
    const rule = (x) => `<rect x="${x}" y="${pad + 22}" width="1.5" height="56" fill="${c.text}" opacity=".35"/>`;
    if (wm.arabic) {
      // right to left: mark, name, rule, descriptor
      body = mark(w - pad - 100, pad, 100) + text(w - pad - 100 - gap - tw / 2, textY, size)
        + (corp ? rule(pad + descW + 20) + small(pad + descW / 2, pad + 55, desc, 14, c.text) : '');
    } else {
      body = mark(pad, pad, 100) + text(pad + 100 + gap + tw / 2, textY, size)
        + (corp ? rule(pad + 100 + gap + tw + 20) + small(pad + 100 + gap + tw + 42 + descW / 2, pad + 55, desc, 14, c.text) : '');
    }
  }
  if (wm.italic && lay !== 'box') body = `<g transform="translate(${w / 2} ${h / 2}) skewX(-8) translate(${-w / 2} ${-h / 2})">${body}</g>`;
  w = Math.ceil(w); h = Math.ceil(h);
  const style = fontCss ? `<style>${fontCss}</style>` : '';
  const bg = background ? `<rect width="100%" height="100%" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(name)} logo">${style}${bg}${body}</svg>`;
}

// Embeds the exact font the logo uses, so downloaded SVGs render anywhere.
const fontCache = new Map();
async function toBase64(url) {
  if (fontCache.has(url)) return fontCache.get(url);
  const buf = await (await fetch(url)).arrayBuffer();
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const b64 = btoa(bin);
  fontCache.set(url, b64);
  return b64;
}

/** @param {string} [svgText] the logo SVG, used to subset Google Fonts to the characters actually drawn */
export async function embeddedFontCss(concept, name, cfg = concept.logo, svgText = '') {
  const wm = wordmarkStyle(concept, name, cfg);
  const meta = FONTS[wm.family];
  try {
    if (meta) {
      const url = wm.arabic ? meta.files.arabic || meta.files.latin : meta.files.latin || meta.files.arabic;
      if (!url) return '';
      return `@font-face{font-family:'${wm.family}';font-weight:${meta.weight};src:url(data:font/woff2;base64,${await toBase64(url)}) format('woff2');}`;
    }
    if (findLibraryFont(wm.family)) {
      const chars = [...svgText.matchAll(/>([^<>]+)</g)].map((m) => m[1]).join('') || wm.text;
      const weights = [...new Set([wm.weight, Math.min(wm.weight, 600)])];
      const css = await Promise.all(weights.map((wt) => libraryFontFaceCss(wm.family, wt, [...new Set(chars + wm.text)].join(''))));
      return css.join('\n');
    }
  } catch { /* offline: the SVG falls back to the font stack */ }
  return '';
}

export async function ensureFonts(concept, name, cfg = concept.logo) {
  if (typeof document === 'undefined' || !document.fonts) return;
  const wm = wordmarkStyle(concept, name, cfg);
  if (findLibraryFont(wm.family)) await loadLibraryFont(wm.family, wm.weight);
  const fams = [wm.family, concept.fonts.heading, concept.fonts.body, concept.fonts.headingAr, concept.fonts.bodyAr];
  await Promise.all(fams.map((f) => document.fonts.load(`${FONTS[f]?.weight || wm.weight || 400} 40px "${f}"`, wm.arabic ? 'ابجد' : 'Abc').catch(() => {})));
  await Promise.all(fams.map((f) => document.fonts.load(`400 16px "${f}"`, 'ابجد Abc').catch(() => {})));
}
