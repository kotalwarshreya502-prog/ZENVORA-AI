import express from 'express';
import { analyzeWebsiteSeo } from '../controllers/seoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeWebsiteSeo);

export default router;
