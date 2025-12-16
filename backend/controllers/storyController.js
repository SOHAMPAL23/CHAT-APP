import Story from '../models/Story.js';
import User from '../models/User.js';

export const createStory = async (req, res) => {
    try {
        const { mediaUrl, mediaType } = req.body;

        if (!mediaUrl || !mediaType) {
            return res.status(400).json({ success: false, message: 'Please provide mediaUrl and mediaType' });
        }

        const story = await Story.create({
            userId: req.user._id,
            mediaUrl,
            mediaType,
        });

        // Populate user details for the response
        await story.populate('userId', 'username profilePicture');

        res.status(201).json({
            success: true,
            data: story,
        });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getStories = async (req, res) => {
    try {
        // Get stories that haven't expired
        const stories = await Story.find({ expiresAt: { $gt: new Date() } })
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: stories.length,
            data: stories,
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
