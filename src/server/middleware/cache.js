/**
 * Cache Middleware
 * Implements in-memory caching for API responses
 */

const cache = new Map();
const CACHE_DURATION = {
  SHORT: 60 * 1000,        // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 30 * 60 * 1000,    // 30 minutes
  DAY: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Generate cache key from request
 */
function getCacheKey(req) {
  const userId = req.user?.id || 'anonymous';
  return `${req.method}:${req.originalUrl}:${userId}`;
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(duration = CACHE_DURATION.MEDIUM) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = getCacheKey(req);
    const cachedData = cache.get(key);

    if (cachedData && Date.now() < cachedData.expiry) {
      console.log(`Cache HIT: ${key}`);
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData.data);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = (data) => {
      cache.set(key, {
        data,
        expiry: Date.now() + duration
      });
      
      res.setHeader('X-Cache', 'MISS');
      console.log(`Cache MISS: ${key}`);
      
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache by pattern
 */
export function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear();
    console.log('Cache cleared completely');
    return cache.size;
  }

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }
  
  console.log(`Cleared ${cleared} cache entries matching: ${pattern}`);
  return cleared;
}

/**
 * Clear expired cache entries
 */
export function cleanExpiredCache() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of cache.entries()) {
    if (now >= value.expiry) {
      cache.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired cache entries`);
  }
  
  return cleaned;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  
  for (const value of cache.values()) {
    if (now < value.expiry) {
      active++;
    } else {
      expired++;
    }
  }

  return {
    total: cache.size,
    active,
    expired
  };
}

// Auto-cleanup every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);

export { CACHE_DURATION };
export default { cacheMiddleware, clearCache, cleanExpiredCache, getCacheStats };
