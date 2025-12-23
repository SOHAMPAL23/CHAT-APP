import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Group name is required'],
            trim: true,
            minlength: [2, 'Group name must be at least 2 characters'],
            maxlength: [50, 'Group name cannot exceed 50 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        icon: {
            type: String,
            default: null
        },
        banner: {
            type: String,
            default: null
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                role: {
                    type: String,
                    enum: ['owner', 'admin', 'moderator', 'member'],
                    default: 'member'
                },
                joinedAt: {
                    type: Date,
                    default: Date.now
                },
                nickname: {
                    type: String,
                    trim: true
                }
            }
        ],
        channels: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Channel'
            }
        ],
        inviteCode: {
            type: String,
            unique: true,
            sparse: true
        },
        isPublic: {
            type: Boolean,
            default: false
        },
        settings: {
            defaultNotifications: {
                type: String,
                enum: ['all', 'mentions', 'none'],
                default: 'all'
            },
            allowInvites: {
                type: Boolean,
                default: true
            },
            verificationLevel: {
                type: String,
                enum: ['none', 'low', 'medium', 'high'],
                default: 'none'
            }
        },
        categories: [
            {
                name: {
                    type: String,
                    required: true
                },
                position: {
                    type: Number,
                    default: 0
                },
                channels: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Channel'
                    }
                ]
            }
        ]
    },
    {
        timestamps: true
    }
);

// Generate unique invite code
groupSchema.methods.generateInviteCode = function () {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.inviteCode = code;
    return code;
};

// Check if user is member
groupSchema.methods.isMember = function (userId) {
    return this.members.some((member) => member.user.toString() === userId.toString());
};

// Get member role
groupSchema.methods.getMemberRole = function (userId) {
    const member = this.members.find((member) => member.user.toString() === userId.toString());
    return member ? member.role : null;
};

// Check if user has permission
groupSchema.methods.hasPermission = function (userId, requiredRole) {
    const roleHierarchy = { owner: 4, admin: 3, moderator: 2, member: 1 };
    const userRole = this.getMemberRole(userId);
    if (!userRole) return false;
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Add member
groupSchema.methods.addMember = function (userId, role = 'member') {
    if (!this.isMember(userId)) {
        this.members.push({
            user: userId,
            role: role,
            joinedAt: new Date()
        });
    }
};

// Remove member
groupSchema.methods.removeMember = function (userId) {
    this.members = this.members.filter((member) => member.user.toString() !== userId.toString());
};

// Update member role
groupSchema.methods.updateMemberRole = function (userId, newRole) {
    const member = this.members.find((member) => member.user.toString() === userId.toString());
    if (member) {
        member.role = newRole;
    }
};

// Indexes for better query performance
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ owner: 1 });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ inviteCode: 1 });

const Group = mongoose.model('Group', groupSchema);

export default Group;
