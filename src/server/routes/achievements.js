import express from 'express';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user achievements
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const achievements = await db.getUserAchievements(userId);

    res.json({
      success: true,
      data: { achievements }
    });
  } catch (error) {
    next(error);
  }
});

// Unlock achievement
router.post('/:achievementId/unlock', auth, async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const userId = req.user.id;

    const achievement = await db.unlockAchievement(userId, achievementId);

    res.json({
      success: true,
      message: 'Achievement unlocked!',
      data: { achievement }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
