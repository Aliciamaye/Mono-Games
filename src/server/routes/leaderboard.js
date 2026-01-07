import express from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { validateScore } from '../services/antiCheat.js';

const router = express.Router();

// Validation schema
const submitScoreSchema = z.object({
  score: z.number().int().min(0),
  gameId: z.string(),
  timestamp: z.number(),
  signature: z.string(),
  duration: z.number().optional(),
  metadata: z.object({}).passthrough().optional()
});

// Get leaderboard for a game
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    const leaderboard = await db.getLeaderboard(gameId, limit);

    res.json({
      success: true,
      data: {
        gameId,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id,
          username: entry.users?.username || 'Anonymous',
          avatar: entry.users?.avatar,
          score: entry.score,
          submittedAt: entry.submitted_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Submit score
router.post('/:gameId', auth, validateRequest(submitScoreSchema), async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { score, timestamp, signature, duration, metadata } = req.body;
    const userId = req.user.id;

    // Validate score with anti-cheat
    const validation = validateScore({
      userId,
      gameId,
      score,
      timestamp,
      signature,
      duration
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Score validation failed',
        reason: validation.reason
      });
    }

    // Check if it's a new personal best
    const currentBest = await db.getUserBestScore(userId, gameId);
    const isNewBest = !currentBest || score > currentBest.score;

    if (isNewBest) {
      // Submit new score
      const scoreData = {
        user_id: userId,
        game_id: gameId,
        score,
        metadata,
        submitted_at: new Date().toISOString()
      };

      const newScore = await db.submitScore(scoreData);

      // Check for achievements
      // TODO: Implement achievement checking logic

      res.json({
        success: true,
        message: 'Score submitted successfully',
        data: {
          score: newScore.score,
          isNewBest: true,
          previousBest: currentBest?.score || 0
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Score recorded but not a new best',
        data: {
          score,
          isNewBest: false,
          currentBest: currentBest.score
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get user's position in leaderboard
router.get('/:gameId/position/:userId', async (req, res, next) => {
  try {
    const { gameId, userId } = req.params;

    const bestScore = await db.getUserBestScore(userId, gameId);
    
    if (!bestScore) {
      return res.json({
        success: true,
        data: {
          hasScore: false
        }
      });
    }

    // Get rank (count how many scores are better)
    const leaderboard = await db.getLeaderboard(gameId, 10000);
    const rank = leaderboard.findIndex(entry => entry.user_id === userId) + 1;

    res.json({
      success: true,
      data: {
        hasScore: true,
        score: bestScore.score,
        rank,
        totalPlayers: leaderboard.length
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
