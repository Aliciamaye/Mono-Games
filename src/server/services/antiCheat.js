import crypto from 'crypto';

/**
 * Anti-cheat service for validating game scores
 */

const ANTI_CHEAT_SECRET = process.env.ANTI_CHEAT_SECRET || 'change-this-secret';

export const validateScore = ({ userId, gameId, score, timestamp, signature, duration }) => {
  try {
    // 1. Validate timestamp (not too old, not in future)
    const now = Date.now();
    const timeDiff = now - timestamp;
    
    if (timeDiff < 0) {
      return { isValid: false, reason: 'Score submitted from the future' };
    }
    
    if (timeDiff > 24 * 60 * 60 * 1000) { // 24 hours
      return { isValid: false, reason: 'Score too old' };
    }

    // 2. Validate signature
    const expectedSignature = generateSignature(userId, gameId, score, timestamp);
    if (signature !== expectedSignature) {
      return { isValid: false, reason: 'Invalid signature' };
    }

    // 3. Validate duration (if provided)
    if (duration !== undefined) {
      if (duration < 1000) { // Minimum 1 second
        return { isValid: false, reason: 'Duration too short' };
      }
      
      if (duration > 24 * 60 * 60 * 1000) { // Max 24 hours
        return { isValid: false, reason: 'Duration too long' };
      }
    }

    // 4. Game-specific validation
    const gameValidation = validateGameScore(gameId, score, duration);
    if (!gameValidation.isValid) {
      return gameValidation;
    }

    return { isValid: true };
  } catch (error) {
    console.error('Anti-cheat validation error:', error);
    return { isValid: false, reason: 'Validation error' };
  }
};

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
