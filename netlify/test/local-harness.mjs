// Runs the built site and the Netlify function code in one process, the way Netlify serves them:
// /api/* → the API function, which starts the background function; everything else → dist (SPA).
// OpenAI's HTTP is stubbed in this process only, so no key or network is needed.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { handleApi, runJob, memoryStores } from '../lib/api.js';

process.env.OPENAI_API_KEY = 'test-key';
process.env.TEXT_PROVIDERS = 'openai';
process.env.INSTAGRAM_APP_ID = 'APP'; process.env.INSTAGRAM_APP_SECRET = 'SECRET';
const png = readFileSync(new URL('../../server/test/fixtures/logo-icon.png', import.meta.url)).toString('base64');
const realFetch = globalThis.fetch;
const logo = (style, mark, layout) => ({ style, mark, layout, font: 'Cinzel', fontAr: 'Amiri', weight: 600, case: 'upper', tracking: 0.2, colorway: 'primary', rationale: 'A test rationale.' });
const concept = (d, title, st, mk, ly) => ({ direction: d, title, summary: 'S.', tagline: 'Crafted slowly.', story: 'Story.', mission: 'Mission.', values: ['Care', 'Craft', 'Origin'], voice: { traits: ['Warm', 'Clear', 'Calm'], sample: 'Hello.' }, match: 94,
  palette: [['primary', '#5B3A29'], ['secondary', '#C9B79C'], ['accent', '#D9A441'], ['dark', '#1C1410'], ['light', '#F7F2EA']].map(([role, hex]) => ({ role, hex, name: { en: role, ar: role } })),
  fonts: { heading: 'Fraunces', body: 'Manrope', headingAr: 'El Messiri', bodyAr: 'Tajawal' }, logo: logo(st, mk, ly),
  social: { posts: ['launch', 'product', 'quote'].map((type) => ({ type, kicker: 'K', headline: 'H', sub: 'S', cta: 'Shop', caption: 'C.' })), stories: { arrival: { kicker: 'N', headline: 'H', cta: 'S' }, poll: { kicker: 'T', headline: 'N?', a: 'A', b: 'B' } }, hashtags: ['#a'] } });
globalThis.fetch = async (url, init) => {
  const u = String(url);
  // Stand-in for Instagram's token and graph endpoints
  if (/^https:\/\/(api|graph)\.instagram\.com/.test(u)) {
    const R = (b) => new Response(JSON.stringify(b));
    if (u.includes('api.instagram.com')) return R({ access_token: 'SHORT', user_id: 111 });
    if (u.includes('/access_token')) return R({ access_token: 'LONG', expires_in: 5184000 });
    if (u.includes('/me/media')) return R({ data: [['Fresh beans just landed', 128], ['Brew guide: V60 in 4 steps', 96], ['Friday playlist and a flat white', 64]].map(([caption, like_count], i) => ({ id: 'm' + i, caption, like_count, comments_count: 5, media_type: 'IMAGE', media_url: 'data:image/png;base64,' + png, permalink: 'https://instagram.com/p/' + i, timestamp: '2026-11-01T10:00:00+0000' })) });
    if (u.includes('/me')) return R({ user_id: '111', username: 'noorcoffee', name: 'Noor Coffee', account_type: 'BUSINESS', followers_count: 1200, media_count: 80, biography: 'Specialty coffee, Dubai' });
  }
  if (!u.startsWith('https://api.openai.com')) return realFetch(url, init);
  await new Promise((r) => setTimeout(r, 600));
  if (u.endsWith('/chat/completions')) {
    const sys = JSON.parse(init.body).messages[0].content;
    const visual = (template, headline) => ({ template, kicker: 'Brew tip', headline, sub: 'Small habits, better coffee.', cta: 'Visit us', big: template === 'sale' ? '20%' : '', items: template === 'tips' ? ['Grind fresh', 'Weigh the water', 'Rinse the filter'] : [], author: template === 'testimonial' ? 'Reem, Dubai' : '' });
    const content = sys.includes('"ideas"') ? { analysis: { niche: 'Specialty coffee', tone: 'Warm and practical', audience: 'Dubai coffee lovers', themes: ['Beans', 'Brew guides', 'Playlists'], opportunity: 'No customer stories yet.' }, ideas: [['Three habits for better coffee', 'tips'], ['Customer review of the week', 'testimonial'], ['A line worth sipping slowly', 'quote']].map(([title, tpl]) => ({ title, why: 'Your brew guide post got the most comments after beans.', hook: 'h', caption: 'Better coffee starts small.', hashtags: ['#specialtycoffee', '#dubaicoffee', '#v60', '#brewguide', '#coffeelovers'], visual: visual(tpl, title) })) }
      : sys.includes('"brief"')
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
