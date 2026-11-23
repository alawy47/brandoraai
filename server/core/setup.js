// Default routing: Claude for strategy and copy (Gemini as the fallback), Gemini for images and edits (Cloudflare's free tier draws images when Gemini cannot).
// OpenAI is still supported: add it with TEXT_PROVIDERS / IMAGE_PROVIDERS / EDIT_PROVIDERS.
// Builds the provider registry from environment variables. Shared by the Express server
// and the Netlify functions so both route, retry and fall back the same way.
import { ProviderRegistry } from './registry.js';
import { UsageTracker } from './usage.js';
import { anthropicProvider } from '../providers/anthropic.js';
import { openaiProvider } from '../providers/openai.js';
import { geminiProvider } from '../providers/gemini.js';
import { cloudflareProvider } from '../providers/cloudflare.js';
import { potraceProvider, vectorizerProvider } from '../providers/vector.js';
import { googleFontsProvider } from '../providers/fonts.js';

const list = (v, d) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : d);

export function buildRegistry(env = process.env, { sink, overrides = {} } = {}) {
  const providers = {
    anthropic: anthropicProvider(env), openai: openaiProvider(env), gemini: geminiProvider(env), cloudflare: cloudflareProvider(env),
    vectorizer: vectorizerProvider(env), potrace: potraceProvider(), googlefonts: googleFontsProvider(env), ...overrides,
  };
  const order = {
    text: list(env.TEXT_PROVIDERS, ['anthropic', 'gemini']),
    image: list(env.IMAGE_PROVIDERS, ['gemini', 'cloudflare']),
    edit: list(env.EDIT_PROVIDERS, ['gemini']),
    vector: list(env.VECTOR_PROVIDERS, ['vectorizer', 'potrace']),
    fonts: ['googlefonts'],
  };
  return new ProviderRegistry({ providers, order, usage: new UsageTracker({ sink }), retries: Number(env.PROVIDER_RETRIES ?? 2) });
}
