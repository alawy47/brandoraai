// Builds every logo as an SVG string. The same function powers on-screen previews,
// SVG/PNG downloads and the PDF, so what users see is exactly what they export.
import { FONTS, fontStack } from '../data/fonts';
import { isArabicText, initialOf } from './generator';

let idCounter = 0;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let measureCtx;
export function measureText(text, family, weight, size, letterSpacing = 0) {
  if (typeof document === 'undefined') return text.length * size * 0.6;
  measureCtx ||= document.createElement('canvas').getContext('2d');
  measureCtx.font = `${weight} ${size}px "${family}"`;
  return measureCtx.measureText(text).width + letterSpacing * Math.max(0, [...text].length - 1);
}

export function wordmarkStyle(concept, name) {
  const arabic = isArabicText(name);
  const family = arabic ? concept.fonts.headingAr : concept.fonts.heading;
  const meta = FONTS[family] || { weight: 700, category: 'sans' };
  const upper = !arabic && (meta.category === 'display' || ['Cormorant Garamond', 'Montserrat'].includes(family));
  return {
    family,
    weight: meta.weight,
    arabic,
    text: upper ? name.toUpperCase() : name,
    tracking: arabic ? 0 : upper ? 0.08 : meta.category === 'serif' ? 0.01 : -0.01,
  };
}

export function logoColors(palette, variant = 'primary', colorway = 'primary') {
  const P = Object.fromEntries(palette.map((c) => [c.role, c.hex]));
  let base = colorway === 'accent' ? P.accent : P.primary;
  let acc = colorway === 'accent' ? P.primary : P.accent;
  switch (variant) {
    case 'inverse': return { fill: P.light, inner: P.dark, accent: P.accent, text: P.light };
    case 'mono': return { fill: '#111114', inner: '#FFFFFF', accent: '#111114', text: '#111114' };
    case 'white': return { fill: '#FFFFFF', inner: P.primary, accent: '#FFFFFF', text: '#FFFFFF' };
    case 'onPrimary': return { fill: P.light, inner: P.primary, accent: P.accent, text: P.light };
    default: return { fill: base, inner: P.light, accent: acc, text: P.dark };
  }
}

function letter(ch, c, family, weight, size = 52, y = 50) {
  const ar = isArabicText(ch);
  return `<text x="50" y="${y}" dy="${ar ? '0.25em' : '0.36em'}" text-anchor="middle" font-family="${esc(fontStack(family))}" font-weight="${weight}" font-size="${size}" fill="${c.inner}">${esc(ch)}</text>`;
}

const STAR = 'M50 2C54 38 62 46 98 50C62 54 54 62 50 98C46 62 38 54 2 50C38 46 46 38 50 2Z';

export function markSvg(mark, c, ch, family, weight) {
  const uid = `m${++idCounter}`;
  switch (mark) {
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
 * @param {object} [o.logo] override { mark, layout, colorway }
 * @param {'primary'|'inverse'|'mono'|'white'|'onPrimary'} [o.variant]
 * @param {'horizontal'|'stacked'|'icon'|'wordmark'|'emblem'} [o.layout]
 * @param {string} [o.fontCss] embedded @font-face CSS for standalone export
 * @param {string} [o.background] optional background fill
 */
export function buildLogoSvg({ name, concept, logo, variant = 'primary', layout, fontCss = '', background }) {
  const cfg = { ...concept.logo, ...logo };
  const lay = layout || cfg.layout;
  const c = logoColors(concept.palette, variant, cfg.colorway);
  const wm = wordmarkStyle(concept, name);
  const ch = initialOf(name);
  const markFamily = wm.family;
  const pad = 16;
  const mark = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 100})">${markSvg(cfg.mark, c, ch, markFamily, wm.weight)}</g>`;
  const text = (x, y, size) => `<text x="${x}" y="${y}" text-anchor="middle"${wm.arabic ? ' direction="rtl"' : ''} font-family="${esc(fontStack(wm.family))}" font-weight="${wm.weight}" font-size="${size}" letter-spacing="${(wm.tracking * size).toFixed(2)}" fill="${c.text}">${esc(wm.text)}</text>`;

  let w, h, body;
  if (lay === 'emblem') {
    // Circular badge: mark in the centre, brand name set on the upper arc.
    const R = 92, size0 = 22;
    const tw0 = measureText(wm.text, wm.family, wm.weight, size0, wm.tracking * size0 + 2);
    const size = Math.min(size0, (size0 * 250) / Math.max(tw0, 1));
    const id = `arc${++idCounter}`;
    w = h = 240;
    body = `<circle cx="120" cy="120" r="${R + 20}" fill="none" stroke="${c.fill}" stroke-width="5"/>`
      + `<circle cx="120" cy="120" r="${R - 22}" fill="none" stroke="${c.fill}" stroke-width="1.5"/>`
      + `<defs><path id="${id}" d="M${120 - R + 4} 120a${R - 4} ${R - 4} 0 0 1 ${2 * (R - 4)} 0"/></defs>`
      + `<text font-family="${esc(fontStack(wm.family))}" font-weight="${wm.weight}" font-size="${size.toFixed(1)}" letter-spacing="${(wm.tracking * size + 2).toFixed(2)}" fill="${c.text}"${wm.arabic ? ' direction="rtl"' : ''}><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(wm.text)}</textPath></text>`
      + `<circle cx="${120 - R - 1}" cy="132" r="4" fill="${c.accent}"/><circle cx="${120 + R + 1}" cy="132" r="4" fill="${c.accent}"/>`
      + mark(85, 92, 70);
  } else if (lay === 'icon') {
    w = h = 100 + pad * 2;
    body = mark(pad, pad, 100);
  } else if (lay === 'wordmark') {
    const size = 64 * (wm.arabic ? 1.2 : 1);
    const tw = measureText(wm.text, wm.family, wm.weight, size, wm.tracking * size);
    w = tw + pad * 2; h = size * 1.5 + pad * 2;
    body = text(w / 2, pad + size * 1.02, size);
  } else if (lay === 'stacked') {
    const size = 42 * (wm.arabic ? 1.2 : 1);
    const tw = measureText(wm.text, wm.family, wm.weight, size, wm.tracking * size);
    w = Math.max(100, tw) + pad * 2; h = 100 + 22 + size * 1.25 + pad * 2;
    body = mark((w - 100) / 2, pad, 100) + text(w / 2, pad + 100 + 22 + size * 0.9, size);
  } else {
    const size = 54 * (wm.arabic ? 1.2 : 1), gap = 26;
    const tw = measureText(wm.text, wm.family, wm.weight, size, wm.tracking * size);
    w = 100 + gap + tw + pad * 2; h = 100 + pad * 2;
    const textY = pad + 50 + size * (wm.arabic ? 0.3 : 0.34);
    body = wm.arabic
      ? text(pad + tw / 2, textY, size) + mark(pad + tw + gap, pad, 100)
      : mark(pad, pad, 100) + text(pad + 100 + gap + tw / 2, textY, size);
  }
  w = Math.ceil(w); h = Math.ceil(h);
  const style = fontCss ? `<style>${fontCss}</style>` : '';
  const bg = background ? `<rect width="100%" height="100%" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(name)} logo">${style}${bg}${body}</svg>`;
}

// Embeds the exact font file the wordmark uses, so downloaded SVGs render anywhere.
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

export async function embeddedFontCss(concept, name) {
  const wm = wordmarkStyle(concept, name);
  const meta = FONTS[wm.family];
  if (!meta) return '';
  const url = wm.arabic ? meta.files.arabic || meta.files.latin : meta.files.latin || meta.files.arabic;
  if (!url) return '';
  try {
    const b64 = await toBase64(url);
    return `@font-face{font-family:'${wm.family}';font-weight:${meta.weight};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
  } catch {
    return '';
  }
}

export async function ensureFonts(concept, name) {
  if (typeof document === 'undefined' || !document.fonts) return;
  const wm = wordmarkStyle(concept, name);
  const fams = [wm.family, concept.fonts.heading, concept.fonts.body, concept.fonts.headingAr, concept.fonts.bodyAr];
  await Promise.all(fams.map((f) => document.fonts.load(`${FONTS[f]?.weight || 400} 40px "${f}"`, wm.arabic ? 'ابجد' : 'Abc').catch(() => {})));
  await Promise.all(fams.map((f) => document.fonts.load(`400 16px "${f}"`, 'ابجد Abc').catch(() => {})));
}
