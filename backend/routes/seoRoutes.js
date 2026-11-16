import express from 'express';
import { analyzeWebsiteSeo, researchKeywords } from '../controllers/seoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeWebsiteSeo);
router.post('/keywords', protect, researchKeywords);

export default router;
