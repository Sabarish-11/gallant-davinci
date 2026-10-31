import express from 'express';
import {
  getStudentDashboard,
  getFacultyDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/student', protect, authorize('STUDENT'), getStudentDashboard);
router.get('/faculty', protect, authorize('FACULTY'), getFacultyDashboard);
router.get('/admin', protect, authorize('ADMIN'), getAdminDashboard);

export default router;
