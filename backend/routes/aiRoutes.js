import express from 'express';
import { generateBlog, generateCaptions, generateHashtags, generateMarketingContent } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateMarketingContent);
router.post('/blog', protect, generateBlog);
router.post('/captions', protect, generateCaptions);
router.post('/hashtags', protect, generateHashtags);

export default router;
