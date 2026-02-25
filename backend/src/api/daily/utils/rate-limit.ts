const store = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    store.set(key, valid);
    return false; // Rate limited
  }

  valid.push(now);
  store.set(key, valid);
  return true; // Allowed
}

export function getClientIP(ctx: any): string {
  return (
    ctx.request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    ctx.request.ip ||
    "unknown"
  );
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;
  for (const [key, timestamps] of store.entries()) {
    const valid = timestamps.filter((t) => now - t < maxAge);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}, 5 * 60 * 1000);
