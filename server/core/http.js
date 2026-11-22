// Shared HTTP helpers for providers: timeouts and error classification.
export class ProviderError extends Error {
  constructor(message, { status, retryable = false, retryAfterMs, provider } = {}) {
    super(message);
    this.status = status;
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
    this.provider = provider;
  }
}

export async function fetchJson(url, { provider, timeoutMs = 120000, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e) {
    throw new ProviderError(`${provider}: network error (${e.name === 'AbortError' ? 'timeout' : e.message})`, { retryable: true, provider });
  } finally {
    clearTimeout(timer);
  }
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const retryAfter = Number(res.headers.get('retry-after'));
    const msg = body?.error?.message || body?.message || text.slice(0, 200) || res.statusText;
    throw new ProviderError(`${provider}: ${res.status} ${msg}`, {
      status: res.status,
      retryable: res.status === 429 || res.status === 408 || res.status >= 500,
      retryAfterMs: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
      provider,
    });
  }
  return body;
}
