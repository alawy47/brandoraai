// Claude: brand strategy, creative direction, copy and design reasoning (structured output).
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { ProviderError } from '../core/http.js';
import { schemaInstruction, parseJson } from './json.js';

const looseSchemas = new WeakSet();

export function anthropicProvider(env = process.env) {
  const model = env.CLAUDE_MODEL || 'claude-opus-5-5';
  const configured = Boolean(env.ANTHROPIC_API_KEY);
  const client = configured ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 0 }) : null; // the registry owns retries

  const mapError = (e) => {
    if (e instanceof ProviderError) return e;
    const status = e.status;
    const retryable = e instanceof Anthropic.RateLimitError || e instanceof Anthropic.APIConnectionError || e instanceof Anthropic.InternalServerError || status === 529;
    const retryAfter = Number(e.headers?.get?.('retry-after'));
    return new ProviderError(`anthropic: ${e.message}`, { status, retryable, retryAfterMs: retryAfter > 0 ? retryAfter * 1000 : undefined, provider: 'anthropic' });
  };

  return {
    id: 'anthropic', label: 'Anthropic Claude', configured, models: { text: model },
    tasks: {
      async text({ system, prompt, schema, maxTokens = 16000, effort = 'medium' }) {
        const base = {
          model, max_tokens: maxTokens, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
          system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        };
        const done = (res, data) => ({ data, model: res.model, usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } });
        const check = (res) => {
          if (res.stop_reason === 'refusal') throw new ProviderError('anthropic: the request was declined', { status: 422, provider: 'anthropic' });
          if (res.stop_reason === 'max_tokens') throw new ProviderError('anthropic: incomplete response', { status: 502, retryable: true, provider: 'anthropic' });
        };
        try {
          if (!looseSchemas.has(schema)) {
            try {
              const res = await client.beta.messages.parse({ ...base, output_config: { effort, format: betaZodOutputFormat(schema) }, messages: [{ role: 'user', content: prompt }] });
              check(res);
              if (!res.parsed_output) throw new ProviderError('anthropic: incomplete response', { status: 502, retryable: true, provider: 'anthropic' });
              return done(res, res.parsed_output);
            } catch (e) {
              // Large nested schemas can exceed the structured-output grammar limit. Fall back to JSON
              // described in the prompt and validated here, and remember the schema so later calls skip the attempt.
              if (!(e.status === 400 && /grammar is too large/i.test(e.message))) throw e;
              looseSchemas.add(schema);
            }
          }
          const res = await client.beta.messages.create({ ...base, output_config: { effort }, messages: [{ role: 'user', content: `${prompt}\n\n${schemaInstruction(schema)}` }] });
          check(res);
          const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
          const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
          return done(res, parseJson(json, schema, 'anthropic'));
        } catch (e) { throw mapError(e); }
      },
    },
  };
}
