import express from 'express';
import {
  getMessages,
  sendMessage,
  getConversations,
  deleteMessage,
  addReaction,
  removeReaction
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Message Routes
 * All routes are protected (require authentication)
 */

router.use(protect); // Apply protect middleware to all routes

router.get('/conversations', getConversations);
router.get('/:userId', getMessages);
router.post('/:userId', sendMessage);
router.delete('/:messageId', deleteMessage);
router.post('/:messageId/react', addReaction);
router.delete('/:messageId/react', removeReaction);

export default router;
