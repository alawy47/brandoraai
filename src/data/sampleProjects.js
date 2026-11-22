import { generateConcepts } from '../lib/generator';
import { generateCreativeBrief } from '../lib/brief';

const DAY = 86400000;
const SAMPLES = [
  { seed: 11, status: 'completed', favorite: true, age: 0.08, selected: 0, input: { name: 'Noor Coffee', category: 'coffee', audience: 'Young professionals in Riyadh and Dubai', personality: 'natural', colors: ['brown', 'gold'], language: 'en' } },
  { seed: 7, status: 'progress', favorite: true, age: 0.6, selected: 0, input: { name: 'قمر', category: 'perfume', audience: 'نساء يبحثن عن عطور فاخرة', personality: 'luxury', colors: ['purple', 'gold'], language: 'ar' } },
  { seed: 3, status: 'completed', favorite: false, age: 2.3, selected: 1, input: { name: 'Vertex Labs', category: 'tech', audience: 'Startup founders and product teams', personality: 'innovative', colors: ['blue', 'teal'], language: 'en' } },
  { seed: 21, status: 'progress', favorite: false, age: 4.1, selected: 0, input: { name: 'Lumière', category: 'beauty', audience: 'Women 25–40 who choose clean skincare', personality: 'minimal', colors: ['pink'], language: 'en' } },
  { seed: 5, status: 'completed', favorite: false, age: 7.5, selected: 2, input: { name: 'Atlas Fit', category: 'fitness', audience: 'Gen Z athletes and weekend runners', personality: 'bold', colors: ['red', 'mono'], language: 'en' } },
  { seed: 9, status: 'progress', favorite: false, age: 12, selected: 0, input: { name: 'بيت الياسمين', category: 'restaurant', audience: 'العائلات في الخليج', personality: 'playful', colors: ['orange', 'green'], language: 'ar' } },
];

export function buildSampleProjects(now = Date.now()) {
  return SAMPLES.map((s, i) => {
    const t = now - s.age * DAY;
    return {
      id: `sample-${i + 1}`,
      sample: true,
      input: s.input,
      seed: s.seed,
      concepts: generateConcepts(s.input, s.seed),
      brief: generateCreativeBrief(s.input),
      selected: s.selected,
      status: s.status,
      favorite: s.favorite,
      createdAt: t - 2 * DAY,
      updatedAt: t,
    };
  });
}
