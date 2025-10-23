import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @route   GET /api/messages/:userId
 * @desc    Get all messages between current user and specified user
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Verify that the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get conversation between current user and specified user
    const messages = await Message.getConversation(currentUserId, userId);

    // Mark messages from the other user as read
    await Message.markAsRead(userId, currentUserId);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/messages/:userId
 * @desc    Send a message to a user
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { messageText } = req.body;
    const currentUserId = req.user._id;

    // Validation
    if (!messageText || messageText.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Verify that the receiver exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create message
    const message = await Message.create({
      senderId: currentUserId,
      receiverId: userId,
      messageText: messageText.trim()
    });

    // Populate sender and receiver details
    await message.populate('senderId', 'username profilePicture');
    await message.populate('receiverId', 'username profilePicture');

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations (users with whom current user has chatted)
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all unique users with whom current user has exchanged messages
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', currentUserId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    // Get user details for each conversation
    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg._id).select('-password');
        return {
          user,
          lastMessage: msg.lastMessage
        };
      })
    );

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching conversations',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete the message
    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/messages/:messageId/react
 * @desc    Add a reaction to a message
 * @access  Private
 */
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const currentUserId = req.user._id;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      (reaction) => reaction.userId.toString() === currentUserId.toString()
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji;
    } else {
      // Add new reaction
      message.reactions.push({
        userId: currentUserId,
        emoji
      });
    }

    await message.save();
    await message.populate('reactions.userId', 'username profilePicture');

    res.status(200).json({
      success: true,
      message,
      reaction: existingReaction || message.reactions[message.reactions.length - 1]
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding reaction',
      error: error.message
    });
  }
};

/**
 * @route   DELETE /api/messages/:messageId/react
 * @desc    Remove reaction from a message
 * @access  Private
 */
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Remove user's reaction
    message.reactions = message.reactions.filter(
      (reaction) => reaction.userId.toString() !== currentUserId.toString()
    );

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully',
      reactions: message.reactions
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing reaction',
      error: error.message
    });
  }
};
