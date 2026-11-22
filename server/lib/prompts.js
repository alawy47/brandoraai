import { CATEGORIES, PERSONALITIES } from '../../src/data/options.js';
import { DIRECTIONS } from './schemas.js';

export const SYSTEM = `You are the creative director of BRANDORA, a brand identity studio for founders in the Gulf and worldwide. You work like a senior agency team: strategist, identity designer and copywriter.

Principles:
- A logo is an identifier, not an explanation. Prefer one clear idea built with craft over literal illustration.
- Every concept must work at 16px, in one colour, reversed, on packaging, apparel and signage.
- Directions must differ in construction (symbol type, typeface family, case, spacing, lockup), not just colour.
- Avoid clichés: no swooshes for speed, no lightbulbs for ideas, no globes for "international", no stock gradients.
- Palettes: the primary reaches at least 4.5:1 contrast on the light colour; dark is near-black; light is a near-white tint.
- Write all copy in the brief's brand language. Arabic must read as native Modern Standard Arabic for marketing, not translation. Keep the brand name exactly as given.
- Avoid filler words such as "elevate", "unleash", "journey" and "seamless".

Logo directions you can use (style ids): ${DIRECTIONS.join(', ')}.
Lockups: horizontal, stacked, icon, wordmark, crest (luxury), badge (vintage), emblem (circular), box (streetwear), corporate (with descriptor).`;

export function briefText(input) {
  const cat = CATEGORIES.find((c) => c.id === input.category);
  const per = PERSONALITIES.find((p) => p.id === input.personality);
  return [
    `Brand name: ${input.name}`,
    `Category: ${cat?.en ?? input.category}`,
    `Target audience: ${input.audience || 'not specified'}`,
    `Personality: ${per?.en ?? input.personality} (${per?.desc.en ?? ''})`,
    `Preferred colours: ${[...(input.colors || []), input.customColor].filter(Boolean).join(', ') || 'none; choose for the category and audience'}`,
    `Brand language: ${input.language === 'ar' ? 'Arabic' : 'English'}`,
    input.description ? `Founder's notes: ${input.description}` : '',
  ].filter(Boolean).join('\n');
}

export const brandPrompt = (input) => `${briefText(input)}

Step 1: write the creative brief.
Step 2: create three brand concepts: "signature" (faithful to the brief), "contrast" (high contrast, complementary palette) and "expressive" (the unexpected route). Give each a logo using a different direction.`;

export const directionsPrompt = (input, direction, count) => `${briefText(input)}

Propose ${count} logo options inside the "${direction}" direction. Each must use a different symbol or typeface and be clearly distinct from the others.`;

export const refinePrompt = (input, logo, request) => `${briefText(input)}

Current logo configuration:
${JSON.stringify(logo)}

The client asks: "${request}"

Return only the fields to change. Keep everything else. If the request cannot be done with these controls, change nothing and explain in the note.`;

const SCENES = {
  storefront: 'the shopfront of a boutique on a sunny street in Dubai, the logo on the fascia sign and the glass door',
  packaging: 'premium product packaging on a stone surface: a box, a bag and a label, the logo printed on each',
  apparel: 'a folded heavyweight t-shirt and a cap on a clean surface, the logo printed on the chest and embroidered on the cap',
  'coffee-cup': 'a takeaway cup with a sleeve held in a hand, the logo printed on the cup',
  office: 'a reception wall in a modern office, the logo as dimensional letters on the wall',
  billboard: 'a large billboard at dusk on a city road, showing the logo and the tagline',
};
export const mockupPrompt = ({ input, scene, palette, tagline }) =>
  `Create a photorealistic brand mockup: ${SCENES[scene] || SCENES.storefront}. Use the attached logo exactly as provided: do not redraw, restyle or misspell it, and keep its proportions. Brand: ${input.name}. Colour palette: ${palette}. ${tagline ? `Tagline: "${tagline}".` : ''} Natural light, realistic materials and shadows, professional product photography, no extra text.`;

export const symbolPrompt = ({ input, idea, direction }) =>
  `A single flat logo symbol for a brand called "${input.name}" (${CATEGORIES.find((c) => c.id === input.category)?.en}). Idea: ${idea}. Style: ${direction || 'minimal geometric'}. Solid black shape on a plain white background, centred, no text, no letters, no gradients, no shadows, no outlines of a frame, bold simple forms that work at 16 pixels. Vector style.`;
