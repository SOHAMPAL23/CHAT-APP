import express from 'express';
import {
    createGroup,
    getUserGroups,
    getGroupById,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    updateMemberRole,
    kickMember,
    generateInviteCode
} from '../controllers/groupController.js';
import {
    createChannel,
    getGroupChannels
} from '../controllers/channelController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Group routes
router.post('/', protect, createGroup);
router.get('/', protect, getUserGroups);
router.get('/:groupId', protect, getGroupById);
router.put('/:groupId', protect, updateGroup);
router.delete('/:groupId', protect, deleteGroup);

// Join/Leave routes
router.post('/join/:inviteCode', protect, joinGroup);
router.post('/:groupId/leave', protect, leaveGroup);

// Member management routes
router.put('/:groupId/members/:memberId/role', protect, updateMemberRole);
router.delete('/:groupId/members/:memberId', protect, kickMember);

// Invite code routes
router.post('/:groupId/invite', protect, generateInviteCode);

// Channel routes (nested under groups)
router.post('/:groupId/channels', protect, createChannel);
router.get('/:groupId/channels', protect, getGroupChannels);

export default router;
