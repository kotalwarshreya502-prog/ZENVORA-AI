/**
 * ZENVORA AI — AI Routes
 * All AI generation endpoints, authenticated.
 */
import express from 'express';
import {
  generateMarketingContent,
  generateBlog,
  generateCaptions,
  generateHashtags,
  generateSocialPost,
  generateAdCreative,
  generateCampaignStrategy,
  generateEmail,
  generateContentCalendar,
  improveContent,
  generateBrandVoice,
  generateProductDescription,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Core generation (Content Studio + Social Post Creator) ────────────────────
router.post('/generate', protect, generateMarketingContent);

// ── Dedicated aliases (new endpoints) ────────────────────────────────────────
router.post('/social-post',          protect, generateSocialPost);
router.post('/caption',              protect, generateCaptions);
router.post('/captions',             protect, generateCaptions);    // backward-compat
router.post('/hashtags',             protect, generateHashtags);
router.post('/blog',                 protect, generateBlog);
router.post('/ad-creative',          protect, generateAdCreative);
router.post('/campaign',             protect, generateCampaignStrategy);
router.post('/email',                protect, generateEmail);
router.post('/content-calendar',     protect, generateContentCalendar);
router.post('/improve',              protect, improveContent);
router.post('/brand-voice',          protect, generateBrandVoice);
router.post('/product-description',  protect, generateProductDescription);

export default router;
