import { Box, Typography, IconButton, Avatar, Chip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
    Tag as TagIcon,
    VolumeUp as VoiceIcon,
    Campaign as AnnouncementIcon,
    MoreVert as MoreVertIcon,
    PushPin as PinIcon,
    People as PeopleIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageInput from './ChannelMessageInput';

export default function ChatArea({ onMenuClick }) {
    const { user } = useAuthStore();
    const { selectedUser, onlineUsers } = useChatStore();
    const { selectedGroup, selectedChannel } = useGroupStore();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Empty state - no selection
    if (!selectedUser && !selectedChannel) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    p: 4,
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    <TagIcon sx={{ fontSize: 40, color: 'primary.contrastText' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Welcome to Chat App
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={400}>
                    {selectedGroup
                        ? 'Select a channel to start chatting with your community'
                        : 'Select a server or start a direct message to begin'}
                </Typography>
            </Box>
        );
    }

    // Channel view
    if (selectedChannel) {
        const getChannelIcon = () => {
            switch (selectedChannel.type) {
                case 'voice':
                    return <VoiceIcon />;
                case 'announcement':
                    return <AnnouncementIcon />;
                default:
                    return <TagIcon />;
            }
        };

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Channel Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    {onMenuClick && (
                        <IconButton
                            onClick={onMenuClick}
                            sx={{ display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <Box sx={{ color: 'text.secondary' }}>{getChannelIcon()}</Box>
                        <Typography variant="h6" fontWeight={700}>
                            {selectedChannel.name}
                        </Typography>
                        {selectedChannel.type === 'announcement' && (
                            <Chip label="Announcements" size="small" color="warning" />
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                            <NotificationsIcon />
                        </IconButton>
                        <IconButton size="small">
                            <PinIcon />
                        </IconButton>
                        <IconButton size="small">
                            <PeopleIcon />
                        </IconButton>
                        <IconButton size="small">
                            <SearchIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Channel Description */}
                {selectedChannel.description && (
                    <Box sx={{ px: 2, py: 1, bgcolor: 'background.elevated', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                            {selectedChannel.description}
                        </Typography>
                    </Box>
                )}

                {/* Channel Messages */}
                <ChannelMessageList />

                {/* Channel Message Input */}
                <ChannelMessageInput />

                {/* Channel Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <NotificationsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Notification Settings</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <PinIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Pinned Messages</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        );
    }

    // DM view
    const isOnline = onlineUsers.has(selectedUser._id);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* DM Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'background.paper',
                }}
            >
                {onMenuClick && (
                    <IconButton
                        onClick={onMenuClick}
                        sx={{ display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Box sx={{ position: 'relative' }}>
                    <Avatar
                        src={selectedUser.profilePicture}
                        sx={{ width: 40, height: 40 }}
                    >
                        {selectedUser.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    {isOnline && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                border: 2,
                                borderColor: 'background.paper',
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {selectedUser.username}
                    </Typography>
                    <Typography variant="caption" color={isOnline ? 'success.main' : 'text.secondary'}>
                        {isOnline ? 'Online' : 'Offline'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                        <SearchIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* DM Messages */}
            <MessageList />

            {/* DM Message Input */}
            <MessageInput />

            {/* DM Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemText>View Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <ListItemText>Mute Conversation</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}
