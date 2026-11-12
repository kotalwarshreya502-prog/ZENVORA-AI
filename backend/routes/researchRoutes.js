import express from 'express';
import {
  analyzeCompetitor,
  deleteGeneration,
  getGenerationById,
  getGenerationHistory,
  runResearch,
} from '../controllers/researchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Research Assistant
router.post('/research', runResearch);

// Competitor Analysis
router.post('/competitor', analyzeCompetitor);

// Generation History (all modules)
router.get('/history', getGenerationHistory);
router.get('/history/:id', getGenerationById);
router.delete('/history/:id', deleteGeneration);

export default router;
