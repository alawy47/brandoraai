// Typography library: Google Fonts (all SIL Open Font License or Apache 2.0), loaded on demand.
// Weights listed here were checked against the Google Fonts CSS2 API.
// cat: sans | geometric | minimal | luxury | editorial | display | futuristic | vintage | script | fashion | rounded | arabic

const L = (family, cat, weights, extra = {}) => ({ family, cat, weights, script: 'latin', ...extra });
const A = (family, style, weights, extra = {}) => ({ family, cat: 'arabic', style, weights, script: 'arabic', ...extra });

export const FONT_LIBRARY = [
  // Modern sans-serif
  L('Inter', 'sans', [400, 600, 700]), L('Manrope', 'sans', [400, 600, 700, 800]), L('DM Sans', 'sans', [400, 500, 700]),
  L('Plus Jakarta Sans', 'sans', [400, 600, 700, 800]), L('Outfit', 'sans', [300, 400, 600, 700]), L('Sora', 'sans', [300, 400, 600, 700]),
  L('Space Grotesk', 'sans', [400, 500, 700]), L('Work Sans', 'sans', [300, 400, 600, 700]), L('Figtree', 'sans', [400, 600, 700, 800]),
  L('Onest', 'sans', [400, 600, 700]), L('Instrument Sans', 'sans', [400, 600, 700]), L('Albert Sans', 'sans', [300, 400, 600, 700]),
  L('IBM Plex Sans', 'sans', [300, 400, 600, 700]), L('Source Sans 3', 'sans', [300, 400, 600, 700]),
  // Geometric
  L('Montserrat', 'geometric', [300, 400, 600, 700, 800]), L('Poppins', 'geometric', [300, 400, 600, 700, 800]), L('Jost', 'geometric', [300, 400, 500, 700]),
  L('Urbanist', 'geometric', [300, 400, 600, 800]), L('Lexend', 'geometric', [300, 400, 600, 700]), L('Red Hat Display', 'geometric', [400, 500, 700, 900]),
  L('Kumbh Sans', 'geometric', [400, 600, 700]), L('League Spartan', 'geometric', [400, 600, 800]),
  // Minimalist
  L('Josefin Sans', 'minimal', [300, 400, 600, 700]), L('Raleway', 'minimal', [300, 400, 600, 800]), L('Quicksand', 'minimal', [300, 400, 600, 700]),
  L('Didact Gothic', 'minimal', [400]), L('Questrial', 'minimal', [400]), L('Tenor Sans', 'minimal', [400]),
  // Luxury serif
  L('Playfair Display', 'luxury', [400, 600, 700, 800]), L('Cormorant Garamond', 'luxury', [300, 400, 600, 700]), L('Bodoni Moda', 'luxury', [400, 600, 700]),
  L('Cinzel', 'luxury', [400, 600, 700]), L('Marcellus', 'luxury', [400]), L('Italiana', 'luxury', [400]), L('Gilda Display', 'luxury', [400]),
  L('Prata', 'luxury', [400]), L('Cormorant', 'luxury', [300, 400, 600, 700]), L('Libre Caslon Display', 'luxury', [400]),
  // Elegant editorial
  L('Fraunces', 'editorial', [300, 400, 600, 700, 900]), L('DM Serif Display', 'editorial', [400]), L('Instrument Serif', 'editorial', [400]),
  L('Libre Baskerville', 'editorial', [400, 700]), L('Lora', 'editorial', [400, 600, 700]), L('EB Garamond', 'editorial', [400, 600, 700]),
  L('Newsreader', 'editorial', [400, 600, 700]), L('Source Serif 4', 'editorial', [400, 600, 700]), L('Young Serif', 'editorial', [400]), L('Gloock', 'editorial', [400]),
  // Bold display
  L('Anton', 'display', [400]), L('Bebas Neue', 'display', [400]), L('Archivo Black', 'display', [400]), L('Abril Fatface', 'display', [400]),
  L('Alfa Slab One', 'display', [400]), L('Unbounded', 'display', [400, 600, 800]), L('Syne', 'display', [400, 600, 700, 800]),
  L('Bricolage Grotesque', 'display', [400, 600, 800]), L('Big Shoulders Display', 'display', [400, 700, 900]), L('Oswald', 'display', [400, 600, 700]),
  L('Dela Gothic One', 'display', [400]), L('Rubik Mono One', 'display', [400]),
  // Futuristic
  L('Orbitron', 'futuristic', [400, 600, 800, 900]), L('Michroma', 'futuristic', [400]), L('Audiowide', 'futuristic', [400]), L('Exo 2', 'futuristic', [300, 400, 600, 800]),
  L('Chakra Petch', 'futuristic', [400, 600, 700]), L('Oxanium', 'futuristic', [400, 600, 800]), L('Rajdhani', 'futuristic', [400, 600, 700]),
  L('Tomorrow', 'futuristic', [400, 600, 700]), L('Saira', 'futuristic', [400, 600, 800]), L('Major Mono Display', 'futuristic', [400]),
  // Vintage & retro
  L('Rye', 'vintage', [400]), L('Bitter', 'vintage', [400, 700, 800]), L('Zilla Slab', 'vintage', [400, 600, 700]), L('Arvo', 'vintage', [400, 700]),
  L('Old Standard TT', 'vintage', [400, 700]), L('Playfair Display SC', 'vintage', [400, 700]), L('Cinzel Decorative', 'vintage', [400, 700]),
  L('Righteous', 'vintage', [400]), L('Monoton', 'vintage', [400]), L('Bungee', 'vintage', [400]), L('Ultra', 'vintage', [400]), L('Fredericka the Great', 'vintage', [400]),
  // Handwritten & script
  L('Pacifico', 'script', [400]), L('Great Vibes', 'script', [400]), L('Dancing Script', 'script', [400, 600, 700]), L('Caveat', 'script', [400, 600, 700]),
  L('Sacramento', 'script', [400]), L('Allura', 'script', [400]), L('Satisfy', 'script', [400]), L('Kaushan Script', 'script', [400]),
  L('Parisienne', 'script', [400]), L('Yellowtail', 'script', [400]), L('Permanent Marker', 'script', [400]), L('Shadows Into Light', 'script', [400]),
  // Fashion
  L('Syncopate', 'fashion', [400, 700]), L('Montserrat Alternates', 'fashion', [400, 600, 700]), L('Poiret One', 'fashion', [400]), L('Limelight', 'fashion', [400]),
  L('Six Caps', 'fashion', [400]), L('Antonio', 'fashion', [400, 600, 700]), L('Gruppo', 'fashion', [400]), L('Krona One', 'fashion', [400]),
  // Rounded & friendly
  L('Fredoka', 'rounded', [400, 500, 600, 700]), L('Baloo 2', 'rounded', [400, 600, 800]), L('Nunito', 'rounded', [400, 700, 800]),
  L('Comfortaa', 'rounded', [400, 700]), L('Varela Round', 'rounded', [400]), L('Chewy', 'rounded', [400]),
  // Arabic
  A('Cairo', 'sans', [400, 600, 700, 800]), A('Tajawal', 'sans', [400, 500, 700, 800]), A('Almarai', 'sans', [400, 700, 800]),
  A('IBM Plex Sans Arabic', 'sans', [400, 600, 700]), A('Readex Pro', 'sans', [300, 400, 600, 700]), A('Noto Kufi Arabic', 'kufi', [400, 600, 800]),
  A('Noto Naskh Arabic', 'naskh', [400, 600, 700]), A('Amiri', 'naskh', [400, 700]), A('Aref Ruqaa', 'calligraphic', [400, 700]),
  A('Reem Kufi', 'kufi', [400, 500, 600, 700]), A('El Messiri', 'display', [400, 600, 700]), A('Changa', 'sans', [300, 400, 600, 800]),
  A('Lalezar', 'display', [400]), A('Rakkas', 'display', [400]), A('Marhey', 'rounded', [400, 600, 700]), A('Lateef', 'naskh', [400, 700]),
  A('Harmattan', 'sans', [400, 700]), A('Mada', 'sans', [400, 600, 900]), A('Markazi Text', 'naskh', [400, 600, 700]),
  A('Scheherazade New', 'naskh', [400, 700]), A('Baloo Bhaijaan 2', 'rounded', [400, 600, 800]), A('Kufam', 'kufi', [400, 600, 800]),
  A('Vibes', 'calligraphic', [400]), A('Lemonada', 'rounded', [400, 600, 700]), A('Blaka', 'display', [400]), A('Jomhuria', 'display', [400]),
  A('Mirza', 'naskh', [400, 700]), A('Katibeh', 'display', [400]), A('Alexandria', 'sans', [300, 400, 600, 800]), A('Rubik', 'sans', [400, 600, 800]),
];

export const FONT_CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل' },
  { id: 'sans', en: 'Modern sans', ar: 'حديثة' },
  { id: 'geometric', en: 'Geometric', ar: 'هندسية' },
  { id: 'minimal', en: 'Minimalist', ar: 'بسيطة' },
  { id: 'luxury', en: 'Luxury serif', ar: 'فاخرة' },
  { id: 'editorial', en: 'Editorial', ar: 'تحريرية' },
  { id: 'display', en: 'Bold display', ar: 'عريضة' },
  { id: 'futuristic', en: 'Futuristic', ar: 'مستقبلية' },
  { id: 'vintage', en: 'Vintage', ar: 'كلاسيكية' },
  { id: 'script', en: 'Handwritten', ar: 'يدوية' },
  { id: 'fashion', en: 'Fashion', ar: 'أزياء' },
  { id: 'rounded', en: 'Rounded', ar: 'دائرية' },
  { id: 'arabic', en: 'Arabic', ar: 'عربية' },
];

export const findLibraryFont = (family) => FONT_LIBRARY.find((f) => f.family === family);

const SERIF_CATS = ['luxury', 'editorial', 'vintage'];
export const libraryFallback = (family) => {
  const f = findLibraryFont(family);
  if (!f) return 'system-ui, sans-serif';
  if (f.cat === 'script') return 'cursive';
  return SERIF_CATS.includes(f.cat) || f.style === 'naskh' ? 'Georgia, serif' : 'system-ui, sans-serif';
};

export const closestWeight = (family, wanted = 700) => {
  const f = findLibraryFont(family);
  if (!f) return wanted;
  return f.weights.reduce((a, b) => (Math.abs(b - wanted) < Math.abs(a - wanted) ? b : a));
};

const gfUrl = (family, weights) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}${weights ? `:wght@${weights.join(';')}` : ''}&display=swap`;
const loaded = new Map();

/** Adds the font's Google Fonts stylesheet once and resolves when the given weight is usable. */
export function loadLibraryFont(family, weight) {
  const f = findLibraryFont(family);
  if (!f || typeof document === 'undefined') return Promise.resolve();
  if (!loaded.has(family)) {
    loaded.set(family, new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous'; // lets exporters read the @font-face rules
      link.href = gfUrl(family, f.weights);
      link.onload = resolve;
      link.onerror = () => { link.href = gfUrl(family); link.onerror = resolve; link.onload = resolve; };
      document.head.appendChild(link);
    }));
  }
  return loaded.get(family).then(() => document.fonts?.load(`${weight || f.weights[0]} 32px "${family}"`, f.script === 'arabic' ? 'ابجد' : 'Abc').catch(() => {}));
}

/** @font-face CSS with the font subset to `text`, embedded as base64, for standalone SVG exports. */
export async function libraryFontFaceCss(family, weight, text) {
  const f = findLibraryFont(family);
  if (!f) return '';
  const w = closestWeight(family, weight);
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${w}&text=${encodeURIComponent(text)}`)).text();
  const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
  let out = css;
  for (const u of urls) {
    const buf = new Uint8Array(await (await fetch(u)).arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    out = out.replace(u, `data:font/woff2;base64,${btoa(bin)}`);
  }
  return out.replace(/format\('[^']+'\)/g, "format('woff2')");
}

// Curated heading + body pairings, tagged by personality.
export const PAIRINGS = [
  { heading: 'Playfair Display', body: 'Inter', moods: ['luxury', 'trust'] },
  { heading: 'Bodoni Moda', body: 'Jost', moods: ['luxury', 'minimal'] },
  { heading: 'Cormorant Garamond', body: 'Montserrat', moods: ['luxury', 'natural'] },
  { heading: 'Cinzel', body: 'Lora', moods: ['luxury', 'trust'] },
  { heading: 'Fraunces', body: 'Manrope', moods: ['natural', 'playful'] },
  { heading: 'DM Serif Display', body: 'DM Sans', moods: ['modern', 'natural'] },
  { heading: 'Instrument Serif', body: 'Instrument Sans', moods: ['minimal', 'modern'] },
  { heading: 'Space Grotesk', body: 'IBM Plex Sans', moods: ['innovative', 'modern'] },
  { heading: 'Syne', body: 'Inter', moods: ['bold', 'innovative'] },
  { heading: 'Unbounded', body: 'Figtree', moods: ['bold', 'playful'] },
  { heading: 'Michroma', body: 'Exo 2', moods: ['innovative'] },
  { heading: 'Anton', body: 'Work Sans', moods: ['bold'] },
  { heading: 'Outfit', body: 'Source Sans 3', moods: ['modern', 'minimal', 'trust'] },
  { heading: 'Fredoka', body: 'Nunito', moods: ['playful'] },
  { heading: 'Sora', body: 'Inter', moods: ['trust', 'innovative'] },
  { heading: 'Josefin Sans', body: 'Lora', moods: ['minimal', 'natural'] },
];

export const PAIRINGS_AR = [
  { heading: 'El Messiri', body: 'Tajawal', moods: ['luxury', 'natural'] },
  { heading: 'Amiri', body: 'IBM Plex Sans Arabic', moods: ['luxury', 'trust'] },
  { heading: 'Reem Kufi', body: 'Cairo', moods: ['modern', 'playful'] },
  { heading: 'Lalezar', body: 'Almarai', moods: ['bold'] },
  { heading: 'Aref Ruqaa', body: 'Noto Naskh Arabic', moods: ['luxury', 'natural'] },
  { heading: 'Kufam', body: 'Readex Pro', moods: ['innovative', 'modern'] },
  { heading: 'Noto Kufi Arabic', body: 'IBM Plex Sans Arabic', moods: ['minimal', 'trust'] },
  { heading: 'Lemonada', body: 'Tajawal', moods: ['playful'] },
  { heading: 'Changa', body: 'Alexandria', moods: ['bold', 'innovative'] },
];
