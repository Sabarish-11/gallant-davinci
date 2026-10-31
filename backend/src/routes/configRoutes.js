import express from 'express';
import { getConfigs, updateConfig } from '../controllers/configController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getConfigs);
router.put('/', protect, authorize('ADMIN'), updateConfig);

export default router;
