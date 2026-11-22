// Background jobs for long generations. In-memory with a concurrency limit; the API is the same
// one you would put in front of BullMQ/Redis or a cloud queue when running several instances.
import { randomUUID } from 'node:crypto';

export class JobQueue {
  constructor({ concurrency = 2, ttlMs = 60 * 60 * 1000 } = {}) {
    this.jobs = new Map(); this.queue = []; this.running = 0;
    this.concurrency = concurrency; this.ttlMs = ttlMs;
    setInterval(() => this.#sweep(), 5 * 60 * 1000).unref();
  }
  /** @param {(ctx: { progress: (n: number) => void }) => Promise<any>} fn */
  create(type, fn, owner) {
    const job = { id: randomUUID(), type, owner, status: 'queued', progress: 0, createdAt: Date.now() };
    this.jobs.set(job.id, job);
    this.queue.push({ job, fn });
    this.#pump();
    return job;
  }
  get(id) { return this.jobs.get(id); }
  public(job) { const { owner, ...rest } = job; return rest; } // eslint-disable-line no-unused-vars
  #pump() {
    while (this.running < this.concurrency && this.queue.length) {
      const { job, fn } = this.queue.shift();
      this.running++;
      job.status = 'running'; job.startedAt = Date.now();
      fn({ progress: (n) => { job.progress = Math.max(0, Math.min(1, n)); } })
        .then((result) => { job.status = 'done'; job.progress = 1; job.result = result; })
        .catch((e) => { job.status = 'failed'; job.error = e.publicMessage || e.message; })
        .finally(() => { job.finishedAt = Date.now(); this.running--; this.#pump(); });
    }
  }
  #sweep() { const cut = Date.now() - this.ttlMs; for (const [id, j] of this.jobs) if (j.createdAt < cut) this.jobs.delete(id); }
  stats() { const s = { queued: 0, running: 0, done: 0, failed: 0 }; for (const j of this.jobs.values()) s[j.status]++; return s; }
}
