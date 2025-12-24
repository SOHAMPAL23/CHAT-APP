import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import socketService from '../lib/socket';
import WhatsAppSidebar from '../components/WhatsAppSidebar';
import WhatsAppChatArea from '../components/WhatsAppChatArea';

export default function WhatsAppHomePage() {
    const { user } = useAuthStore();
    const { initializeSocketListeners, getConversations } = useChatStore();
    const { getGroups } = useGroupStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Connect socket
        socketService.connect(user._id);

        // Initialize socket listeners
        initializeSocketListeners();

        // Fetch initial data
        getConversations();
        getGroups();

        // Cleanup
        return () => {
            socketService.disconnect();
        };
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                bgcolor: '#111b21',
                overflow: 'hidden',
            }}
        >
            {/* WhatsApp Sidebar */}
            <Box
                sx={{
                    width: { xs: '100%', md: 420 },
                    display: { xs: sidebarOpen ? 'block' : 'none', md: 'block' },
                    borderRight: '1px solid #2a3942',
                    bgcolor: '#111b21',
                }}
            >
                <WhatsAppSidebar onChatSelect={() => setSidebarOpen(false)} />
            </Box>

            {/* WhatsApp Chat Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: { xs: sidebarOpen ? 'none' : 'flex', md: 'flex' },
                    flexDirection: 'column',
                }}
            >
                <WhatsAppChatArea onBack={() => setSidebarOpen(true)} />
            </Box>
        </Box>
    );
}
