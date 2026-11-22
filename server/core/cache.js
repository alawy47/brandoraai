// Small TTL cache with in-flight de-duplication: identical concurrent requests share one provider call.
import { createHash } from 'node:crypto';

export class ResultCache {
  constructor({ max = 500, ttlMs = 60 * 60 * 1000 } = {}) {
    this.max = max; this.ttlMs = ttlMs;
    this.map = new Map(); this.inflight = new Map();
    this.hits = 0; this.misses = 0; this.shared = 0;
  }
  static key(...parts) { return createHash('sha256').update(JSON.stringify(parts)).digest('hex'); }
  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.exp) { this.map.delete(key); return undefined; }
    this.map.delete(key); this.map.set(key, e); // refresh LRU position
    return e.value;
  }
  set(key, value) {
    this.map.set(key, { value, exp: Date.now() + this.ttlMs });
    while (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
  }
  /** Returns a cached value, joins an identical in-flight call, or runs fn once. */
  async wrap(key, fn) {
    const hit = this.get(key);
    if (hit !== undefined) { this.hits++; return { value: hit, cached: true }; }
    if (this.inflight.has(key)) { this.shared++; return { value: await this.inflight.get(key), cached: true }; }
    this.misses++;
    const p = fn().then((v) => { this.set(key, v); return v; }).finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return { value: await p, cached: false };
  }
  stats() { return { entries: this.map.size, hits: this.hits, misses: this.misses, shared: this.shared }; }
}
