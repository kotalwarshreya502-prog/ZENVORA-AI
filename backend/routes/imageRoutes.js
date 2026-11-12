import express from 'express';
import { generateMarketingImage, getImageHistory } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/generate', generateMarketingImage);
router.get('/history', getImageHistory);

export default router;
