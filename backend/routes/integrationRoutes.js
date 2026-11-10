import express from 'express';
import { getIntegrations, toggleIntegration } from '../controllers/integrationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getIntegrations);
router.post('/:id/toggle', toggleIntegration);

export default router;
