// Cloudflare Workers AI: free daily allowance. Draws images with FLUX (symbol explorations).
// It cannot edit a reference image, so photo mockups from the real logo still need Gemini or OpenAI.
import { fetchJson } from '../core/http.js';

export function cloudflareProvider(env = process.env) {
  const account = env.CLOUDFLARE_ACCOUNT_ID, token = env.CLOUDFLARE_API_TOKEN;
  const model = env.CLOUDFLARE_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell';
  const base = env.CLOUDFLARE_BASE_URL || 'https://api.cloudflare.com/client/v4';
  return {
    id: 'cloudflare', label: 'Cloudflare Workers AI (free tier)', configured: Boolean(account && token), models: { image: model },
    tasks: {
      async image({ prompt }) {
        const body = await fetchJson(`${base}/accounts/${account}/ai/run/${model}`, {
          provider: 'cloudflare', method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: String(prompt).slice(0, 2000), steps: 6 }),
        });
        const b64 = body?.result?.image;
        if (!b64) throw new Error(`cloudflare: no image in the response${body?.errors?.[0]?.message ? ` (${body.errors[0].message})` : ''}`);
        return { image: { b64, mime: 'image/jpeg' }, model, usage: { images: 1 } };
      },
    },
  };
}
