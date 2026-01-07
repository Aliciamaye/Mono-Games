import express from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(200).optional()
});

// Get user profile
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await db.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', auth, validateRequest(updateProfileSchema), async (req, res, next) => {
  try {
    const updates = req.body;
    const updatedUser = await db.updateUser(req.user.id, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get('/:userId/stats', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const stats = await db.getUserStats(userId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
