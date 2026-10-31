import express from 'express';
import { chatWithAssistant } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, chatWithAssistant);

export default router;
