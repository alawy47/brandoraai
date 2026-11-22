// Color math used by the palette generator and by every rendered asset.
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const wrapHue = (h) => ((h % 360) + 360) % 360;

export function hslToHex(h, s, l) {
  h = wrapHue(h); s = clamp(s); l = clamp(l);
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

export function hexToRgb(hex) {
  const m = hex.replace('#', '');
  const v = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

export function rgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

export function cmykString(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = r / 255, G = g / 255, B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k >= 1) return '0, 0, 0, 100';
  const c = (1 - R - k) / (1 - k), m = (1 - G - k) / (1 - k), y = (1 - B - k) / (1 - k);
  return [c, m, y, k].map((v) => Math.round(v * 100)).join(', ');
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const ch = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrastRatio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const isDark = (hex) => luminance(hex) < 0.22;
export const readableOn = (bg, light = '#FFFFFF', dark = '#111014') =>
  contrastRatio(bg, light) >= contrastRatio(bg, dark) ? light : dark;

export function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(A.r, B.r)}${c(A.g, B.g)}${c(A.b, B.b)}`.toUpperCase();
}

// Evocative, bilingual color names built from hue + lightness.
const HUE_NAMES = [
  [15, { en: 'Garnet', ar: 'عقيقي' }], [35, { en: 'Amber', ar: 'كهرماني' }], [52, { en: 'Saffron', ar: 'زعفراني' }],
  [75, { en: 'Olive', ar: 'زيتوني' }], [160, { en: 'Jade', ar: 'يشمي' }], [195, { en: 'Lagoon', ar: 'بحيري' }],
  [235, { en: 'Sapphire', ar: 'ياقوتي' }], [262, { en: 'Indigo', ar: 'نيلي' }], [292, { en: 'Amethyst', ar: 'جمشتي' }],
  [325, { en: 'Orchid', ar: 'سحلبي' }], [345, { en: 'Rosé', ar: 'وردي' }], [361, { en: 'Garnet', ar: 'عقيقي' }],
];
export function colorName(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (s < 0.1) {
    if (l > 0.9) return { en: 'Porcelain', ar: 'خزفي' };
    if (l > 0.7) return { en: 'Mist', ar: 'ضبابي' };
    if (l > 0.35) return { en: 'Graphite', ar: 'رصاصي' };
    return { en: 'Onyx', ar: 'أونيكس' };
  }
  const base = HUE_NAMES.find(([max]) => h < max)[1];
  if (h > 20 && h < 45 && s < 0.45 && l < 0.5) return { en: 'Cocoa', ar: 'كاكاو' };
  if (l > 0.88) return { en: `${base.en} Cream`, ar: `كريمي ${base.ar}` };
  if (l > 0.7) return { en: `Soft ${base.en}`, ar: `${base.ar} ناعم` };
  if (l < 0.2) return { en: `Midnight ${base.en}`, ar: `${base.ar} ليلي` };
  if (l < 0.35) return { en: `Deep ${base.en}`, ar: `${base.ar} عميق` };
  return { en: base.en, ar: base.ar };
}
