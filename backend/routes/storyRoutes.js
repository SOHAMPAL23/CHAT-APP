import express from 'express';
import { protect } from '../middleware/auth.js';
import { createStory, getStories } from '../controllers/storyController.js';

const router = express.Router();

router.use(protect);

router.post('/', createStory);
router.get('/', getStories);

export default router;
