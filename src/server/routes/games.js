import express from 'express';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all games
router.get('/', async (req, res, next) => {
  try {
    const games = await db.getAllGames();

    res.json({
      success: true,
      data: {
        games: games || [
          // Fallback core games if DB not available
          { id: 'snake', name: 'Snake', category: 'arcade', core: true },
          { id: '2048', name: '2048', category: 'puzzle', core: true },
          { id: 'tetris', name: 'Tetris', category: 'arcade', core: true },
          { id: 'pong', name: 'Pong', category: 'sports', core: true },
          { id: 'memory-match', name: 'Memory Match', category: 'puzzle', core: true }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get game by ID
router.get('/:gameId', async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const game = await db.getGameById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: { game }
    });
  } catch (error) {
    next(error);
  }
});

// Download game (placeholder - would serve actual game files)
router.get('/:gameId/download', auth, async (req, res, next) => {
  try {
    const { gameId } = req.params;

    // In production, this would serve the actual game file
    // For now, return metadata
    res.json({
      success: true,
      message: 'Game download endpoint',
      data: {
        gameId,
        downloadUrl: `/games/downloads/${gameId}.zip`,
        version: '1.0.0',
        size: '5MB',
        checksum: 'abc123'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
