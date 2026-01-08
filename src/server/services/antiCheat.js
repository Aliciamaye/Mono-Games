import crypto from 'crypto';
import sessionManager from './sessionManager.js';

/**
 * Advanced Anti-Cheat System
 * Multiple layers of validation to prevent score manipulation
 */

const ANTI_CHEAT_SECRET = process.env.ANTI_CHEAT_SECRET || 'change-this-secret';

class AntiCheatSystem {
  constructor() {
    this.suspiciousUsers = new Map();
    this.bannedUsers = new Set();
    this.scorePatterns = new Map();
  }

  /**
   * Comprehensive score validation (Enhanced)
   */
  async validateScore({ userId, gameId, score, timestamp, signature, duration, sessionId, metadata = {} }) {
    const checks = [];

    // 1. User ban check
    if (this.bannedUsers.has(userId)) {
      return {
        isValid: false,
        valid: false,
        reason: 'USER_BANNED',
        confidence: 0,
        adjustedScore: 0
      };
    }

    // 2. Timestamp validation
    const now = Date.now();
    const timeDiff = now - timestamp;
    
    if (timeDiff < 0) {
      return { isValid: false, valid: false, reason: 'Score submitted from the future' };
    }
    
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return { isValid: false, valid: false, reason: 'Score too old' };
    }

    // 3. Signature validation
    const expectedSignature = generateSignature(userId, gameId, score, timestamp);
    if (signature && signature !== expectedSignature) {
      return { isValid: false, valid: false, reason: 'Invalid signature' };
    }

    // 4. Session validation
    const sessionValidation = sessionId 
      ? sessionManager.endSession(sessionId, score)
      : { valid: true, confidence: 0.8, flags: ['NO_SESSION'] };
    
    checks.push({ name: 'session', ...sessionValidation });

    // 5. Score reasonability check
    const reasonability = this.checkScoreReasonability(gameId, score);
    checks.push({ name: 'reasonability', ...reasonability });

    // 6. Timing analysis
    const timing = this.analyzeTiming({ duration });
    checks.push({ name: 'timing', ...timing });

    // 7. Pattern detection
    const pattern = this.detectAnomalousPatterns(userId, gameId, score);
    checks.push({ name: 'pattern', ...pattern });

    // 8. Game-specific validation
    const gameValidation = validateGameScore(gameId, score, duration);
    if (!gameValidation.isValid) {
      return gameValidation;
    }
    checks.push({ name: 'game-specific', valid: true, confidence: 1.0 });

    // Calculate overall confidence
    const validChecks = checks.filter(c => c.valid !== false);
    const averageConfidence = validChecks.reduce((sum, c) => sum + (c.confidence || 1), 0) / checks.length;
    
    const allFlags = checks.flatMap(c => c.flags || []);
    const isValid = averageConfidence > 0.5 && !checks.some(c => c.valid === false);

    // Track suspicious users
    if (!isValid || averageConfidence < 0.6) {
      this.trackSuspiciousUser(userId, { gameId, score, checks, confidence: averageConfidence });
    }

    // Store pattern for this user
    this.recordScorePattern(userId, gameId, score);

    return {
      isValid: isValid,
      valid: isValid,
      confidence: averageConfidence,
      adjustedScore: isValid ? Math.floor(score * Math.max(averageConfidence, 0.7)) : 0,
      originalScore: score,
      flags: allFlags,
      checks: checks.map(c => ({ name: c.name, valid: c.valid !== false, confidence: c.confidence }))
    };
  }

  /**
   * Check if score is within reasonable limits
   */
  checkScoreReasonability(gameId, score) {
    const maxScores = {
      'snake': 50000,
      'tetris': 999999,
      'pong': 21,
      '2048': 200000,
      'breakout': 10000,
      'flappy-bird': 10000,
      'connect-four': 1,
      'tic-tac-toe': 1,
      'memory-match': 5000,
      'default': 100000
    };

    const maxScore = maxScores[gameId] || maxScores.default;
    
    if (score > maxScore) {
      return { valid: false, confidence: 0, flags: ['SCORE_TOO_HIGH'] };
    }

    if (score < 0) {
      return { valid: false, confidence: 0, flags: ['NEGATIVE_SCORE'] };
    }

    if (score > maxScore * 0.95) {
      return { valid: true, confidence: 0.6, flags: ['NEAR_MAXIMUM'] };
    }

    return { valid: true, confidence: 1.0, flags: [] };
  }

  /**
   * Analyze timing metadata
   */
  analyzeTiming(metadata) {
    if (!metadata.duration) {
      return { valid: true, confidence: 0.8, flags: ['NO_TIMING_DATA'] };
    }

    const duration = metadata.duration;
    const flags = [];
    let confidence = 1.0;

    if (duration < 5000) {
      flags.push('TOO_FAST');
      confidence = 0.3;
    }

    if (duration > 3600000) {
      flags.push('TOO_LONG');
      confidence = 0.7;
    }

    return { valid: confidence > 0.5, confidence, flags };
  }

  /**
   * Detect anomalous scoring patterns
   */
  detectAnomalousPatterns(userId, gameId, score) {
    const key = `${userId}_${gameId}`;
    const history = this.scorePatterns.get(key) || [];

    if (history.length < 3) {
      return { valid: true, confidence: 0.9, flags: [] };
    }

    const recentScores = history.slice(-10);
    const maxScore = Math.max(...recentScores);

    const flags = [];
    let confidence = 1.0;

    if (score > maxScore * 3) {
      flags.push('SUDDEN_IMPROVEMENT');
      confidence -= 0.3;
    }

    const perfectScores = recentScores.filter(s => s === maxScore).length;
    if (perfectScores > 5 && score === maxScore) {
      flags.push('CONSISTENT_PERFECT');
      confidence -= 0.2;
    }

    const variance = this.calculateVariance(recentScores);
    if (variance < 10 && recentScores.length > 5) {
      flags.push('ZERO_VARIANCE');
      confidence -= 0.4;
    }

    return { valid: confidence > 0.4, confidence, flags };
  }

  /**
   * Track suspicious user activity
   */
  trackSuspiciousUser(userId, incident) {
    if (!this.suspiciousUsers.has(userId)) {
      this.suspiciousUsers.set(userId, {
        incidents: [],
        firstSeen: Date.now(),
        riskScore: 0
      });
    }

    const record = this.suspiciousUsers.get(userId);
    record.incidents.push({ timestamp: Date.now(), ...incident });
    record.riskScore = this.calculateRiskScore(record);

    if (record.riskScore > 80) {
      this.bannedUsers.add(userId);
      console.warn(`⚠️  User ${userId} auto-banned due to high risk score: ${record.riskScore}`);
    }

    if (record.incidents.length > 50) {
      record.incidents = record.incidents.slice(-50);
    }
  }

  /**
   * Calculate user risk score (0-100)
   */
  calculateRiskScore(record) {
    let score = 0;

    const recentIncidents = record.incidents.filter(i => 
      Date.now() - i.timestamp < 24 * 60 * 60 * 1000
    );

    score += recentIncidents.length * 10;

    const severeFlags = ['USER_BANNED', 'SCORE_TOO_HIGH', 'SESSION_TAMPERING', 'AUTOMATION_DETECTED'];
    const severeIncidents = record.incidents.filter(i => 
      i.checks?.some(c => c.flags?.some(f => severeFlags.includes(f)))
    );

    score += severeIncidents.length * 20;

    const lowConfidenceIncidents = record.incidents.filter(i => i.confidence < 0.3);
    score += lowConfidenceIncidents.length * 15;

    return Math.min(score, 100);
  }

  /**
   * Record score pattern for analysis
   */
  recordScorePattern(userId, gameId, score) {
    const key = `${userId}_${gameId}`;
    if (!this.scorePatterns.has(key)) {
      this.scorePatterns.set(key, []);
    }

    const patterns = this.scorePatterns.get(key);
    patterns.push(score);

    if (patterns.length > 50) {
      patterns.shift();
    }
  }

  /**
   * Calculate variance of scores
   */
  calculateVariance(scores) {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length;
  }

  /**
   * Get user risk profile
   */
  getUserRiskProfile(userId) {
    const record = this.suspiciousUsers.get(userId);
    
    return {
      isBanned: this.bannedUsers.has(userId),
      riskScore: record?.riskScore || 0,
      incidents: record?.incidents.length || 0,
      recentIncidents: record?.incidents.filter(i => 
        Date.now() - i.timestamp < 24 * 60 * 60 * 1000
      ).length || 0,
      firstSeen: record?.firstSeen || null
    };
  }

  /**
   * Admin methods
   */
  banUser(userId, reason) {
    this.bannedUsers.add(userId);
    console.log(`🚫 User ${userId} banned: ${reason}`);
  }

  unbanUser(userId) {
    this.bannedUsers.delete(userId);
    this.suspiciousUsers.delete(userId);
    console.log(`✅ User ${userId} unbanned`);
  }

  getStats() {
    return {
      bannedUsers: this.bannedUsers.size,
      suspiciousUsers: this.suspiciousUsers.size,
      totalIncidents: Array.from(this.suspiciousUsers.values())
        .reduce((sum, r) => sum + r.incidents.length, 0),
      highRiskUsers: Array.from(this.suspiciousUsers.values())
        .filter(r => r.riskScore > 50).length
    };
  }
}

// Singleton instance
const antiCheatSystem = new AntiCheatSystem();

// Export enhanced validation function
export const validateScore = (params) => antiCheatSystem.validateScore(params);
export { antiCheatSystem };

export const generateSignature = (userId, gameId, score, timestamp) => {
  const data = `${userId}-${gameId}-${score}-${timestamp}-${ANTI_CHEAT_SECRET}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Game-specific score validation
 */
const validateGameScore = (gameId, score, duration) => {
  switch (gameId) {
    case 'snake':
      // Snake: max reasonable score is around 10000
      // Each apple is 10 points, max ~1000 apples
      if (score > 10000) {
        return { isValid: false, reason: 'Score too high for Snake' };
      }
      
      // Minimum time for achieving score (1 second per 100 points)
      if (duration && score / duration > 100 / 1000) {
        return { isValid: false, reason: 'Score too fast for Snake' };
      }
      break;

    case '2048':
      // 2048: score must be power of 2 related
      if (score < 0 || score > 1000000) {
        return { isValid: false, reason: 'Invalid 2048 score range' };
      }
      break;

    case 'tetris':
      // Tetris: reasonable max score
      if (score > 999999) {
        return { isValid: false, reason: 'Score too high for Tetris' };
      }
      break;

    // Add more game-specific validations
    default:
      // Generic validation
      if (score < 0 || score > 999999999) {
        return { isValid: false, reason: 'Invalid score range' };
      }
  }

  return { isValid: true };
};

/**
 * Detect suspicious patterns
 */
export const detectSuspiciousActivity = (userScores) => {
  // Check for score manipulation patterns
  const suspiciousPatterns = {
    tooManyHighScores: false,
    impossibleProgression: false,
    identicalScores: false
  };

  // Too many perfect/max scores
  const maxScores = userScores.filter(s => s.score > 900000).length;
  if (maxScores > 5) {
    suspiciousPatterns.tooManyHighScores = true;
  }

  // Impossible progression (jumping from low to extremely high)
  const sorted = userScores.sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 1; i < sorted.length; i++) {
    const prevScore = sorted[i - 1].score;
    const currScore = sorted[i].score;
    
    if (prevScore < 100 && currScore > 10000) {
      suspiciousPatterns.impossibleProgression = true;
    }
  }

  // Multiple identical high scores (unlikely)
  const scoreCounts = {};
  userScores.forEach(s => {
    scoreCounts[s.score] = (scoreCounts[s.score] || 0) + 1;
  });
  
  Object.entries(scoreCounts).forEach(([score, count]) => {
    if (parseInt(score) > 1000 && count > 3) {
      suspiciousPatterns.identicalScores = true;
    }
  });

  return {
    isSuspicious: Object.values(suspiciousPatterns).some(v => v),
    patterns: suspiciousPatterns
  };
};

export default {
  validateScore,
  generateSignature,
  detectSuspiciousActivity
};
