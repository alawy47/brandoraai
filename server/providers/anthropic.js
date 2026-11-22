// Claude: brand strategy, creative direction, copy and design reasoning (structured output).
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { ProviderError } from '../core/http.js';

export function anthropicProvider(env = process.env) {
  const model = env.CLAUDE_MODEL || 'claude-opus-5-5';
  const configured = Boolean(env.ANTHROPIC_API_KEY);
  const client = configured ? new Anthropic({ maxRetries: 0 }) : null; // the registry owns retries

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
        try {
          const res = await client.beta.messages.parse({
            model,
            max_tokens: maxTokens,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            output_config: { effort, format: betaZodOutputFormat(schema) },
            system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
            messages: [{ role: 'user', content: prompt }],
          });
          if (res.stop_reason === 'refusal') throw new ProviderError('anthropic: the request was declined', { status: 422, provider: 'anthropic' });
          if (res.stop_reason === 'max_tokens' || !res.parsed_output) throw new ProviderError('anthropic: incomplete response', { status: 502, retryable: true, provider: 'anthropic' });
          return { data: res.parsed_output, model: res.model, usage: { inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens } };
        } catch (e) { throw mapError(e); }
      },
    },
  };
}
