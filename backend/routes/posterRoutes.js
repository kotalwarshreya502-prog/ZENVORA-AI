/**
 * ZENVORA AI — Poster Routes
 * Universal Intelligent Poster Generation Engine routes.
 */

import express from 'express';
import { analyzePosterInput, generatePoster, getPosterHistory, proxyImage } from '../controllers/posterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Image proxy for cross-origin canvas rendering (public helper)
router.get('/proxy', proxyImage);

// All poster generation and analysis routes require authentication
router.post('/analyze', protect, analyzePosterInput);
router.post('/generate', protect, generatePoster);
router.get('/history', protect, getPosterHistory);

export default router;
