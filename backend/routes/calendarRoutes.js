import express from 'express';
import { getCalendarEvents, scheduleEvent } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getCalendarEvents);
router.post('/schedule', scheduleEvent);

export default router;
