import { create } from 'zustand';
import axiosInstance from '../lib/axios';

export const useStoryStore = create((set, get) => ({
    stories: [],
    isLoading: false,
    isCreating: false,

    // Get all stories
    getStories: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get('/stories');
            set({ stories: response.data.stories, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch stories:', error);
            set({ isLoading: false });
        }
    },

    // Create story
    createStory: async (storyData) => {
        set({ isCreating: true });
        try {
            const response = await axiosInstance.post('/stories', storyData);
            set((state) => ({
                stories: [response.data.story, ...state.stories],
                isCreating: false,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to create story:', error);
            set({ isCreating: false });
            return { success: false };
        }
    },

    // View story (add viewer)
    viewStory: async (storyId) => {
        try {
            await axiosInstance.post(`/stories/${storyId}/view`);

            // Update story in state
            set((state) => ({
                stories: state.stories.map((story) =>
                    story._id === storyId
                        ? { ...story, viewed: true }
                        : story
                ),
            }));
        } catch (error) {
            console.error('Failed to view story:', error);
        }
    },
}));
