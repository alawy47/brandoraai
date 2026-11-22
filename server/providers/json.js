// For providers without native schema enforcement: describe the schema in the prompt, then validate.
import { z } from 'zod';
import { ProviderError } from '../core/http.js';

export const schemaInstruction = (schema) =>
  `Reply with one JSON object only, no prose and no code fences. It must validate against this JSON Schema:\n${JSON.stringify(z.toJSONSchema(schema))}`;

export function parseJson(text, schema, provider) {
  const clean = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '');
  let data;
  try { data = JSON.parse(clean); } catch { throw new ProviderError(`${provider}: response was not valid JSON`, { retryable: true, provider }); }
  const r = schema.safeParse(data);
  if (!r.success) throw new ProviderError(`${provider}: response did not match the schema (${r.error.issues[0]?.path.join('.')}: ${r.error.issues[0]?.message})`, { retryable: true, provider });
  return r.data;
}
