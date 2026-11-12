import express from 'express';
import { analyzeResearch } from '../controllers/researchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/analyze', protect, analyzeResearch);
export default router;
