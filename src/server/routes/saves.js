import express from 'express';
import { z } from 'zod';
import { db } from '../utils/db.js';
import { auth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const saveDataSchema = z.object({
  saveData: z.any()
});

// Get save
router.get('/:gameId', auth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const save = await db.getSave(userId, gameId);

    res.json({
      success: true,
      data: { save }
    });
  } catch (error) {
    next(error);
  }
});

// Upload/update save
router.post('/:gameId', auth, validateRequest(saveDataSchema), async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { saveData } = req.body;
    const userId = req.user.id;

    const save = await db.upsertSave(userId, gameId, saveData);

    res.json({
      success: true,
      message: 'Save uploaded successfully',
      data: { save }
    });
  } catch (error) {
    next(error);
  }
});

// Delete save
router.delete('/:gameId', auth, async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    await db.deleteSave(userId, gameId);

    res.json({
      success: true,
      message: 'Save deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
