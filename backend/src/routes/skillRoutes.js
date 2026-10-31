import express from 'express';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../controllers/skillController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getSkills);

// CUD operations restricted to Admin
router.post('/', protect, authorize('ADMIN'), createSkill);
router.put('/:id', protect, authorize('ADMIN'), updateSkill);
router.delete('/:id', protect, authorize('ADMIN'), deleteSkill);

export default router;
