import express from 'express';
import { getBrandGuidelines, updateBrandGuidelines } from '../controllers/brandController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getBrandGuidelines);
router.put('/', updateBrandGuidelines);

export default router;
