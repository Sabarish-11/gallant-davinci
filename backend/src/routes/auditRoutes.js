import express from 'express';
import { getMyAudit, getStudentAudit } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyAudit);
router.get('/student/:studentId', protect, authorize('FACULTY', 'ADMIN'), getStudentAudit);

export default router;
