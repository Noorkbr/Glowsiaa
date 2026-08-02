const buckets = new Map();

// Periodically purge expired entries to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of buckets) {
    if (val.expiresAt <= now) buckets.delete(key);
  }
}, 60_000); // run every 60 seconds

const createRateLimit = ({ windowMs, max, message }) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.baseUrl}:${req.path}`;
  const current = buckets.get(key);

  if (!current || current.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    return res.status(429).json({
      success: false,
      message: message || 'Too many requests, please try again later',
    });
  }

  current.count += 1;
  next();
};

module.exports = { createRateLimit };
