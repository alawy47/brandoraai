// Brand backgrounds and patterns, drawn as SVG at any size from the palette and logo mark.
// Used for wallpapers, cover images, profile pictures and the brand book.
import { markSvg, logoColors, wordmarkStyle } from './logoSvg';
import { initialOf } from './generator';
import { createRng, hashString } from './random';
import { mix, withAlpha } from './color';
import { fontStack } from '../data/fonts';

let uid = 0;

// tone tells overlays which logo variant reads on top: dark → inverse, light → primary, brand → onPrimary.
export const BG_STYLES = [
  { id: 'aurora', tone: 'dark', en: 'Aurora', ar: 'شفق' },
  { id: 'pattern', tone: 'brand', en: 'Mark pattern', ar: 'نقش الرمز' },
  { id: 'girih', tone: 'dark', en: 'Girih stars', ar: 'نجوم هندسية' },
  { id: 'waves', tone: 'light', en: 'Waves', ar: 'أمواج' },
  { id: 'arches', tone: 'light', en: 'Arches', ar: 'أقواس' },
  { id: 'bauhaus', tone: 'light', en: 'Geometric blocks', ar: 'كتل هندسية' },
  { id: 'stripes', tone: 'brand', en: 'Diagonal bands', ar: 'أشرطة مائلة' },
  { id: 'rings', tone: 'light', en: 'Rings', ar: 'حلقات' },
  { id: 'halftone', tone: 'dark', en: 'Halftone', ar: 'نقاط متدرجة' },
  { id: 'monogram', tone: 'brand', en: 'Monogram', ar: 'الحرف الأول' },
  { id: 'split', tone: 'dark', en: 'Split', ar: 'تقسيم مائل' },
  { id: 'sunburst', tone: 'brand', en: 'Sunburst', ar: 'أشعة' },
  { id: 'confetti', tone: 'light', en: 'Confetti', ar: 'قصاصات ملونة' },
  { id: 'blueprint', tone: 'dark', en: 'Blueprint', ar: 'مخطط هندسي' },
  { id: 'gradient', tone: 'brand', en: 'Soft gradient', ar: 'تدرج ناعم' },
];

export const findBg = (id) => BG_STYLES.find((b) => b.id === id) || BG_STYLES[0];
export const overlayVariant = (styleId) => ({ dark: 'inverse', light: 'primary', brand: 'onPrimary' }[findBg(styleId).tone]);

// A translucent panel in the background's own tone, so text stays readable on busy designs.
export function plateColor(styleId, palette) {
  const P = Object.fromEntries(palette.map((c) => [c.role, c.hex]));
  const tone = findBg(styleId).tone;
  return withAlpha(tone === 'light' ? P.light : tone === 'dark' ? P.dark : P.primary, tone === 'light' ? 0.9 : 0.82);
}

export function defaultBg(personalityId) {
  return { luxury: 'girih', modern: 'aurora', minimal: 'rings', bold: 'bauhaus', playful: 'bauhaus', trust: 'waves', natural: 'arches', innovative: 'halftone' }[personalityId] || 'aurora';
}

const P_ = (concept) => Object.fromEntries(concept.palette.map((c) => [c.role, c.hex]));

/**
 * @returns {string} SVG markup filling w × h
 */
export function buildBackgroundSvg(styleId, concept, name, w = 1920, h = 1080, { fontCss = '' } = {}) {
  const P = P_(concept);
  const rng = createRng(hashString(`${concept.id}|${styleId}`));
  const wm = wordmarkStyle(concept, name);
  const ch = initialOf(name);
  const mark = (x, y, s, variant, extra = '') => {
    const c = logoColors(concept.palette, variant, concept.logo.colorway);
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(s / 100).toFixed(4)})" ${extra}>${markSvg(concept.logo.mark, c, ch, wm.family, wm.weight)}</g>`;
  };
  const id = `bg${++uid}`;
  const m = Math.min(w, h), M = Math.max(w, h);
  let body = '';

  switch (styleId) {
    case 'aurora': {
      const blobs = [[P.primary, 0.15, 0.2, 0.55], [P.accent, 0.85, 0.3, 0.42], [P.secondary, 0.55, 1.0, 0.5], [P.primary, 1.0, 0.95, 0.4]];
      body = `<rect width="${w}" height="${h}" fill="${P.dark}"/><defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${(M * 0.09).toFixed(0)}"/></filter></defs><g filter="url(#${id})" opacity="0.85">`
        + blobs.map(([col, x, y, r]) => `<circle cx="${(x * w).toFixed(0)}" cy="${(y * h).toFixed(0)}" r="${(r * M * 0.5).toFixed(0)}" fill="${col}"/>`).join('') + '</g>';
      break;
    }
    case 'pattern': {
      const t = m / 3.2;
      body = `<rect width="${w}" height="${h}" fill="${P.primary}"/><defs><pattern id="${id}" width="${t * 2}" height="${t * 2}" patternUnits="userSpaceOnUse">`
        + mark(t * 0.25, t * 0.25, t * 0.5, 'onPrimary') + mark(t * 1.25, t * 1.25, t * 0.5, 'onPrimary')
        + `</pattern></defs><rect width="${w}" height="${h}" fill="url(#${id})" opacity="0.13"/>`;
      break;
    }
    case 'girih': {
      const t = m / 4;
      const star = (cx, cy, s) => `<g transform="translate(${cx} ${cy})"><rect x="${-s}" y="${-s}" width="${s * 2}" height="${s * 2}"/><rect x="${-s}" y="${-s}" width="${s * 2}" height="${s * 2}" transform="rotate(45)"/><circle r="${s * 0.42}"/></g>`;
      body = `<rect width="${w}" height="${h}" fill="${P.dark}"/><defs><pattern id="${id}" width="${t}" height="${t}" patternUnits="userSpaceOnUse"><g fill="none" stroke="${P.accent}" stroke-width="${(t * 0.012).toFixed(2)}">`
        + star(t / 2, t / 2, t * 0.3) + star(0, 0, t * 0.12) + star(t, 0, t * 0.12) + star(0, t, t * 0.12) + star(t, t, t * 0.12)
        + `</g></pattern><radialGradient id="${id}g" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stop-color="${P.primary}" stop-opacity="0.55"/><stop offset="1" stop-color="${P.dark}" stop-opacity="0"/></radialGradient></defs>`
        + `<rect width="${w}" height="${h}" fill="url(#${id}g)"/><rect width="${w}" height="${h}" fill="url(#${id})" opacity="0.5"/>`;
      break;
    }
    case 'waves': {
      const cols = [P.secondary, mix(P.primary, P.light, 0.35), P.primary, P.dark];
      body = `<rect width="${w}" height="${h}" fill="${P.light}"/>` + cols.map((col, i) => {
        const y = h * (0.42 + i * 0.14), a = h * 0.07;
        return `<path d="M0 ${y} C${w * 0.25} ${y - a} ${w * 0.35} ${y + a} ${w * 0.6} ${y} S${w * 0.9} ${y - a} ${w} ${y + a * 0.4} V${h} H0Z" fill="${col}"/>`;
      }).join('') + `<circle cx="${w * 0.82}" cy="${h * 0.22}" r="${m * 0.08}" fill="${P.accent}"/>`;
      break;
    }
    case 'arches': {
      const cx = w * 0.72, base = h;
      body = `<rect width="${w}" height="${h}" fill="${P.light}"/>` + [0.95, 0.75, 0.55, 0.35].map((k, i) => {
        const r = m * 0.5 * k, wd = r;
        return `<path d="M${cx - wd} ${base} V${base - r * 1.1} a${wd} ${wd} 0 0 1 ${wd * 2} 0 V${base}Z" fill="${[P.secondary, mix(P.primary, P.light, 0.45), P.primary, P.dark][i]}"/>`;
      }).join('') + `<circle cx="${w * 0.2}" cy="${h * 0.3}" r="${m * 0.07}" fill="${P.accent}"/>`;
      break;
    }
    case 'bauhaus': {
      const cell = m / 3, cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      const palette = [P.primary, P.secondary, P.accent, P.dark, mix(P.primary, P.light, 0.5)];
      body = `<rect width="${w}" height="${h}" fill="${P.light}"/>`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c * cell, y = r * cell, col = rng.pick(palette), kind = rng.int(0, 4), rot = rng.int(0, 3) * 90;
        const g = `transform="rotate(${rot} ${x + cell / 2} ${y + cell / 2})"`;
        if (kind === 0) body += `<path d="M${x} ${y + cell} A${cell} ${cell} 0 0 1 ${x + cell} ${y} V${y + cell}Z" fill="${col}" ${g}/>`;
        else if (kind === 1) body += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.38}" fill="${col}"/>`;
        else if (kind === 2) body += `<path d="M${x} ${y + cell / 2} a${cell / 2} ${cell / 2} 0 0 1 ${cell} 0Z" fill="${col}" ${g}/>`;
        else if (kind === 3) body += `<rect x="${x + cell * 0.12}" y="${y + cell * 0.12}" width="${cell * 0.76}" height="${cell * 0.76}" fill="${col}"/>`;
      }
      break;
    }
    case 'stripes': {
      const bw = M / 7;
      body = `<rect width="${w}" height="${h}" fill="${P.primary}"/><g transform="rotate(-30 ${w / 2} ${h / 2})">`
        + [[P.secondary, 0.45], [P.accent, 0.9], [P.dark, 0.35], [P.secondary, 0.25]].map(([col, op], i) =>
          `<rect x="${-M}" y="${h / 2 - bw * 1.6 + i * bw * 1.1}" width="${M * 3}" height="${bw * (i === 1 ? 0.35 : 0.7)}" fill="${col}" opacity="${op}"/>`).join('') + '</g>';
      break;
    }
    case 'rings': {
      const cx = w * 0.85, cy = h * 0.15;
      body = `<rect width="${w}" height="${h}" fill="${mix(P.light, P.secondary, 0.25)}"/>` + Array.from({ length: 9 }, (_, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${m * 0.12 * (i + 1)}" fill="none" stroke="${i % 3 === 2 ? P.accent : P.primary}" stroke-width="${m * 0.008}" opacity="${0.6 - i * 0.05}"/>`).join('')
        + `<circle cx="${cx}" cy="${cy}" r="${m * 0.07}" fill="${P.primary}"/>`;
      break;
    }
    case 'halftone': {
      const step = m / 18;
      body = `<rect width="${w}" height="${h}" fill="${P.dark}"/>`;
      for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) {
        const t = Math.max(0, 1 - Math.hypot(x / w - 0.8, y / h - 0.7) * 1.3);
        if (t > 0.04) body += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(step * 0.42 * t).toFixed(2)}" fill="${t > 0.6 ? P.accent : P.primary}"/>`;
      }
      break;
    }
    case 'monogram': {
      const s = m * 1.25;
      body = `<rect width="${w}" height="${h}" fill="${P.primary}"/>`
        + `<text x="${w * 0.78}" y="${h * 0.5}" dy="0.36em" text-anchor="middle" font-family="${fontStack(wm.family).replace(/"/g, "'")}" font-weight="${wm.weight}" font-size="${s.toFixed(0)}" fill="${P.light}" opacity="0.1">${ch}</text>`
        + `<circle cx="${w * 0.12}" cy="${h * 0.82}" r="${m * 0.05}" fill="${P.accent}"/>`
        + `<rect x="0" y="${h - m * 0.03}" width="${w}" height="${m * 0.03}" fill="${P.accent}"/>`;
      break;
    }
    case 'split': {
      body = `<rect width="${w}" height="${h}" fill="${P.dark}"/><path d="M${w * 0.58} 0 H${w} V${h} H${w * 0.36}Z" fill="${P.primary}"/>`
        + `<path d="M${w * 0.58} 0 L${w * 0.36} ${h}" stroke="${P.accent}" stroke-width="${m * 0.018}"/>`
        + mark(w * 0.68, h * 0.5 - m * 0.22, m * 0.44, 'onPrimary', 'opacity="0.18"');
      break;
    }
    case 'sunburst': {
      const cx = w * 0.5, cy = h * 1.05, R = M * 1.4, n = 24;
      body = `<rect width="${w}" height="${h}" fill="${P.primary}"/><g fill="${P.light}" opacity="0.08">` + Array.from({ length: n }, (_, i) => {
        if (i % 2) return '';
        const a1 = (Math.PI * i) / n - Math.PI, a2 = (Math.PI * (i + 1)) / n - Math.PI;
        return `<path d="M${cx} ${cy}L${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}L${(cx + R * Math.cos(a2)).toFixed(1)} ${(cy + R * Math.sin(a2)).toFixed(1)}Z"/>`;
      }).join('') + `</g><circle cx="${cx}" cy="${cy}" r="${m * 0.42}" fill="${P.accent}"/><circle cx="${cx}" cy="${cy}" r="${m * 0.3}" fill="${mix(P.accent, P.light, 0.35)}"/>`;
      break;
    }
    case 'confetti': {
      const cols = [P.primary, P.accent, P.secondary, P.dark];
      body = `<rect width="${w}" height="${h}" fill="${P.light}"/>`;
      const n = Math.round((w * h) / (m * m) * 26);
      for (let i = 0; i < n; i++) {
        const x = rng.range(0, w), y = rng.range(0, h), sz = rng.range(0.018, 0.045) * m, col = rng.pick(cols), r = rng.int(0, 180), k = rng.int(0, 2);
        if (k === 0) body += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(sz / 2).toFixed(1)}" fill="${col}"/>`;
        else if (k === 1) body += `<rect x="${(x - sz).toFixed(0)}" y="${(y - sz * 0.2).toFixed(0)}" width="${(sz * 2).toFixed(1)}" height="${(sz * 0.4).toFixed(1)}" rx="${(sz * 0.2).toFixed(1)}" fill="${col}" transform="rotate(${r} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
        else body += `<path d="M${(x - sz / 2).toFixed(0)} ${(y + sz / 2).toFixed(0)}l${(sz / 2).toFixed(1)} ${(-sz).toFixed(1)} ${(sz / 2).toFixed(1)} ${sz.toFixed(1)}z" fill="${col}" transform="rotate(${r} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
      break;
    }
    case 'blueprint': {
      const g = m / 12;
      body = `<rect width="${w}" height="${h}" fill="${mix(P.dark, P.primary, 0.25)}"/><defs><pattern id="${id}" width="${g * 4}" height="${g * 4}" patternUnits="userSpaceOnUse"><path d="M${g * 4} 0H0V${g * 4}" fill="none" stroke="${P.light}" stroke-opacity="0.16" stroke-width="${(m * 0.002).toFixed(2)}"/>`
        + [1, 2, 3].map((k) => `<path d="M${g * k} 0V${g * 4}M0 ${g * k}H${g * 4}" stroke="${P.light}" stroke-opacity="0.06" stroke-width="${(m * 0.0012).toFixed(2)}"/>`).join('')
        + `</pattern></defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`
        + `<g opacity="0.5">${mark(w * 0.62, h * 0.5 - m * 0.3, m * 0.6, 'inverse', '')}</g>`
        + `<circle cx="${w * 0.62 + m * 0.3}" cy="${h * 0.5}" r="${m * 0.42}" fill="none" stroke="${P.accent}" stroke-width="${m * 0.003}" stroke-dasharray="${m * 0.01} ${m * 0.01}"/>`;
      break;
    }
    case 'gradient': {
      body = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.primary}"/><stop offset="0.65" stop-color="${mix(P.primary, P.accent, 0.55)}"/><stop offset="1" stop-color="${P.accent}"/></linearGradient></defs>`
        + `<rect width="${w}" height="${h}" fill="url(#${id})"/><circle cx="${w * 0.1}" cy="${h * 0.95}" r="${m * 0.5}" fill="${P.light}" opacity="0.06"/><circle cx="${w * 0.95}" cy="${h * 0.05}" r="${m * 0.32}" fill="${P.dark}" opacity="0.08"/>`;
      break;
    }
    default:
      body = `<rect width="${w}" height="${h}" fill="${P.primary}"/>`;
  }
  const style = fontCss ? `<style>${fontCss}</style>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${style}${body}</svg>`;
}

