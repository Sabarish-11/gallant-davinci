import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateMySkills,
  updateMyCareer,
  getStudents,
  getStudentById,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.put('/me/skills', protect, updateMySkills);
router.put('/me/career', protect, updateMyCareer);

// Directory access for faculty and admin
router.get('/', protect, authorize('FACULTY', 'ADMIN'), getStudents);
router.get('/:id', protect, authorize('FACULTY', 'ADMIN'), getStudentById);

export default router;
