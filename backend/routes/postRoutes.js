import express from 'express';
import { createPost, deletePost, getPosts, updatePost, publishPost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getPosts);
router.post('/', createPost);
router.post('/:id/publish', publishPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
