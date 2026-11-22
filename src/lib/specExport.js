// Palette and typography spec files: Adobe Swatch Exchange (.ase), GIMP/Inkscape (.gpl),
// CSS custom properties, JSON tokens and a Markdown spec sheet.
import { hexToRgb, rgbString, cmykString } from './color';
import { fontStack } from '../data/fonts';
import { findLibraryFont } from '../data/fontLibrary';

const roleName = (c) => `${c.role[0].toUpperCase()}${c.role.slice(1)} - ${c.name.en}`;

/** Adobe Swatch Exchange v1.0 (big-endian), readable by Illustrator, Photoshop, InDesign and Affinity. */
export function paletteAse(palette, groupName = 'Brand') {
  const chunks = [];
  const str = (s) => { const b = new Uint8Array(2 + (s.length + 1) * 2); const v = new DataView(b.buffer); v.setUint16(0, s.length + 1); [...s].forEach((ch, i) => v.setUint16(2 + i * 2, ch.charCodeAt(0))); return b; };
  const block = (type, body) => { const b = new Uint8Array(6 + body.length); const v = new DataView(b.buffer); v.setUint16(0, type); v.setUint32(2, body.length); b.set(body, 6); return b; };
  const concat = (arr) => { const out = new Uint8Array(arr.reduce((n, a) => n + a.length, 0)); let o = 0; arr.forEach((a) => { out.set(a, o); o += a.length; }); return out; };
  chunks.push(block(0xc001, str(groupName)));
  for (const c of palette) {
    const { r, g, b } = hexToRgb(c.hex);
    const color = new Uint8Array(4 + 12 + 2); const v = new DataView(color.buffer);
    color.set([0x52, 0x47, 0x42, 0x20], 0); // "RGB "
    v.setFloat32(4, r / 255); v.setFloat32(8, g / 255); v.setFloat32(12, b / 255); v.setUint16(16, 2); // global=0, spot=1, normal=2
    chunks.push(block(0x0001, concat([str(roleName(c)), color])));
  }
  chunks.push(block(0xc002, new Uint8Array(0)));
  const header = new Uint8Array(12); const hv = new DataView(header.buffer);
  header.set([0x41, 0x53, 0x45, 0x46]); hv.setUint16(4, 1); hv.setUint16(6, 0); hv.setUint32(8, chunks.length);
  return concat([header, ...chunks]);
}

export const paletteGpl = (palette, name) => `GIMP Palette\nName: ${name}\nColumns: ${palette.length}\n#\n${palette.map((c) => { const { r, g, b } = hexToRgb(c.hex); return `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${roleName(c)}`; }).join('\n')}\n`;

export const paletteCss = (palette) => `:root {\n${palette.map((c) => `  --brand-${c.role}: ${c.hex}; /* ${c.name.en} */`).join('\n')}\n}\n`;

export const paletteJson = (palette) => JSON.stringify(palette.map((c) => ({ role: c.role, name: c.name, hex: c.hex, rgb: rgbString(c.hex), cmyk: cmykString(c.hex) })), null, 2);

const SCALE = [['display', 64, 1.05], ['h1', 44, 1.1], ['h2', 30, 1.2], ['h3', 22, 1.3], ['body', 16, 1.6], ['caption', 13, 1.5]];

export function typographySpec(project, concept) {
  const f = concept.fonts;
  const source = (fam) => (findLibraryFont(fam) ? `https://fonts.google.com/specimen/${fam.replace(/ /g, '+')}` : 'Bundled with BRANDORA (Fontsource, SIL OFL)');
  const json = {
    brand: project.input.name,
    fonts: {
      latin: { heading: f.heading, body: f.body },
      arabic: { heading: f.headingAr, body: f.bodyAr },
      logo: { latin: concept.logo.font || f.heading, arabic: concept.logo.fontAr || f.headingAr, weight: concept.logo.weight || 700, letterSpacingEm: concept.logo.tracking ?? 0, case: concept.logo.case || 'as typed' },
    },
    scale: SCALE.map(([role, size, lh]) => ({ role, sizePx: size, lineHeight: lh, family: size >= 22 ? 'heading' : 'body', weight: size >= 22 ? 700 : 400 })),
    licences: [...new Set([f.heading, f.body, f.headingAr, f.bodyAr, concept.logo.font, concept.logo.fontAr].filter(Boolean))].map((fam) => ({ family: fam, source: source(fam), licence: 'SIL Open Font License 1.1 (or Apache 2.0)' })),
  };
  const css = `/* ${project.input.name} typography */\n:root {\n  --font-heading: ${fontStack(f.heading)};\n  --font-body: ${fontStack(f.body)};\n  --font-heading-ar: ${fontStack(f.headingAr)};\n  --font-body-ar: ${fontStack(f.bodyAr)};\n}\n${SCALE.map(([role, size, lh]) => `.text-${role} { font-family: var(--font-${size >= 22 ? 'heading' : 'body'}); font-size: ${size / 16}rem; line-height: ${lh}; font-weight: ${size >= 22 ? 700 : 400}; }`).join('\n')}\n[dir="rtl"] { --font-heading: var(--font-heading-ar); --font-body: var(--font-body-ar); }\n`;
  const md = `# ${project.input.name}: typography\n\n| Role | Latin | Arabic |\n|---|---|---|\n| Heading | ${f.heading} | ${f.headingAr} |\n| Body | ${f.body} | ${f.bodyAr} |\n| Logo | ${json.fonts.logo.latin} | ${json.fonts.logo.arabic} |\n\nLogo weight ${json.fonts.logo.weight}, letter spacing ${json.fonts.logo.letterSpacingEm}em.\n\n## Type scale\n\n| Style | Size | Line height | Font |\n|---|---|---|---|\n${json.scale.map((s) => `| ${s.role} | ${s.sizePx}px | ${s.lineHeight} | ${s.family} ${s.weight} |`).join('\n')}\n\n## Sources and licences\n\n${json.licences.map((l) => `- ${l.family}: ${l.source}`).join('\n')}\n`;
  return { json: JSON.stringify(json, null, 2), css, md };
}
