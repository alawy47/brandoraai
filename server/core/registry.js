// Provider registry: picks providers per task, retries transient failures with backoff,
// falls back to the next provider, caches results and records usage for every attempt.
import { ProviderError } from './http.js';
import { ResultCache } from './cache.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class ProviderRegistry {
  /**
   * @param {object} o
   * @param {Record<string, object>} o.providers  id -> provider ({ id, configured, tasks: { text?, image?, edit?, vector?, fonts? } })
   * @param {Record<string, string[]>} o.order    task -> provider ids in preference order
   * @param {import('./usage.js').UsageTracker} o.usage
   */
  constructor({ providers, order, usage, retries = 2, baseDelayMs = 800, cache = new ResultCache() }) {
    this.providers = providers; this.order = order; this.usage = usage;
    this.retries = retries; this.baseDelayMs = baseDelayMs; this.cache = cache;
    this.cooldownUntil = {};
  }

  available(task) {
    return (this.order[task] || []).filter((id) => {
      const p = this.providers[id];
      return p && p.configured && typeof p.tasks[task] === 'function';
    });
  }

  /** Runs `task` with the first provider that succeeds. `cacheable` results are reused for identical input. */
  async run(task, input, { cacheable = false, prefer } = {}) {
    const chain = this.available(task);
    if (prefer && chain.includes(prefer)) chain.sort((a, b) => (a === prefer ? -1 : b === prefer ? 1 : 0));
    if (!chain.length) throw new ProviderError(`No provider is configured for "${task}". Add an API key (see README: Connect AI).`, { status: 503 });
    const exec = () => this.#runChain(task, input, chain);
    if (!cacheable) return exec();
    const { value, cached } = await this.cache.wrap(ResultCacheKey(task, input), exec);
    return { ...value, cached };
  }

  async #runChain(task, input, chain) {
    const errors = [];
    for (const id of chain) {
      if ((this.cooldownUntil[id] || 0) > Date.now()) { errors.push(`${id}: cooling down after rate limit`); continue; }
      const provider = this.providers[id];
      for (let attempt = 0; attempt <= this.retries; attempt++) {
        const t0 = Date.now();
        try {
          const out = await provider.tasks[task](input);
          this.usage.record({ task, provider: id, model: out.model, ok: true, ms: Date.now() - t0, usage: out.usage, attempt });
          return { ...out, provider: id };
        } catch (e) {
          this.usage.record({ task, provider: id, ok: false, ms: Date.now() - t0, error: e.message, status: e.status, attempt });
          errors.push(e.message);
          if (e.status === 429 && e.retryAfterMs > 5000) { this.cooldownUntil[id] = Date.now() + e.retryAfterMs; break; }
          if (!e.retryable || attempt === this.retries) break; // non-retryable: go to the next provider
          await sleep(e.retryAfterMs ?? this.baseDelayMs * 2 ** attempt + Math.random() * 250);
        }
      }
    }
    const err = new ProviderError(`All providers failed for "${task}": ${errors.join(' | ')}`, { status: 502 });
    err.details = errors;
    throw err;
  }

  status() {
    return Object.values(this.providers).map((p) => ({
      id: p.id, label: p.label, configured: p.configured, tasks: Object.keys(p.tasks),
      models: p.models || {}, coolingDown: (this.cooldownUntil[p.id] || 0) > Date.now(),
    }));
  }
}

function ResultCacheKey(task, input) {
  // Large binary inputs (images) are summarised by length + head so keys stay small but specific.
  const slim = JSON.stringify(input, (k, v) => (typeof v === 'string' && v.length > 2000 ? `${v.length}:${v.slice(0, 200)}${v.slice(-200)}` : v));
  return ResultCache.key(task, slim);
}
