// Vectorisation: Vectorizer.AI (hosted, highest quality) when credentials exist, and Potrace
// (local, free, single colour) which always works. Both return clean SVG path data.
import potrace from 'potrace';
import { ProviderError } from '../core/http.js';

function pathFromSvg(svg) {
  const w = Number(svg.match(/width="([\d.]+)"/)?.[1]);
  const h = Number(svg.match(/height="([\d.]+)"/)?.[1]);
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1] || `0 0 ${w} ${h}`;
  const d = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]).join(' ');
  if (!d) throw new ProviderError('vectoriser returned no paths', { status: 422 });
  return { d, viewBox: vb, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><path d="${d}" fill="currentColor" fill-rule="evenodd"/></svg>` };
}

export function potraceProvider() {
  return {
    id: 'potrace', label: 'Potrace (local)', configured: true, models: { vector: 'potrace' },
    tasks: {
      vector({ b64, threshold = 140 }) {
        return new Promise((resolve, reject) => {
          potrace.trace(Buffer.from(b64, 'base64'), { threshold, turdSize: 8, optTolerance: 0.3, color: '#000000' }, (err, svg) => {
            if (err) return reject(new ProviderError(`potrace: ${err.message}`, { status: 422 }));
            try { resolve({ ...pathFromSvg(svg), model: 'potrace', usage: { images: 1 } }); } catch (e) { reject(e); }
          });
        });
      },
    },
  };
}

export function vectorizerProvider(env = process.env) {
  const id = env.VECTORIZER_API_ID, secret = env.VECTORIZER_API_SECRET;
  return {
    id: 'vectorizer', label: 'Vectorizer.AI', configured: Boolean(id && secret), models: { vector: env.VECTORIZER_MODE || 'production' },
    tasks: {
      async vector({ b64, mime = 'image/png' }) {
        const form = new FormData();
        form.append('image', new Blob([Buffer.from(b64, 'base64')], { type: mime }), 'logo.png');
        form.append('mode', env.VECTORIZER_MODE || 'production');
        form.append('output.file_format', 'svg');
        const res = await fetch('https://vectorizer.ai/api/v1/vectorize', { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}` }, body: form });
        const text = await res.text();
        if (!res.ok) throw new ProviderError(`vectorizer: ${res.status} ${text.slice(0, 160)}`, { status: res.status, retryable: res.status === 429 || res.status >= 500, provider: 'vectorizer' });
        return { ...pathFromSvg(text), model: 'vectorizer.ai', usage: { images: 1 } };
      },
    },
  };
}
