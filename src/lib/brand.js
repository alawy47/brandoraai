import { fontStack } from '../data/fonts';
import { isArabicText } from './generator';

export const paletteMap = (concept) => Object.fromEntries(concept.palette.map((c) => [c.role, c.hex]));

// Fonts for content written in the brand language.
export function brandFonts(concept, lang) {
  const ar = lang === 'ar';
  return {
    heading: fontStack(ar ? concept.fonts.headingAr : concept.fonts.heading),
    body: fontStack(ar ? concept.fonts.bodyAr : concept.fonts.body),
  };
}

export const brandDir = (project) => (project.input.language === 'ar' ? 'rtl' : 'ltr');
export const brandLang = (project) => (project.input.language === 'ar' ? 'ar' : 'en');
export const nameIsArabic = (project) => isArabicText(project.input.name);

export function nestSvg(svg, x, y, w, h) {
  return svg
    .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${w}" height="${h}"`)
    .replace('<svg ', `<svg x="${x}" y="${y}" preserveAspectRatio="xMidYMid meet" `);
}
