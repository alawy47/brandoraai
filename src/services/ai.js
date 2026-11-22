// The single place the UI asks for AI output. Without VITE_API_URL it uses the
// built-in sample engine; with it, it calls your backend (see README: "Connect AI").
import { generateConcepts, generateLogoVariants } from '../lib/generator';
import { interpretLogoRequest } from '../lib/logoEdits';
import { generateCreativeBrief } from '../lib/brief';
import { accessToken } from './cloud';
import { generateDirectionVariations } from '../lib/logoDirections';

const API = import.meta.env.VITE_API_URL;
/** True when a backend with AI providers is configured. The UI labels sample output when false. */
export const isLive = Boolean(API);
export const apiUrl = API;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body, token = accessToken()) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Generation failed (${res.status}). Try again.`);
  }
  return res.json();
}

async function pollJob(id, onStep, token = accessToken()) {
  for (;;) {
    await wait(1200);
    const res = await fetch(`${API}/api/jobs/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const job = await res.json();
    if (job.progress != null) onStep?.(Math.min(6, Math.floor(job.progress * 7)));
    if (job.status === 'done') return job.result;
    if (job.status === 'failed') throw new Error(job.error || 'Generation failed. Try again.');
  }
}

/** Returns { seed, brief, concepts: Concept[3] }. Live generations run as background jobs on the server. */
export async function generateBrand(input, { onStep, token } = {}) {
  const seed = Date.now();
  if (API) {
    onStep?.(0);
    const { jobId } = await post('/api/jobs', { type: 'brand', input }, token);
    const data = await pollJob(jobId, onStep, token);
    return { seed: data.seed ?? seed, concepts: data.concepts, brief: { ...data.brief, source: 'ai' } };
  }
  // Sample mode: walk through the steps so the experience matches a real run.
  for (let i = 0; i < 7; i++) {
    onStep?.(i);
    await wait(420 + Math.random() * 260);
  }
  return { seed, concepts: generateConcepts(input, seed), brief: generateCreativeBrief(input) };
}

/** Returns logo explorations for one concept: [{ mark, layout, colorway, rationale }] */
export async function generateLogos(concept, input, { token } = {}) {
  if (API) return (await post('/api/logos/generate', { concept, input }, token)).logos;
  await wait(700);
  return generateLogoVariants(concept, Date.now());
}

/**
 * Refine one logo from a plain-language request.
 * Live: the backend's language model returns a validated config patch.
 * Offline: a keyword interpreter does the same for common requests (the UI says so).
 * @returns {{ patch: object, applied: string[], source: 'ai' | 'offline', note?: string }}
 */
export async function refineLogo({ project, logo, request, lang, token }) {
  if (API) {
    const data = await post('/api/logos/refine', { input: project.input, logo, request }, token);
    return { patch: data.patch, applied: data.applied || [], note: data.note, source: 'ai' };
  }
  return { ...interpretLogoRequest(request, logo, lang), source: 'offline' };
}

/** More logos inside one creative direction. */
export async function generateDirectionLogos({ project, direction, start, token }) {
  if (API) return (await post('/api/logos/directions', { input: project.input, direction, count: 6 }, token)).logos;
  await wait(450);
  return generateDirectionVariations(direction, project, start, 6);
}

/** Server status for the providers page. */
export async function providerStatus() {
  if (!API) return null;
  const res = await fetch(`${API}/api/providers/status`);
  if (!res.ok) throw new Error(`Status request failed (${res.status}).`);
  return res.json();
}

/** A photographic mockup from the image provider. Only available with a live backend. */
export async function generateMockupPhoto({ project, concept, scene, token }) {
  if (!API) throw new Error('Connect an image provider to generate photo mockups.');
  const palette = concept.palette.map((c) => `${c.role} ${c.hex}`).join(', ');
  // The real vector logo is rendered and sent as the reference, so the model places it rather than redrawing it.
  const { standaloneLogoSvg, svgToPngDataUrl } = await import('../lib/download');
  const logoPng = await svgToPngDataUrl(await standaloneLogoSvg({ name: project.input.name, concept }), 1024);
  const data = await post('/api/images/mockup', { input: project.input, scene, palette, tagline: concept.tagline, logoPng }, token);
  return { image: data.image, provider: data.provider };
}

/** AI symbol: the image model draws a flat mark, the server vectorises it into one SVG path. */
export async function generateCustomSymbol({ project, idea, direction, token }) {
  if (!API) throw new Error('Connect an image provider to draw custom symbols.');
  return post('/api/images/symbol', { input: project.input, idea, direction }, token);
}
