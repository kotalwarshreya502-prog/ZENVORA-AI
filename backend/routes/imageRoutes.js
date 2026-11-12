import express from 'express';
import { generateImage, generateSocialGraphic } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/generate', generateImage);
router.post('/social', generateSocialGraphic);
export default router;
