import express from 'express';
import { getMarketingAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getMarketingAnalytics);

export default router;
