// Integration harness: runs the real API with OpenAI's HTTP calls stubbed in this process only,
// so the frontend's live path (jobs, brief, refine, symbol + vectorise, status) can be exercised without keys.
import { readFileSync } from 'node:fs';
process.env.OPENAI_API_KEY = 'test-key';
process.env.TEXT_PROVIDERS = 'openai'; process.env.IMAGE_PROVIDERS = 'openai'; process.env.EDIT_PROVIDERS = 'openai'; // the harness stubs OpenAI's HTTP only
const png = readFileSync(process.env.TEST_PNG || new URL('./fixtures/logo-icon.png', import.meta.url)).toString('base64');
const realFetch = globalThis.fetch;
const logo = (style, mark, layout) => ({ style, mark, layout, font: 'Cinzel', fontAr: 'Amiri', weight: 600, case: 'upper', tracking: 0.2, colorway: 'primary', rationale: 'A test rationale.' });
const concept = (direction, title, style, mark, layout) => ({
  direction, title, summary: 'Summary.', tagline: 'Crafted slowly.', story: 'Story.', mission: 'Mission.', values: ['Care', 'Craft', 'Origin'],
  voice: { traits: ['Warm', 'Clear', 'Calm'], sample: 'Hello.' }, match: 94,
  palette: [['primary', '#5B3A29'], ['secondary', '#C9B79C'], ['accent', '#D9A441'], ['dark', '#1C1410'], ['light', '#F7F2EA']].map(([role, hex]) => ({ role, hex, name: { en: role, ar: role } })),
  fonts: { heading: 'Fraunces', body: 'Manrope', headingAr: 'El Messiri', bodyAr: 'Tajawal' }, logo: logo(style, mark, layout),
  social: { posts: ['launch', 'product', 'quote'].map((type) => ({ type, kicker: 'K', headline: 'Headline', sub: 'Sub', cta: 'Shop', caption: 'Caption.' })),
    stories: { arrival: { kicker: 'New', headline: 'Here', cta: 'Swipe' }, poll: { kicker: 'Tell us', headline: 'Next?', a: 'A', b: 'B' } }, hashtags: ['#a', '#b'] },
});
globalThis.fetch = async (url, init) => {
  const u = String(url);
  if (!u.startsWith('https://api.openai.com')) return realFetch(url, init);
  await new Promise((r) => setTimeout(r, 300));
  if (u.endsWith('/chat/completions')) {
    const sys = JSON.parse(init.body).messages[0].content;
    let content;
    if (sys.includes('"brief"')) content = { brief: { objective: 'AI objective for the test.', insight: 'AI insight.', positioning: 'AI positioning.', personality: ['Warm', 'Crafted', 'Calm'], cues: ['c1', 'c2'], avoid: ['a1'], deliverables: ['d1'] }, concepts: [concept('signature', 'AI Signature', 'vintage', 'cup', 'badge'), concept('contrast', 'AI Contrast', 'luxury', 'crown', 'crest'), concept('expressive', 'AI Expressive', 'geometric', 'mosaic', 'horizontal')] };
    else if (sys.includes('"applied"')) content = { logo: { style: 'minimal', mark: 'arch', layout: 'stacked', font: 'Fraunces', fontAr: 'Amiri', weight: 800, case: 'asis', tracking: 0, colorway: 'primary', rationale: 'r' }, applied: ['Heavier (AI)', 'Vertical (AI)'], note: 'Stacking suits the narrow sign.' };
    else content = { logos: [logo('minimal', 'leaf', 'horizontal'), logo('minimal', 'drop', 'stacked')] };
    return new Response(JSON.stringify({ model: 'stub', choices: [{ message: { content: JSON.stringify(content) } }], usage: { prompt_tokens: 1000, completion_tokens: 500 } }));
  }
  return new Response(JSON.stringify({ data: [{ b64_json: png }] }));
};
const { app } = await import('../index.js');
app.listen(8790, () => console.log('harness on 8790'));
