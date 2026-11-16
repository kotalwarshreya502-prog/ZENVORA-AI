import express from 'express';
import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  updateCampaign,
  generateCampaignStrategy,
} from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/generate-strategy', generateCampaignStrategy);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

export default router;
