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
 * @param {'horizontal'|'stacked'|'icon'|'wordmark'} [o.layout]
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
  if (lay === 'icon') {
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
