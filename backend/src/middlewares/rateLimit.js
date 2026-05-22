function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createInMemoryRateLimit({ windowMs, max, message }) {
  const hits = new Map();

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const key = getClientIp(req);
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({
        message: message || "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
      });
    }

    current.count += 1;
    hits.set(key, current);
    return next();
  };
}

module.exports = { createInMemoryRateLimit };
