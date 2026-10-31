import express from 'express';
import { getMyRecommendations } from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyRecommendations);

export default router;
