import express from 'express';
import { getMySkillGap, getStudentSkillGap } from '../controllers/skillGapController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMySkillGap);
router.get('/student/:studentId', protect, authorize('FACULTY', 'ADMIN'), getStudentSkillGap);

export default router;
