import express from 'express';
import { deleteHistoryItem, getHistory, saveHistoryItem } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/', getHistory);
router.patch('/:id/save', saveHistoryItem);
router.delete('/:id', deleteHistoryItem);
export default router;
