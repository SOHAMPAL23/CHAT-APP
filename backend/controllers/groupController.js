import Group from '../models/Group.js';
import Channel from '../models/Channel.js';
import User from '../models/User.js';

/**
 * Create a new group
 * @route POST /api/groups
 */
export const createGroup = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        const userId = req.user.id;

        // Create the group
        const group = await Group.create({
            name,
            description,
            isPublic: isPublic || false,
            owner: userId,
            members: [
                {
                    user: userId,
                    role: 'owner',
                    joinedAt: new Date()
                }
            ]
        });

        // Generate invite code
        group.generateInviteCode();
        await group.save();

        // Create default channels
        const generalChannel = await Channel.create({
            name: 'general',
            description: 'General discussion',
            type: 'text',
            group: group._id,
            category: 'TEXT CHANNELS',
            position: 0
        });

        const announcementsChannel = await Channel.create({
            name: 'announcements',
            description: 'Important announcements',
            type: 'announcement',
            group: group._id,
            category: 'TEXT CHANNELS',
            position: 1
        });

        // Add channels to group
        group.channels.push(generalChannel._id, announcementsChannel._id);

        // Add default category
        group.categories.push({
            name: 'TEXT CHANNELS',
            position: 0,
            channels: [generalChannel._id, announcementsChannel._id]
        });

        await group.save();

        // Populate the group
        await group.populate('members.user', 'username profilePicture email');
        await group.populate('channels');

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            group
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create group',
            error: error.message
        });
    }
};

/**
 * Get all groups for the current user
 * @route GET /api/groups
 */
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.find({
            'members.user': userId
        })
            .populate('members.user', 'username profilePicture isOnline')
            .populate('channels')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            groups
        });
    } catch (error) {
        console.error('Get user groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch groups',
            error: error.message
        });
    }
};

/**
 * Get a specific group by ID
 * @route GET /api/groups/:groupId
 */
export const getGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId)
            .populate('members.user', 'username profilePicture email isOnline lastSeen')
            .populate('channels')
            .populate('owner', 'username profilePicture');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member
        if (!group.isMember(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch group',
            error: error.message
        });
    }
};

/**
 * Update group details
 * @route PUT /api/groups/:groupId
 */
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const { name, description, icon, banner, settings } = req.body;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user has permission (admin or owner)
        if (!group.hasPermission(userId, 'admin')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this group'
            });
        }

        // Update fields
        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        if (icon !== undefined) group.icon = icon;
        if (banner !== undefined) group.banner = banner;
        if (settings) group.settings = { ...group.settings, ...settings };

        await group.save();
        await group.populate('members.user', 'username profilePicture');
        await group.populate('channels');

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            group
        });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update group',
            error: error.message
        });
    }
};

/**
 * Delete a group
 * @route DELETE /api/groups/:groupId
 */
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Only owner can delete the group
        if (group.owner.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the group owner can delete the group'
            });
        }

        // Delete all channels in the group
        await Channel.deleteMany({ group: groupId });

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete group',
            error: error.message
        });
    }
};

/**
 * Join a group using invite code
 * @route POST /api/groups/join/:inviteCode
 */
export const joinGroup = async (req, res) => {
    try {
        const { inviteCode } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ inviteCode });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if user is already a member
        if (group.isMember(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        // Add user as member
        group.addMember(userId, 'member');
        await group.save();

        await group.populate('members.user', 'username profilePicture');
        await group.populate('channels');

        res.status(200).json({
            success: true,
            message: 'Successfully joined the group',
            group
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join group',
            error: error.message
        });
    }
};

/**
 * Leave a group
 * @route POST /api/groups/:groupId/leave
 */
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Owner cannot leave, must transfer ownership or delete group
        if (group.owner.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'Owner cannot leave the group. Transfer ownership or delete the group.'
            });
        }

        // Remove user from members
        group.removeMember(userId);
        await group.save();

        res.status(200).json({
            success: true,
            message: 'Successfully left the group'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to leave group',
            error: error.message
        });
    }
};

/**
 * Update member role
 * @route PUT /api/groups/:groupId/members/:memberId/role
 */
export const updateMemberRole = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const { role } = req.body;
        const userId = req.user.id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user has permission (admin or owner)
        if (!group.hasPermission(userId, 'admin')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update member roles'
            });
        }

        // Cannot change owner role
        if (group.owner.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change owner role'
            });
        }

        // Update role
        group.updateMemberRole(memberId, role);
        await group.save();

        await group.populate('members.user', 'username profilePicture');

        res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
            group
        });
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update member role',
            error: error.message
        });
    }
};

/**
 * Kick a member from the group
 * @route DELETE /api/groups/:groupId/members/:memberId
 */
export const kickMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user has permission (moderator or higher)
        if (!group.hasPermission(userId, 'moderator')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to kick members'
            });
        }

        // Cannot kick owner
        if (group.owner.toString() === memberId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot kick the group owner'
            });
        }

        // Remove member
        group.removeMember(memberId);
        await group.save();

        res.status(200).json({
            success: true,
            message: 'Member kicked successfully'
        });
    } catch (error) {
        console.error('Kick member error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to kick member',
            error: error.message
        });
    }
};

/**
 * Generate new invite code
 * @route POST /api/groups/:groupId/invite
 */
export const generateInviteCode = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user has permission
        if (!group.hasPermission(userId, 'moderator')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to generate invite codes'
            });
        }

        // Generate new code
        const inviteCode = group.generateInviteCode();
        await group.save();

        res.status(200).json({
            success: true,
            inviteCode
        });
    } catch (error) {
        console.error('Generate invite code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate invite code',
            error: error.message
        });
    }
};
