import express from 'express';
import { getBusinessProfile, updateBusinessProfile, analyzeWebsite } from '../controllers/businessController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getBusinessProfile);
router.put('/', updateBusinessProfile);
router.post('/analyze-website', analyzeWebsite);

export default router;
