/**
 * Rate Limiting Bypass Techniques
 * Advanced rate limiting with token bucket algorithm and adaptive limits
 */

import rateLimit from 'express-rate-limit';

// Token bucket for advanced rate limiting
class TokenBucket {
  constructor(capacity, fillRate) {
    this.capacity = capacity;
    this.fillRate = fillRate; // tokens per second
    this.tokens = capacity;
    this.lastFill = Date.now();
  }

  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastFill) / 1000;
    const tokensToAdd = elapsed * this.fillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastFill = now;
  }

  getTokens() {
    this.refill();
    return this.tokens;
  }
}

// Store for user buckets
const userBuckets = new Map();

/**
 * Get or create token bucket for user
 */
function getUserBucket(userId, capacity = 100, fillRate = 10) {
  if (!userBuckets.has(userId)) {
    userBuckets.set(userId, new TokenBucket(capacity, fillRate));
  }
  return userBuckets.get(userId);
}

/**
 * Adaptive rate limiter - adjusts based on server load
 */
export function adaptiveRateLimit(baseMax = 100) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      // VIP users get higher limits
      if (req.user?.subscription === 'premium') {
        return baseMax * 5;
      }
      
      // Authenticated users get better limits
      if (req.user) {
        return baseMax * 2;
      }
      
      // Check server load
      const loadAvg = process.cpuUsage().user / 1000000; // Convert to seconds
      const serverLoad = Math.min(loadAvg / 100, 1); // 0-1 scale
      
      // Reduce limit if server is under heavy load
      return Math.max(10, Math.floor(baseMax * (1 - serverLoad * 0.5)));
    },
    message: (req) => {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: req.rateLimit.resetTime
      };
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    },
    // Use token bucket for more granular control
    handler: (req, res) => {
      const userId = req.user?.id || req.ip;
      const bucket = getUserBucket(userId);
      
      if (!bucket.consume(1)) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please slow down.',
          remainingTokens: Math.floor(bucket.getTokens()),
          maxTokens: bucket.capacity
        });
      }
      
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: 60
      });
    }
  });
}

/**
 * Endpoint-specific rate limiters
 */
export const rateLimiters = {
  // Strict for authentication
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: {
      success: false,
      message: 'Too many login attempts. Please try again later.'
    }
  }),

  // Moderate for game actions
  game: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
      success: false,
      message: 'Too many game requests. Please wait a moment.'
    }
  }),

  // Generous for leaderboards (read-only)
  leaderboard: rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: 'Too many leaderboard requests.'
    }
  }),

  // Very strict for score submission (anti-cheat)
  scoreSubmit: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: {
      success: false,
      message: 'Too many score submissions. Please play more before submitting.'
    },
    // Store in memory to detect patterns
    keyGenerator: (req) => {
      return `${req.ip}:${req.user?.id}:score`;
    }
  }),

  // File upload limits
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
      success: false,
      message: 'Upload limit reached. Please try again later.'
    }
  })
};

/**
 * Bypass rate limiting with special tokens
 * (For testing or admin purposes)
 */
export function bypassRateLimit(req, res, next) {
  const bypassToken = req.headers['x-bypass-token'];
  
  if (bypassToken === process.env.RATE_LIMIT_BYPASS_TOKEN) {
    console.log('Rate limit bypassed with token');
    return next();
  }
  
  // Check for admin role
  if (req.user?.role === 'admin') {
    return next();
  }
  
  next();
}

/**
 * Clean up old buckets to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [userId, bucket] of userBuckets.entries()) {
    // Remove buckets not used in last hour
    if (now - bucket.lastFill > 60 * 60 * 1000) {
      userBuckets.delete(userId);
    }
  }
  
  if (userBuckets.size > 0) {
    console.log(`Cleaned up rate limit buckets. Remaining: ${userBuckets.size}`);
  }
}, 30 * 60 * 1000); // Every 30 minutes

export default {
  adaptiveRateLimit,
  rateLimiters,
  bypassRateLimit,
  getUserBucket
};
