import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mediaUrl: {
            type: String,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            required: true,
        },
        viewers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        expiresAt: {
            type: Date,
            default: () => Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
            index: { expires: 0 }, // TTL index to auto-delete
        },
    },
    { timestamps: true }
);

const Story = mongoose.model('Story', storySchema);

export default Story;
