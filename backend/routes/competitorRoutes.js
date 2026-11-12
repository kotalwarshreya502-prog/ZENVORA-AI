import express from 'express';
import { analyzeCompetitor } from '../controllers/competitorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/analyze', protect, analyzeCompetitor);
export default router;
