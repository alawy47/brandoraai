// Runs the built site and the Netlify function code in one process, the way Netlify serves them:
// /api/* → the API function, which starts the background function; everything else → dist (SPA).
// OpenAI's HTTP is stubbed in this process only, so no key or network is needed.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { handleApi, runJob, memoryStores } from '../lib/api.js';

process.env.OPENAI_API_KEY = 'test-key';
process.env.TEXT_PROVIDERS = 'openai';
const png = readFileSync(new URL('../../server/test/fixtures/logo-icon.png', import.meta.url)).toString('base64');
const realFetch = globalThis.fetch;
const logo = (style, mark, layout) => ({ style, mark, layout, font: 'Cinzel', fontAr: 'Amiri', weight: 600, case: 'upper', tracking: 0.2, colorway: 'primary', rationale: 'A test rationale.' });
const concept = (d, title, st, mk, ly) => ({ direction: d, title, summary: 'S.', tagline: 'Crafted slowly.', story: 'Story.', mission: 'Mission.', values: ['Care', 'Craft', 'Origin'], voice: { traits: ['Warm', 'Clear', 'Calm'], sample: 'Hello.' }, match: 94,
  palette: [['primary', '#5B3A29'], ['secondary', '#C9B79C'], ['accent', '#D9A441'], ['dark', '#1C1410'], ['light', '#F7F2EA']].map(([role, hex]) => ({ role, hex, name: { en: role, ar: role } })),
  fonts: { heading: 'Fraunces', body: 'Manrope', headingAr: 'El Messiri', bodyAr: 'Tajawal' }, logo: logo(st, mk, ly),
  social: { posts: ['launch', 'product', 'quote'].map((type) => ({ type, kicker: 'K', headline: 'H', sub: 'S', cta: 'Shop', caption: 'C.' })), stories: { arrival: { kicker: 'N', headline: 'H', cta: 'S' }, poll: { kicker: 'T', headline: 'N?', a: 'A', b: 'B' } }, hashtags: ['#a'] } });
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (!u.startsWith('https://api.openai.com')) return realFetch(url, init);
  await new Promise((r) => setTimeout(r, 600));
  if (u.endsWith('/chat/completions')) {
    const sys = JSON.parse(init.body).messages[0].content;
    const content = sys.includes('"brief"')
      ? { brief: { objective: 'AI objective for the test.', insight: 'i', positioning: 'p', personality: ['a', 'b', 'c'], cues: ['c1'], avoid: ['a1'], deliverables: ['d1'] }, concepts: [concept('signature', 'AI Signature', 'vintage', 'cup', 'badge'), concept('contrast', 'AI Contrast', 'luxury', 'crown', 'crest'), concept('expressive', 'AI Expressive', 'geometric', 'mosaic', 'horizontal')] }
      : sys.includes('"patch"') ? { patch: { weight: 800, layout: 'stacked' }, applied: ['Heavier (AI)', 'Vertical (AI)'], note: 'Stacking suits the narrow sign.' }
      : { logos: [logo('minimal', 'leaf', 'horizontal'), logo('minimal', 'drop', 'stacked')] };
    return new Response(JSON.stringify({ model: 'stub', choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 1000, completion_tokens: 500 } }));
  }
  return new Response(JSON.stringify({ data: [{ b64_json: png }] }));
};

const stores = memoryStores();
const DIST = new URL('../../dist/', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const origin = 'http://localhost:8791';

http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const out = await handleApi(request, {
      stores,
      trigger: async (jobId, token) => { runJob({ jobId, token }, { stores }).catch((e) => console.error('job crashed', e)); }, // answers 202 at once, like the background function
    });
    res.writeHead(out.status, Object.fromEntries(out.headers)); return res.end(Buffer.from(await out.arrayBuffer()));
  }
  let file = join(DIST, url.pathname);
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
}).listen(8791, () => console.log('netlify-like harness on 8791'));
