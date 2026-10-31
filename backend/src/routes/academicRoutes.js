import express from 'express';
import {
  getAcademicRecords,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
  overrideProfileStats,
} from '../controllers/academicController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAcademicRecords);

// Modification access restricted to Faculty & Admin
router.post('/', protect, authorize('FACULTY', 'ADMIN'), createAcademicRecord);
router.put('/:id', protect, authorize('FACULTY', 'ADMIN'), updateAcademicRecord);
router.delete('/:id', protect, authorize('FACULTY', 'ADMIN'), deleteAcademicRecord);
router.put('/student/:studentId/override', protect, authorize('FACULTY', 'ADMIN'), overrideProfileStats);

export default router;
