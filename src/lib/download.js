import { toPng } from 'html-to-image';
import { buildLogoSvg, embeddedFontCss, ensureFonts } from './logoSvg';
import { buildBackgroundSvg } from './backgrounds';
import { slugify } from './generator';

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function svgToPngDataUrl(svg, targetWidth = 2000, background) {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w = vb ? parseFloat(vb[1]) : 500;
  const h = vb ? parseFloat(vb[2]) : 500;
  const scale = targetWidth / w;
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function standaloneLogoSvg(opts) {
  await ensureFonts(opts.concept, opts.name);
  const fontCss = await embeddedFontCss(opts.concept, opts.name);
  return buildLogoSvg({ ...opts, fontCss });
}

export async function downloadLogo({ format, name, concept, variant = 'primary', layout, logo, width = 2000, background, filename }) {
  const svg = await standaloneLogoSvg({ name, concept, variant, layout, logo, background });
  const base = filename || `${slugify(name)}-logo-${layout || concept.logo.layout}-${variant}`;
  if (format === 'svg') {
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${base}.svg`);
  } else {
    const png = await svgToPngDataUrl(svg, width);
    downloadDataUrl(png, `${base}.png`);
  }
}

// html-to-image only looks at HTML elements when deciding which web fonts to embed,
// so fonts used by SVG <text> (logo wordmarks) are registered through a hidden probe.
export async function withSvgFontProbe(node, fn) {
  const families = new Set();
  node.querySelectorAll('text[font-family]').forEach((el) => families.add(el.getAttribute('font-family')));
  const probe = document.createElement('span');
  probe.textContent = '.';
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;overflow:hidden';
  probe.style.fontFamily = [...families].join(',');
  node.appendChild(probe);
  try { return await fn(); } finally { probe.remove(); }
}

export async function nodeToPng(node, pixelRatio = 2) {
  await document.fonts?.ready;
  return withSvgFontProbe(node, () => toPng(node, { pixelRatio, cacheBust: true, skipAutoScale: true }));
}

export async function downloadNode(node, filename, pixelRatio = 2) {
  const png = await nodeToPng(node, pixelRatio);
  downloadDataUrl(png, filename);
}

export async function downloadBackground({ format, styleId, concept, name, w, h, label }) {
  await ensureFonts(concept, name);
  const fontCss = styleId === 'monogram' || /letter|monogram|hexagon|bubble|seal/.test(concept.logo.mark) ? await embeddedFontCss(concept, name) : '';
  const svg = buildBackgroundSvg(styleId, concept, name, w, h, { fontCss });
  const base = `${slugify(name)}-background-${styleId}-${label}`;
  if (format === 'svg') downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${base}.svg`);
  else downloadDataUrl(await svgToPngDataUrl(svg, w), `${base}.png`);
}
