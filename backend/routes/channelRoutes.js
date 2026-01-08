import express from 'express';
import {
    getChannelById,
    updateChannel,
    deleteChannel,
    getChannelMessages,
    sendChannelMessage,
    pinMessage,
    unpinMessage
} from '../controllers/channelController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Channel routes
router.get('/:channelId', protect, getChannelById);
router.put('/:channelId', protect, updateChannel);
router.delete('/:channelId', protect, deleteChannel);

// Message routes
router.get('/:channelId/messages', protect, getChannelMessages);
router.post('/:channelId/messages', protect, sendChannelMessage);

// Pin routes
router.post('/:channelId/messages/:messageId/pin', protect, pinMessage);
router.delete('/:channelId/messages/:messageId/pin', protect, unpinMessage);

export default router;
