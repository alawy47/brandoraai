// Usage and cost tracking. Every provider attempt is recorded; summaries power /api/providers/status.
// Prices: Anthropic from published rates; set the others from your providers' pricing pages.
const num = (v) => (v === undefined || v === '' ? null : Number(v));
export const PRICES = {
  anthropic: { inputPerMTok: num(process.env.PRICE_ANTHROPIC_INPUT_MTOK) ?? 4, outputPerMTok: num(process.env.PRICE_ANTHROPIC_OUTPUT_MTOK) ?? 20 },
  openai: { inputPerMTok: num(process.env.PRICE_OPENAI_INPUT_MTOK), outputPerMTok: num(process.env.PRICE_OPENAI_OUTPUT_MTOK), perImage: num(process.env.PRICE_OPENAI_IMAGE) },
  gemini: { inputPerMTok: num(process.env.PRICE_GEMINI_INPUT_MTOK), outputPerMTok: num(process.env.PRICE_GEMINI_OUTPUT_MTOK), perImage: num(process.env.PRICE_GEMINI_IMAGE) },
  cloudflare: { perImage: 0 },
  vectorizer: { perImage: num(process.env.PRICE_VECTORIZER_IMAGE) },
  potrace: { perImage: 0 },
  googlefonts: { perImage: 0 },
};

export function estimateCost(provider, usage = {}) {
  const p = PRICES[provider] || {};
  let cost = 0, known = true;
  if (usage.inputTokens || usage.outputTokens) {
    if (p.inputPerMTok == null || p.outputPerMTok == null) known = false;
    else cost += ((usage.inputTokens || 0) * p.inputPerMTok + (usage.outputTokens || 0) * p.outputPerMTok) / 1e6;
  }
  if (usage.images) {
    if (p.perImage == null) known = false;
    else cost += usage.images * p.perImage;
  }
  return known ? Number(cost.toFixed(5)) : null;
}

export class UsageTracker {
  constructor({ keep = 2000, sink } = {}) { this.events = []; this.keep = keep; this.sink = sink; }
  record(e) {
    const event = { ts: Date.now(), ...e, costUsd: e.ok ? estimateCost(e.provider, e.usage) : 0 };
    this.events.push(event);
    if (this.events.length > this.keep) this.events.shift();
    this.sink?.(event).catch?.(() => {});
    return event;
  }
  summary() {
    const by = {};
    for (const e of this.events) {
      const s = (by[e.provider] ||= { calls: 0, failures: 0, totalMs: 0, costUsd: 0, costUnknown: 0, byTask: {} });
      s.calls++; s.totalMs += e.ms || 0;
      if (!e.ok) s.failures++;
      if (e.costUsd == null) s.costUnknown++; else s.costUsd += e.costUsd;
      s.byTask[e.task] = (s.byTask[e.task] || 0) + 1;
    }
    for (const s of Object.values(by)) { s.avgMs = s.calls ? Math.round(s.totalMs / s.calls) : 0; s.costUsd = Number(s.costUsd.toFixed(4)); delete s.totalMs; }
    return by;
  }
  recent(n = 20) { return this.events.slice(-n).reverse(); }
}
