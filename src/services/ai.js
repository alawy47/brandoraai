// The single place the UI asks for AI output.
// The app asks the server what it can do (which providers have keys) and uses the AI only for
// those tasks. Everything else falls back to the built-in sample engine, and the UI says so.
//
// VITE_API_URL:  empty  → sample mode only
//                "/"    → the API lives on the same site (Netlify Functions)
//                URL    → a separate API server (see README)
import { generateConcepts } from '../lib/generator';
import { interpretLogoRequest } from '../lib/logoEdits';
import { generateCreativeBrief } from '../lib/brief';
import { accessToken } from './cloud';
import { generateDirectionVariations } from '../lib/logoDirections';

const RAW = (import.meta.env.VITE_API_URL || '').trim();
export const apiConfigured = Boolean(RAW);
const API = RAW === '/' ? '' : RAW.replace(/\/+$/, '');
export const apiUrl = RAW === '/' ? (typeof window !== 'undefined' ? window.location.origin : '/') : RAW;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---- What the server can do ------------------------------------------------------------ */
let caps = { checking: apiConfigured, reachable: false, text: false, image: false, edit: false, status: null, error: '' };
const listeners = new Set();
export const getBackend = () => caps;
export const subscribeBackend = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const setCaps = (c) => { caps = c; listeners.forEach((f) => f()); };

/** Asks the server which providers are configured. Safe to call again (Settings → Refresh). */
export async function probeBackend() {
  if (!apiConfigured) return setCaps({ ...caps, checking: false });
  setCaps({ ...caps, checking: true });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${API}/api/providers/status`, { signal: ctrl.signal });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) throw new Error(res.ok ? 'No API was found at this address.' : `The API answered ${res.status}.`);
    const status = await res.json();
    const r = status.routing || {};
    setCaps({ checking: false, reachable: true, text: !!r.text?.length, image: !!r.image?.length, edit: !!r.edit?.length, status, error: '' });
  } catch (e) {
    setCaps({ checking: false, reachable: false, text: false, image: false, edit: false, status: null, error: e.name === 'AbortError' ? 'The API did not answer in time.' : e.message });
  } finally { clearTimeout(timer); }
}

/* ---- Requests -------------------------------------------------------------------------- */
async function post(path, body, token = accessToken()) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `The request failed (${res.status}). Try again.`);
  }
  return res.json();
}

async function pollJob(id, onStep, token = accessToken()) {
  const started = Date.now();
  for (;;) {
    await wait(1200);
    if (Date.now() - started > 14 * 60 * 1000) throw new Error('The generation took too long. Try again.');
    const res = await fetch(`${API}/api/jobs/${id}`, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Cache-Control': 'no-store' } });
    if (res.status === 404) throw new Error('The generation was lost. Try again.');
    const job = await res.json().catch(() => ({}));
    if (job.progress != null) onStep?.(Math.min(6, Math.floor(job.progress * 7)));
    if (job.status === 'done') return job.result;
    if (job.status === 'failed') throw new Error(job.error || 'The generation failed. Try again.');
  }
}

/** Runs one AI task as a background job and waits for its result. */
async function runTask(type, payload, { onStep, token } = {}) {
  const { jobId } = await post('/api/jobs', { type, ...payload }, token);
  return pollJob(jobId, onStep, token);
}

/** A plain request to the API. Returns { status, data } and does not throw on HTTP errors. */
export async function apiRequest(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${API}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}
export { runTask };

/* ---- Tasks ----------------------------------------------------------------------------- */

/** Returns { seed, brief, concepts: Concept[3] }. */
export async function generateBrand(input, { onStep, token } = {}) {
  const seed = Date.now();
  if (caps.text) {
    onStep?.(0);
    const data = await runTask('brand', { input }, { onStep, token });
    return { seed: data.seed ?? seed, concepts: data.concepts, brief: { ...data.brief, source: 'ai' } };
  }
  // Sample mode: walk through the steps so the experience matches a real run.
  for (let i = 0; i < 7; i++) {
    onStep?.(i);
    await wait(420 + Math.random() * 260);
  }
  return { seed, concepts: generateConcepts(input, seed), brief: generateCreativeBrief(input) };
}

/**
 * Refine one logo from a plain-language request.
 * With a language model: it returns a validated config patch. Without: a keyword interpreter handles common requests.
 * @returns {{ patch: object, applied: string[], source: 'ai' | 'offline', note?: string }}
 */
export async function refineLogo({ project, logo, request, lang, token }) {
  if (caps.text) {
    const data = await runTask('refine', { input: project.input, logo, request }, { token });
    return { patch: data.patch, applied: data.applied || [], note: data.note, source: 'ai' };
  }
  return { ...interpretLogoRequest(request, logo, lang), source: 'offline' };
}

/** More logos inside one creative direction. */
export async function generateDirectionLogos({ project, direction, start, token }) {
  if (caps.text) return (await runTask('directions', { input: project.input, direction, count: 6 }, { token })).logos;
  await wait(450);
  return generateDirectionVariations(direction, project, start, 6);
}

/** A photographic mockup from the image provider. Needs an image-editing provider. */
export async function generateMockupPhoto({ project, concept, scene, token }) {
  if (!caps.edit) throw new Error('Connect an image provider to generate photo mockups.');
  const palette = concept.palette.map((c) => `${c.role} ${c.hex}`).join(', ');
  // The real vector logo is rendered and sent as the reference, so the model places it rather than redrawing it.
  const { standaloneLogoSvg, svgToPngDataUrl } = await import('../lib/download');
  const logoPng = await svgToPngDataUrl(await standaloneLogoSvg({ name: project.input.name, concept }), 1024);
  const data = await runTask('mockup', { input: project.input, scene, palette, tagline: concept.tagline, logoPng }, { token });
  return { image: data.image, provider: data.provider };
}

/** AI symbol: the image model draws a flat mark, the server vectorises it into one SVG path. */
export async function generateCustomSymbol({ project, idea, direction, token }) {
  if (!caps.image) throw new Error('Connect an image provider to draw custom symbols.');
  return runTask('symbol', { input: project.input, idea, direction }, { token });
}
