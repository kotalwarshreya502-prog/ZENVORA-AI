import express from 'express';
import { getSubscription, updatePlan } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getSubscription);
router.post('/upgrade', updatePlan);

export default router;
