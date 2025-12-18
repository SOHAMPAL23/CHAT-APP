import Channel from '../models/Channel.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';

/**
 * Create a new channel
 * @route POST /api/groups/:groupId/channels
 */
export const createChannel = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, type, category, isPrivate } = req.body;
        const userId = req.user.id;

        // Find the group
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
                message: 'You do not have permission to create channels'
            });
        }

        // Create the channel
        const channel = await Channel.create({
            name,
            description,
            type: type || 'text',
            group: groupId,
            category: category || 'TEXT CHANNELS',
            isPrivate: isPrivate || false,
            position: group.channels.length
        });

        // Add channel to group
        group.channels.push(channel._id);

        // Add to category if it exists
        const categoryIndex = group.categories.findIndex((cat) => cat.name === category);
        if (categoryIndex !== -1) {
            group.categories[categoryIndex].channels.push(channel._id);
        } else if (category) {
            // Create new category
            group.categories.push({
                name: category,
                position: group.categories.length,
                channels: [channel._id]
            });
        }

        await group.save();

        res.status(201).json({
            success: true,
            message: 'Channel created successfully',
            channel
        });
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create channel',
            error: error.message
        });
    }
};

/**
 * Get all channels in a group
 * @route GET /api/groups/:groupId/channels
 */
export const getGroupChannels = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Find the group
        const group = await Group.findById(groupId);

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

        const userRole = group.getMemberRole(userId);

        // Get all channels
        const channels = await Channel.find({ group: groupId })
            .sort({ position: 1 })
            .populate('lastMessage');

        // Filter channels based on access
        const accessibleChannels = channels.filter((channel) =>
            channel.hasAccess(userId, userRole)
        );

        res.status(200).json({
            success: true,
            channels: accessibleChannels
        });
    } catch (error) {
        console.error('Get group channels error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch channels',
            error: error.message
        });
    }
};

/**
 * Get a specific channel
 * @route GET /api/channels/:channelId
 */
export const getChannelById = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId)
            .populate('group')
            .populate('pinnedMessages')
            .populate('lastMessage');

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user is a member of the group
        const group = await Group.findById(channel.group);
        if (!group.isMember(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        // Check if user has access to this channel
        const userRole = group.getMemberRole(userId);
        if (!channel.hasAccess(userId, userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this channel'
            });
        }

        res.status(200).json({
            success: true,
            channel
        });
    } catch (error) {
        console.error('Get channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch channel',
            error: error.message
        });
    }
};

/**
 * Update channel details
 * @route PUT /api/channels/:channelId
 */
export const updateChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;
        const { name, description, topic, settings, isPrivate } = req.body;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has permission
        const group = await Group.findById(channel.group);
        if (!group.hasPermission(userId, 'admin')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this channel'
            });
        }

        // Update fields
        if (name) channel.name = name;
        if (description !== undefined) channel.description = description;
        if (topic !== undefined) channel.topic = topic;
        if (settings) channel.settings = { ...channel.settings, ...settings };
        if (isPrivate !== undefined) channel.isPrivate = isPrivate;

        await channel.save();

        res.status(200).json({
            success: true,
            message: 'Channel updated successfully',
            channel
        });
    } catch (error) {
        console.error('Update channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update channel',
            error: error.message
        });
    }
};

/**
 * Delete a channel
 * @route DELETE /api/channels/:channelId
 */
export const deleteChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has permission
        const group = await Group.findById(channel.group);
        if (!group.hasPermission(userId, 'admin')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this channel'
            });
        }

        // Remove channel from group
        group.channels = group.channels.filter(
            (id) => id.toString() !== channelId
        );

        // Remove from categories
        group.categories.forEach((category) => {
            category.channels = category.channels.filter(
                (id) => id.toString() !== channelId
            );
        });

        await group.save();

        // Delete the channel
        await Channel.findByIdAndDelete(channelId);

        // Optionally: Delete all messages in the channel
        // await Message.deleteMany({ channelId });

        res.status(200).json({
            success: true,
            message: 'Channel deleted successfully'
        });
    } catch (error) {
        console.error('Delete channel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete channel',
            error: error.message
        });
    }
};

/**
 * Get messages in a channel
 * @route GET /api/channels/:channelId/messages
 */
export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { limit = 50, before } = req.query;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has access
        const group = await Group.findById(channel.group);
        if (!group.isMember(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const userRole = group.getMemberRole(userId);
        if (!channel.hasAccess(userId, userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this channel'
            });
        }

        // Get messages
        const messages = await Message.getChannelMessages(
            channelId,
            parseInt(limit),
            before ? new Date(before) : null
        );

        res.status(200).json({
            success: true,
            messages: messages.reverse() // Reverse to show oldest first
        });
    } catch (error) {
        console.error('Get channel messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

/**
 * Send a message to a channel
 * @route POST /api/channels/:channelId/messages
 */
export const sendChannelMessage = async (req, res) => {
    try {
        const { channelId } = req.params;
        const { messageText, mentions, mentionEveryone, replyTo } = req.body;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has access
        const group = await Group.findById(channel.group);
        if (!group.isMember(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const userRole = group.getMemberRole(userId);
        if (!channel.hasAccess(userId, userRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this channel'
            });
        }

        // Create message
        const message = await Message.create({
            senderId: userId,
            channelId,
            groupId: channel.group,
            messageType: 'channel',
            messageText,
            mentions: mentions || [],
            mentionEveryone: mentionEveryone || false,
            replyTo: replyTo || null
        });

        // Update channel's last message
        channel.updateLastMessage(message._id);
        await channel.save();

        // Populate message
        await message.populate('senderId', 'username profilePicture');
        await message.populate('mentions', 'username');
        if (replyTo) {
            await message.populate('replyTo', 'messageText senderId');
        }

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Send channel message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
};

/**
 * Pin a message in a channel
 * @route POST /api/channels/:channelId/messages/:messageId/pin
 */
export const pinMessage = async (req, res) => {
    try {
        const { channelId, messageId } = req.params;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has permission
        const group = await Group.findById(channel.group);
        if (!group.hasPermission(userId, 'moderator')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to pin messages'
            });
        }

        // Pin the message
        channel.pinMessage(messageId);
        await channel.save();

        // Update message
        await Message.findByIdAndUpdate(messageId, {
            isPinned: true,
            pinnedAt: new Date(),
            pinnedBy: userId
        });

        res.status(200).json({
            success: true,
            message: 'Message pinned successfully'
        });
    } catch (error) {
        console.error('Pin message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to pin message',
            error: error.message
        });
    }
};

/**
 * Unpin a message in a channel
 * @route DELETE /api/channels/:channelId/messages/:messageId/pin
 */
export const unpinMessage = async (req, res) => {
    try {
        const { channelId, messageId } = req.params;
        const userId = req.user.id;

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({
                success: false,
                message: 'Channel not found'
            });
        }

        // Check if user has permission
        const group = await Group.findById(channel.group);
        if (!group.hasPermission(userId, 'moderator')) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to unpin messages'
            });
        }

        // Unpin the message
        channel.unpinMessage(messageId);
        await channel.save();

        // Update message
        await Message.findByIdAndUpdate(messageId, {
            isPinned: false,
            pinnedAt: null,
            pinnedBy: null
        });

        res.status(200).json({
            success: true,
            message: 'Message unpinned successfully'
        });
    } catch (error) {
        console.error('Unpin message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unpin message',
            error: error.message
        });
    }
};
