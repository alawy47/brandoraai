// The single place the UI asks for AI output. Without VITE_API_URL it uses the
// built-in sample engine; with it, it calls your backend (see README: "Connect AI").
import { generateConcepts, generateLogoVariants } from '../lib/generator';

const API = import.meta.env.VITE_API_URL;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, body, token) {
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

/** Returns { seed, concepts: Concept[3] } */
export async function generateBrand(input, { onStep, token } = {}) {
  const seed = Date.now();
  if (API) {
    onStep?.(0);
    const data = await post('/api/brands/generate', input, token);
    return { seed: data.seed ?? seed, concepts: data.concepts };
  }
  // Sample mode: walk through the steps so the experience matches a real run.
  for (let i = 0; i < 7; i++) {
    onStep?.(i);
    await wait(420 + Math.random() * 260);
  }
  return { seed, concepts: generateConcepts(input, seed) };
}

/** Returns logo explorations for one concept: [{ mark, layout, colorway, rationale }] */
export async function generateLogos(concept, input, { token } = {}) {
  if (API) return (await post('/api/logos/generate', { concept, input }, token)).logos;
  await wait(700);
  return generateLogoVariants(concept, Date.now());
}
