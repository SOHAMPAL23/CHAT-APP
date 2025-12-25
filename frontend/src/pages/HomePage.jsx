import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useStoryStore } from '../store/storyStore';
import socketService from '../lib/socket';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function HomePage() {
    const { user } = useAuthStore();
    const { initializeSocketListeners, getConversations } = useChatStore();
    const { getStories } = useStoryStore();

    useEffect(() => {
        // Only initialize if user is logged in
        if (!user) return;

        // Connect socket with user ID
        socketService.connect(user._id);

        // Initialize socket listeners
        initializeSocketListeners();

        // Fetch initial data
        getConversations();
        getStories();

        // Cleanup: disconnect socket when component unmounts or user changes
        return () => {
            socketService.disconnect();
        };
    }, [user]);

    // Don't render anything if no user (shouldn't happen due to routing, but safety check)
    if (!user) {
        return null;
    }

    return (
        <div className="chat-layout">
            <Sidebar />
            <ChatArea />
        </div>
    );
}
