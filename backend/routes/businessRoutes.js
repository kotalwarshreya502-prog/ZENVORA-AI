import express from 'express';
import { getBusinessProfile, updateBusinessProfile } from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getBusinessProfile);
router.put('/', updateBusinessProfile);

export default router;
