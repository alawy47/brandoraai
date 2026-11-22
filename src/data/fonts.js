// Brand typefaces. CSS imports make them available to the page; the ?url imports
// give the raw woff2 files so exported SVG/PNG logos can embed the font.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import f0 from '@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/700.css';
import f1 from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff2?url';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import f2 from '@fontsource/fraunces/files/fraunces-latin-700-normal.woff2?url';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
import f3 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/700.css';
import f4 from '@fontsource/outfit/files/outfit-latin-700-normal.woff2?url';
import '@fontsource/sora/400.css';
import '@fontsource/sora/700.css';
import f5 from '@fontsource/sora/files/sora-latin-700-normal.woff2?url';
import '@fontsource/unbounded/400.css';
import '@fontsource/unbounded/700.css';
import f6 from '@fontsource/unbounded/files/unbounded-latin-700-normal.woff2?url';
import '@fontsource/syne/400.css';
import '@fontsource/syne/700.css';
import f7 from '@fontsource/syne/files/syne-latin-700-normal.woff2?url';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import f8 from '@fontsource/poppins/files/poppins-latin-700-normal.woff2?url';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/700.css';
import f9 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2?url';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import f10 from '@fontsource/inter/files/inter-latin-600-normal.woff2?url';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import f11 from '@fontsource/manrope/files/manrope-latin-600-normal.woff2?url';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/600.css';
import f12 from '@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2?url';
import '@fontsource/lora/400.css';
import '@fontsource/lora/600.css';
import f13 from '@fontsource/lora/files/lora-latin-600-normal.woff2?url';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import f14 from '@fontsource/amiri/files/amiri-latin-700-normal.woff2?url';
import f15 from '@fontsource/amiri/files/amiri-arabic-700-normal.woff2?url';
import '@fontsource/el-messiri/400.css';
import '@fontsource/el-messiri/700.css';
import f16 from '@fontsource/el-messiri/files/el-messiri-latin-700-normal.woff2?url';
import f17 from '@fontsource/el-messiri/files/el-messiri-arabic-700-normal.woff2?url';
import '@fontsource/readex-pro/400.css';
import '@fontsource/readex-pro/700.css';
import f18 from '@fontsource/readex-pro/files/readex-pro-latin-700-normal.woff2?url';
import f19 from '@fontsource/readex-pro/files/readex-pro-arabic-700-normal.woff2?url';
import '@fontsource/lalezar/400.css';
import f20 from '@fontsource/lalezar/files/lalezar-latin-400-normal.woff2?url';
import f21 from '@fontsource/lalezar/files/lalezar-arabic-400-normal.woff2?url';
import '@fontsource/reem-kufi/400.css';
import '@fontsource/reem-kufi/700.css';
import f22 from '@fontsource/reem-kufi/files/reem-kufi-latin-700-normal.woff2?url';
import f23 from '@fontsource/reem-kufi/files/reem-kufi-arabic-700-normal.woff2?url';
import '@fontsource/changa/400.css';
import '@fontsource/changa/700.css';
import f24 from '@fontsource/changa/files/changa-latin-700-normal.woff2?url';
import f25 from '@fontsource/changa/files/changa-arabic-700-normal.woff2?url';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import f26 from '@fontsource/cairo/files/cairo-latin-700-normal.woff2?url';
import f27 from '@fontsource/cairo/files/cairo-arabic-700-normal.woff2?url';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import f28 from '@fontsource/tajawal/files/tajawal-latin-700-normal.woff2?url';
import f29 from '@fontsource/tajawal/files/tajawal-arabic-700-normal.woff2?url';
import '@fontsource/almarai/400.css';
import '@fontsource/almarai/700.css';
import f30 from '@fontsource/almarai/files/almarai-latin-700-normal.woff2?url';
import f31 from '@fontsource/almarai/files/almarai-arabic-700-normal.woff2?url';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import f32 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-latin-600-normal.woff2?url';
import f33 from '@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2?url';

export const FONTS = {
  'Playfair Display': { family: 'Playfair Display', script: 'latin', category: 'serif', weight: 700, files: { latin: f0 } },
  'Cormorant Garamond': { family: 'Cormorant Garamond', script: 'latin', category: 'serif', weight: 700, files: { latin: f1 } },
  'Fraunces': { family: 'Fraunces', script: 'latin', category: 'serif', weight: 700, files: { latin: f2 } },
  'Space Grotesk': { family: 'Space Grotesk', script: 'latin', category: 'sans', weight: 700, files: { latin: f3 } },
  'Outfit': { family: 'Outfit', script: 'latin', category: 'sans', weight: 700, files: { latin: f4 } },
  'Sora': { family: 'Sora', script: 'latin', category: 'sans', weight: 700, files: { latin: f5 } },
  'Unbounded': { family: 'Unbounded', script: 'latin', category: 'display', weight: 700, files: { latin: f6 } },
  'Syne': { family: 'Syne', script: 'latin', category: 'display', weight: 700, files: { latin: f7 } },
  'Poppins': { family: 'Poppins', script: 'latin', category: 'sans', weight: 700, files: { latin: f8 } },
  'Montserrat': { family: 'Montserrat', script: 'latin', category: 'sans', weight: 700, files: { latin: f9 } },
  'Inter': { family: 'Inter', script: 'latin', category: 'sans', weight: 600, files: { latin: f10 } },
  'Manrope': { family: 'Manrope', script: 'latin', category: 'sans', weight: 600, files: { latin: f11 } },
  'DM Sans': { family: 'DM Sans', script: 'latin', category: 'sans', weight: 600, files: { latin: f12 } },
  'Lora': { family: 'Lora', script: 'latin', category: 'serif', weight: 600, files: { latin: f13 } },
  'Amiri': { family: 'Amiri', script: 'arabic', category: 'serif', weight: 700, files: { latin: f14, arabic: f15 } },
  'El Messiri': { family: 'El Messiri', script: 'arabic', category: 'sans', weight: 700, files: { latin: f16, arabic: f17 } },
  'Readex Pro': { family: 'Readex Pro', script: 'arabic', category: 'sans', weight: 700, files: { latin: f18, arabic: f19 } },
  'Lalezar': { family: 'Lalezar', script: 'arabic', category: 'display', weight: 400, files: { latin: f20, arabic: f21 } },
  'Reem Kufi': { family: 'Reem Kufi', script: 'arabic', category: 'display', weight: 700, files: { latin: f22, arabic: f23 } },
  'Changa': { family: 'Changa', script: 'arabic', category: 'sans', weight: 700, files: { latin: f24, arabic: f25 } },
  'Cairo': { family: 'Cairo', script: 'arabic', category: 'sans', weight: 700, files: { latin: f26, arabic: f27 } },
  'Tajawal': { family: 'Tajawal', script: 'arabic', category: 'sans', weight: 700, files: { latin: f28, arabic: f29 } },
  'Almarai': { family: 'Almarai', script: 'arabic', category: 'sans', weight: 700, files: { latin: f30, arabic: f31 } },
  'IBM Plex Sans Arabic': { family: 'IBM Plex Sans Arabic', script: 'arabic', category: 'sans', weight: 600, files: { latin: f32, arabic: f33 } },
};

import { libraryFallback } from './fontLibrary';

export const fontStack = (family) => {
  const f = FONTS[family];
  const fallback = f ? (f.category === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif') : libraryFallback(family);
  return `'${family}', ${fallback}`;
};
