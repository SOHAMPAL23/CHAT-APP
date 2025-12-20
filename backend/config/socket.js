import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

/**
 * Map to store online users
 * Key: userId, Value: socketId
 */
const onlineUsers = new Map();

/**
 * Map to store typing status
 * Key: roomId (combination of two userIds), Value: userId who is typing
 */
const typingUsers = new Map();

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} - Socket.io server instance
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  /**
   * Middleware to authenticate socket connections
   */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  /**
   * Handle socket connections
   */
  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`);

    // Add user to online users map
    onlineUsers.set(socket.userId, socket.id);

    // Update user status to online in database
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Broadcast to all clients that this user is online
    io.emit('userStatusChange', {
      userId: socket.userId,
      isOnline: true
    });

    // Send list of online users to the newly connected user
    const onlineUsersList = Array.from(onlineUsers.keys());
    socket.emit('onlineUsers', onlineUsersList);

    /**
     * Handle sending messages (DM)
     */
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, messageText } = data;

        // Create message in database
        const message = await Message.create({
          senderId: socket.userId,
          receiverId,
          messageText,
          messageType: 'dm'
        });

        // Populate sender and receiver details
        await message.populate('senderId', 'username profilePicture');
        await message.populate('receiverId', 'username profilePicture');

        // Get receiver's socket ID
        const receiverSocketId = onlineUsers.get(receiverId);

        // If receiver is online, send message in real-time
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        // Send confirmation to sender
        socket.emit('messageSent', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('messageError', {
          message: 'Failed to send message',
          error: error.message
        });
      }
    });

    /**
     * Handle sending channel messages
     */
    socket.on('sendChannelMessage', async (data) => {
      try {
        const { channelId, groupId, messageText, mentions, mentionEveryone, replyTo } = data;

        // Create message in database
        const message = await Message.create({
          senderId: socket.userId,
          channelId,
          groupId,
          messageType: 'channel',
          messageText,
          mentions: mentions || [],
          mentionEveryone: mentionEveryone || false,
          replyTo: replyTo || null
        });

        // Populate message
        await message.populate('senderId', 'username profilePicture');
        await message.populate('mentions', 'username');
        if (replyTo) {
          await message.populate('replyTo', 'messageText senderId');
        }

        // Broadcast to all users in the channel
        io.to(`channel:${channelId}`).emit('receiveChannelMessage', {
          channelId,
          message
        });

        // Send confirmation to sender
        socket.emit('channelMessageSent', message);
      } catch (error) {
        console.error('Send channel message error:', error);
        socket.emit('messageError', {
          message: 'Failed to send channel message',
          error: error.message
        });
      }
    });

    /**
     * Handle typing indicator (DM)
     */
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping
        });
      }
    });

    /**
     * Handle typing indicator (Channel)
     */
    socket.on('channelTyping', (data) => {
      const { channelId, isTyping } = data;

      // Broadcast to all users in the channel except sender
      socket.to(`channel:${channelId}`).emit('channelUserTyping', {
        channelId,
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    });

    /**
     * Handle message read receipts
     */
    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;

        // Mark messages as read
        await Message.markAsRead(senderId, socket.userId);

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', {
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    /**
     * Handle message reactions
     */
    socket.on('addReaction', async (data) => {
      try {
        const { messageId, emoji, receiverId } = data;

        // Find and update message
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('reactionError', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted
        const existingReaction = message.reactions.find(
          (r) => r.userId.toString() === socket.userId
        );

        if (existingReaction) {
          existingReaction.emoji = emoji;
        } else {
          message.reactions.push({
            userId: socket.userId,
            emoji
          });
        }

        await message.save();
        await message.populate('reactions.userId', 'username profilePicture');

        // Notify both users about the reaction
        const receiverSocketId = onlineUsers.get(receiverId);
        const reactionData = {
          messageId,
          userId: socket.userId,
          emoji,
          reactions: message.reactions
        };

        socket.emit('reactionAdded', reactionData);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('reactionAdded', reactionData);
        }
      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('reactionError', { message: 'Failed to add reaction' });
      }
    });

    /**
     * Handle removing message reactions
     */
    socket.on('removeReaction', async (data) => {
      try {
        const { messageId, receiverId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('reactionError', { message: 'Message not found' });
          return;
        }

        message.reactions = message.reactions.filter(
          (r) => r.userId.toString() !== socket.userId
        );

        await message.save();

        // Notify both users about the reaction removal
        const receiverSocketId = onlineUsers.get(receiverId);
        const reactionData = {
          messageId,
          userId: socket.userId,
          reactions: message.reactions
        };

        socket.emit('reactionRemoved', reactionData);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('reactionRemoved', reactionData);
        }
      } catch (error) {
        console.error('Remove reaction error:', error);
        socket.emit('reactionError', { message: 'Failed to remove reaction' });
      }
    });

    /**
     * Handle user joining a DM room
     */
    socket.on('joinRoom', (data) => {
      const { userId } = data;
      const roomId = [socket.userId, userId].sort().join('-');
      socket.join(roomId);
      console.log(`User ${socket.user.username} joined DM room: ${roomId}`);
    });

    /**
     * Handle user leaving a DM room
     */
    socket.on('leaveRoom', (data) => {
      const { userId } = data;
      const roomId = [socket.userId, userId].sort().join('-');
      socket.leave(roomId);
      console.log(`User ${socket.user.username} left DM room: ${roomId}`);
    });

    /**
     * Handle user joining a channel
     */
    socket.on('joinChannel', (data) => {
      const { channelId } = data;
      socket.join(`channel:${channelId}`);
      console.log(`User ${socket.user.username} joined channel: ${channelId}`);

      // Notify others in the channel
      socket.to(`channel:${channelId}`).emit('userJoinedChannel', {
        channelId,
        userId: socket.userId,
        username: socket.user.username
      });
    });

    /**
     * Handle user leaving a channel
     */
    socket.on('leaveChannel', (data) => {
      const { channelId } = data;
      socket.leave(`channel:${channelId}`);
      console.log(`User ${socket.user.username} left channel: ${channelId}`);

      // Notify others in the channel
      socket.to(`channel:${channelId}`).emit('userLeftChannel', {
        channelId,
        userId: socket.userId,
        username: socket.user.username
      });
    });

    /**
     * Handle user joining a group (join all channels)
     */
    socket.on('joinGroup', async (data) => {
      const { groupId } = data;

      try {
        const Group = (await import('../models/Group.js')).default;
        const Channel = (await import('../models/Channel.js')).default;

        const group = await Group.findById(groupId).populate('channels');
        if (group && group.isMember(socket.userId)) {
          // Join all accessible channels
          const userRole = group.getMemberRole(socket.userId);
          group.channels.forEach((channel) => {
            if (channel.hasAccess && channel.hasAccess(socket.userId, userRole)) {
              socket.join(`channel:${channel._id}`);
            }
          });

          console.log(`User ${socket.user.username} joined group: ${groupId}`);
        }
      } catch (error) {
        console.error('Join group error:', error);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.userId})`);

      // Remove user from online users map
      onlineUsers.delete(socket.userId);

      // Update user status to offline in database
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast to all clients that this user is offline
      io.emit('userStatusChange', {
        userId: socket.userId,
        isOnline: false
      });
    });
  });

  return io;
};

/**
 * Get online users
 * @returns {Array} - Array of online user IDs
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
