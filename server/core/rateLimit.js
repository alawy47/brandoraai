// Per-client token bucket (user id when signed in, otherwise IP). Protects provider quotas and costs.
export function rateLimit({ perMinute = 20, burst = 10 } = {}) {
  const buckets = new Map();
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const b = buckets.get(key) || { tokens: burst, at: now };
    b.tokens = Math.min(burst, b.tokens + ((now - b.at) / 60000) * perMinute);
    b.at = now;
    if (b.tokens < 1) {
      res.set('Retry-After', String(Math.ceil(((1 - b.tokens) / perMinute) * 60)));
      return res.status(429).json({ error: 'Too many requests. Wait a moment and try again.' });
    }
    b.tokens -= 1;
    buckets.set(key, b);
    next();
  };
}
