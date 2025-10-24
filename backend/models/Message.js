import mongoose from 'mongoose';

/**
 * Message Schema
 * Stores all chat messages between users
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required']
    },
    messageText: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    fileUrl: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', null],
      default: null
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        emoji: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Index for faster queries
 * - Composite index on senderId and receiverId for efficient message retrieval
 * - Index on createdAt for sorting messages by time
 */
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

/**
 * Static method to get conversation between two users
 * @param {String} userId1 - First user ID
 * @param {String} userId2 - Second user ID
 * @returns {Array} - Array of messages between the two users
 */
messageSchema.statics.getConversation = async function (userId1, userId2) {
  return await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  })
    .sort({ createdAt: 1 }) // Sort by oldest first
    .populate('senderId', 'username profilePicture')
    .populate('receiverId', 'username profilePicture');
};

/**
 * Static method to mark messages as read
 * @param {String} senderId - Sender's user ID
 * @param {String} receiverId - Receiver's user ID
 */
messageSchema.statics.markAsRead = async function (senderId, receiverId) {
  return await this.updateMany(
    { senderId: senderId, receiverId: receiverId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
