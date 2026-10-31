import express from 'express';
import { getCareers, getCareerById, createCareer, updateCareer, deleteCareer } from '../controllers/careerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getCareers);
router.get('/:id', protect, getCareerById);

// CUD operations restricted to Admin
router.post('/', protect, authorize('ADMIN'), createCareer);
router.put('/:id', protect, authorize('ADMIN'), updateCareer);
router.delete('/:id', protect, authorize('ADMIN'), deleteCareer);

export default router;
