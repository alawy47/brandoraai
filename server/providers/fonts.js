// Typography: Google Fonts Developer API for discovery when a key exists; otherwise the
// curated, validated library that ships with the app.
import { fetchJson } from '../core/http.js';
import { FONT_LIBRARY } from '../../src/data/fontLibrary.js';

export function googleFontsProvider(env = process.env) {
  const key = env.GOOGLE_FONTS_API_KEY;
  return {
    id: 'googlefonts', label: 'Google Fonts', configured: true, models: { fonts: key ? 'webfonts api' : 'curated library' },
    tasks: {
      async fonts({ category, script } = {}) {
        if (!key) {
          const list = FONT_LIBRARY.filter((f) => (!category || f.cat === category) && (!script || f.script === script));
          return { fonts: list.map((f) => ({ family: f.family, category: f.cat, weights: f.weights, script: f.script })), model: 'curated library', usage: {} };
        }
        const body = await fetchJson(`https://www.googleapis.com/webfonts/v1/webfonts?key=${key}&sort=popularity`, { provider: 'googlefonts' });
        const items = body.items.filter((f) => (!category || f.category === category) && (!script || (script === 'arabic' ? f.subsets.includes('arabic') : true)));
        return { fonts: items.slice(0, 300).map((f) => ({ family: f.family, category: f.category, weights: f.variants.filter((v) => /^\d+$|^regular$/.test(v)).map((v) => (v === 'regular' ? 400 : Number(v))), script: f.subsets.includes('arabic') ? 'arabic' : 'latin' })), model: 'webfonts api', usage: {} };
      },
    },
  };
}
