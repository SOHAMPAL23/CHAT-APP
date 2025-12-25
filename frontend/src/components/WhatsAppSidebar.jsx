import { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    IconButton,
    InputBase,
    Badge,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Chat as ChatIcon,
    Search as SearchIcon,
    Group as GroupIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export default function WhatsAppSidebar({ onChatSelect }) {
    const { user, logout } = useAuthStore();
    const { conversations, selectedUser, setSelectedUser } = useChatStore();
    const { groups, selectedGroup, setSelectedGroup, setSelectedChannel } = useGroupStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleChatSelect = (conversation) => {
        setSelectedUser(conversation.user);
        setSelectedGroup(null);
        setSelectedChannel(null);
        if (onChatSelect) onChatSelect();
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        // Auto-select first channel
        if (group.channels && group.channels.length > 0) {
            setSelectedChannel(group.channels[0]);
        }
        if (onChatSelect) onChatSelect();
    };

    const filteredConversations = conversations.filter((conv) =>
        conv.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter((group) =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111b21' }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    bgcolor: '#202c33',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="h6" sx={{ color: '#e9edef', fontWeight: 600 }}>
                    WhatsApp
                </Typography>
                <Box>
                    <IconButton sx={{ color: '#aebac1' }}>
                        <ChatIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1' }} onClick={handleMenuOpen}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Search */}
            <Box sx={{ p: 1.5, bgcolor: '#111b21' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#202c33',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                    }}
                >
                    <SearchIcon sx={{ color: '#aebac1', mr: 1 }} />
                    <InputBase
                        placeholder="Search or start new chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            flexGrow: 1,
                            color: '#e9edef',
                            '& ::placeholder': {
                                color: '#aebac1',
                                opacity: 1,
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #2a3942' }}>
                <Box
                    onClick={() => setActiveTab('chats')}
                    sx={{
                        flex: 1,
                        py: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'chats' ? '3px solid #00a884' : 'none',
                        color: activeTab === 'chats' ? '#00a884' : '#aebac1',
                        '&:hover': {
                            bgcolor: '#202c33',
                        },
                    }}
                >
                    <PersonIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'middle' }} />
                    <Typography variant="body2" component="span" fontWeight={600}>
                        Chats
                    </Typography>
                </Box>
                <Box
                    onClick={() => setActiveTab('groups')}
                    sx={{
                        flex: 1,
                        py: 1.5,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'groups' ? '3px solid #00a884' : 'none',
                        color: activeTab === 'groups' ? '#00a884' : '#aebac1',
                        '&:hover': {
                            bgcolor: '#202c33',
                        },
                    }}
                >
                    <GroupIcon sx={{ fontSize: 20, mr: 0.5, verticalAlign: 'middle' }} />
                    <Typography variant="body2" component="span" fontWeight={600}>
                        Groups
                    </Typography>
                </Box>
            </Box>

            {/* Chat/Group List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List disablePadding>
                    {activeTab === 'chats' ? (
                        // Direct Messages
                        filteredConversations.length > 0 ? (
                            filteredConversations.map((conversation) => {
                                const isSelected = selectedUser?._id === conversation.user?._id;
                                return (
                                    <ListItem key={conversation.user._id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleChatSelect(conversation)}
                                            sx={{
                                                bgcolor: isSelected ? '#2a3942' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: '#202c33',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={conversation.user.profilePicture} sx={{ bgcolor: '#00a884' }}>
                                                    {conversation.user.username?.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                                                        {conversation.user.username}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" sx={{ color: '#8696a0' }} noWrap>
                                                        {conversation.lastMessage?.messageText || 'No messages yet'}
                                                    </Typography>
                                                }
                                            />
                                            {conversation.unreadCount > 0 && (
                                                <Badge
                                                    badgeContent={conversation.unreadCount}
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            bgcolor: '#00a884',
                                                            color: '#111b21',
                                                        },
                                                    }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ color: '#8696a0' }}>No chats yet</Typography>
                            </Box>
                        )
                    ) : (
                        // Groups
                        filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => {
                                const isSelected = selectedGroup?._id === group._id;
                                return (
                                    <ListItem key={group._id} disablePadding>
                                        <ListItemButton
                                            onClick={() => handleGroupSelect(group)}
                                            sx={{
                                                bgcolor: isSelected ? '#2a3942' : 'transparent',
                                                '&:hover': {
                                                    bgcolor: '#202c33',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={group.icon} sx={{ bgcolor: '#00a884' }}>
                                                    {group.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                                                        {group.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" sx={{ color: '#8696a0' }} noWrap>
                                                        {group.members?.length || 0} members
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ color: '#8696a0' }}>No groups yet</Typography>
                                <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                                    Create or join a group to get started
                                </Typography>
                            </Box>
                        )
                    )}
                </List>
            </Box>

            {/* Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>New Group</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem
                    onClick={() => {
                        logout();
                        handleMenuClose();
                    }}
                >
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}
