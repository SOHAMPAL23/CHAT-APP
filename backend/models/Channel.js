import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Channel name is required'],
            trim: true,
            minlength: [1, 'Channel name must be at least 1 character'],
            maxlength: [50, 'Channel name cannot exceed 50 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        type: {
            type: String,
            enum: ['text', 'voice', 'announcement'],
            default: 'text'
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true
        },
        category: {
            type: String,
            default: null
        },
        position: {
            type: Number,
            default: 0
        },
        topic: {
            type: String,
            trim: true,
            maxlength: [500, 'Topic cannot exceed 500 characters']
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        allowedRoles: [
            {
                type: String,
                enum: ['owner', 'admin', 'moderator', 'member']
            }
        ],
        allowedMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        settings: {
            slowMode: {
                type: Number,
                default: 0, // seconds between messages
                min: 0,
                max: 21600 // 6 hours
            },
            nsfw: {
                type: Boolean,
                default: false
            },
            allowReactions: {
                type: Boolean,
                default: true
            },
            allowThreads: {
                type: Boolean,
                default: true
            }
        },
        pinnedMessages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message'
            }
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        lastMessageAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Check if user has access to channel
channelSchema.methods.hasAccess = function (userId, userRole) {
    // If channel is not private, all members have access
    if (!this.isPrivate) {
        return true;
    }

    // Check if user is in allowed members
    if (this.allowedMembers.some((memberId) => memberId.toString() === userId.toString())) {
        return true;
    }

    // Check if user's role is in allowed roles
    if (this.allowedRoles.includes(userRole)) {
        return true;
    }

    return false;
};

// Pin a message
channelSchema.methods.pinMessage = function (messageId) {
    if (!this.pinnedMessages.includes(messageId)) {
        this.pinnedMessages.push(messageId);
    }
};

// Unpin a message
channelSchema.methods.unpinMessage = function (messageId) {
    this.pinnedMessages = this.pinnedMessages.filter(
        (id) => id.toString() !== messageId.toString()
    );
};

// Update last message
channelSchema.methods.updateLastMessage = function (messageId) {
    this.lastMessage = messageId;
    this.lastMessageAt = new Date();
};

// Indexes for better query performance
channelSchema.index({ group: 1, position: 1 });
channelSchema.index({ group: 1, type: 1 });
channelSchema.index({ name: 'text', description: 'text' });

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;
