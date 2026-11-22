// Complete brand package as a ZIP: logo variations (SVG with embedded fonts, transparent PNG,
// JPG previews), palette swatches, typography spec, backgrounds and the PDF guidelines.
import JSZip from 'jszip';
import { standaloneLogoSvg, svgToPngDataUrl } from './download';
import { buildBackgroundSvg, BG_STYLES, defaultBg } from './backgrounds';
import { embeddedFontCss, ensureFonts } from './logoSvg';
import { paletteAse, paletteGpl, paletteCss, paletteJson, typographySpec } from './specExport';
import { descriptorFor } from './logoDirections';
import { slugify } from './generator';
import { paletteMap } from './brand';

const dataUrlToBytes = (url) => Uint8Array.from(atob(url.split(',')[1]), (c) => c.charCodeAt(0));

async function svgToJpg(svg, width, background) {
  const png = await svgToPngDataUrl(svg, width, background);
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = png; });
  const pad = Math.round(width * 0.12);
  const canvas = document.createElement('canvas');
  canvas.width = img.width + pad * 2; canvas.height = img.height + pad * 2;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, pad, pad);
  return canvas.toDataURL('image/jpeg', 0.92);
}

export async function buildBrandPackage({ project, concept, pdfBlob, onProgress }) {
  const zip = new JSZip();
  const name = project.input.name;
  const slug = slugify(name);
  const P = paletteMap(concept);
  const descriptor = descriptorFor(project);
  const layouts = [...new Set([concept.logo.layout || 'horizontal', 'horizontal', 'stacked', 'icon', 'wordmark'])];
  const variants = [['full-colour', 'primary'], ['black', 'mono'], ['white', 'white'], ['reversed', 'inverse']];
  const total = layouts.length * variants.length + 6;
  let done = 0;
  const tick = (label) => onProgress?.(++done, total, label);

  for (const layout of layouts) {
    for (const [label, variant] of variants) {
      const svg = await standaloneLogoSvg({ name, concept, variant, layout, descriptor });
      const base = `${slug}-logo-${layout}-${label}`;
      zip.file(`logos/svg/${base}.svg`, svg);
      zip.file(`logos/png/${base}.png`, dataUrlToBytes(await svgToPngDataUrl(svg, layout === 'icon' ? 1024 : 2000)));
      if (variant === 'primary') zip.file(`logos/jpg-previews/${base}-on-light.jpg`, dataUrlToBytes(await svgToJpg(svg, 1600, P.light)));
      if (variant === 'inverse') zip.file(`logos/jpg-previews/${base}-on-dark.jpg`, dataUrlToBytes(await svgToJpg(svg, 1600, P.dark)));
      tick(base);
    }
  }
  // Favicon and app icon
  const fav = await standaloneLogoSvg({ name, concept, variant: 'onPrimary', layout: 'icon', background: P.primary });
  zip.file(`logos/icons/${slug}-favicon.svg`, fav);
  for (const s of [32, 180, 512, 1024]) zip.file(`logos/icons/${slug}-icon-${s}.png`, dataUrlToBytes(await svgToPngDataUrl(fav, s)));
  tick('icons');

  zip.file(`palette/${slug}.ase`, paletteAse(concept.palette, name));
  zip.file(`palette/${slug}.gpl`, paletteGpl(concept.palette, name));
  zip.file(`palette/${slug}-palette.css`, paletteCss(concept.palette));
  zip.file(`palette/${slug}-palette.json`, paletteJson(concept.palette));
  tick('palette');

  const spec = typographySpec(project, concept);
  zip.file(`typography/${slug}-typography.md`, spec.md);
  zip.file(`typography/${slug}-typography.css`, spec.css);
  zip.file(`typography/${slug}-typography.json`, spec.json);
  tick('typography');

  await ensureFonts(concept, name);
  const fontCss = await embeddedFontCss(concept, name);
  const chosen = concept.background || defaultBg(project.input.personality);
  for (const b of BG_STYLES) zip.file(`backgrounds/svg/${slug}-${b.id}.svg`, buildBackgroundSvg(b.id, concept, name, 1920, 1080, { fontCss }));
  for (const [w, h, label] of [[1920, 1080, 'desktop'], [1080, 1920, 'phone']]) {
    zip.file(`backgrounds/${slug}-${chosen}-${label}.png`, dataUrlToBytes(await svgToPngDataUrl(buildBackgroundSvg(chosen, concept, name, w, h, { fontCss }), w)));
  }
  tick('backgrounds');

  if (pdfBlob) zip.file(`${slug}-brand-guidelines.pdf`, pdfBlob);
  zip.file('README.txt', [
    `${name} brand identity package`,
    '',
    'logos/svg          Vector logos. Fonts are embedded, so they open correctly without installing anything.',
    'logos/png          Transparent PNG, 2000px wide (icons 1024px).',
    'logos/jpg-previews Previews on the brand light and dark colours.',
    'logos/icons        Favicon (SVG) and app icons (32, 180, 512, 1024px).',
    'palette            .ase for Adobe apps, .gpl for GIMP/Inkscape/Affinity, CSS variables and JSON tokens.',
    'typography         Font roles, type scale and licence links (Markdown, CSS, JSON).',
    'backgrounds        All background styles as SVG, and the selected style as desktop and phone PNG.',
    `${slug}-brand-guidelines.pdf  Brand guidelines.`,
    '',
    'Fonts are open-source (SIL Open Font License or Apache 2.0) from Google Fonts / Fontsource.',
    'Run a trademark search before registering the logo.',
  ].join('\n'));
  tick('readme');
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
