import express from 'express';
import { getNotifications, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.post('/mark-read', markAllRead);

export default router;
