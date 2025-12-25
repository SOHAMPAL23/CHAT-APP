import { useEffect, useState } from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import socketService from '../lib/socket';
import ServerList from '../components/ServerList';
import ChannelList from '../components/ChannelList';
import ChatArea from '../components/ChatArea';
import MemberList from '../components/MemberList';

const SERVERLIST_WIDTH = 72;
const CHANNELLIST_WIDTH = 240;
const MEMBERLIST_WIDTH = 240;

export default function DiscordHomePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuthStore();
    const { initializeSocketListeners, getConversations } = useChatStore();
    const { getGroups, selectedGroup, selectedChannel } = useGroupStore();
    const [mobileOpen, setMobileOpen] = useState(false);

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

    // Join group channels when group is selected
    useEffect(() => {
        if (selectedGroup) {
            socketService.joinGroup(selectedGroup._id);
        }
    }, [selectedGroup]);

    // Join channel when selected
    useEffect(() => {
        if (selectedChannel) {
            socketService.joinChannel(selectedChannel._id);
        }
    }, [selectedChannel]);

    if (!user) {
        return null;
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                height: '100vh',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            {/* Server List - Left sidebar with server icons */}
            <Box
                sx={{
                    width: SERVERLIST_WIDTH,
                    flexShrink: 0,
                    bgcolor: 'background.elevated',
                    borderRight: 1,
                    borderColor: 'divider',
                    display: { xs: 'none', sm: 'block' },
                }}
            >
                <ServerList />
            </Box>

            {/* Channel List - Second sidebar with channels */}
            {selectedGroup && (
                <>
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true, // Better mobile performance
                            }}
                            sx={{
                                '& .MuiDrawer-paper': {
                                    width: CHANNELLIST_WIDTH,
                                    bgcolor: 'background.paper',
                                    borderRight: 1,
                                    borderColor: 'divider',
                                },
                            }}
                        >
                            <ChannelList onClose={handleDrawerToggle} />
                        </Drawer>
                    ) : (
                        <Box
                            sx={{
                                width: CHANNELLIST_WIDTH,
                                flexShrink: 0,
                                bgcolor: 'background.paper',
                                borderRight: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <ChannelList />
                        </Box>
                    )}
                </>
            )}

            {/* Main Chat Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <ChatArea onMenuClick={handleDrawerToggle} />
            </Box>

            {/* Member List - Right sidebar */}
            {selectedChannel && !isMobile && (
                <Box
                    sx={{
                        width: MEMBERLIST_WIDTH,
                        flexShrink: 0,
                        bgcolor: 'background.paper',
                        borderLeft: 1,
                        borderColor: 'divider',
                        display: { xs: 'none', lg: 'block' },
                    }}
                >
                    <MemberList />
                </Box>
            )}
        </Box>
    );
}
