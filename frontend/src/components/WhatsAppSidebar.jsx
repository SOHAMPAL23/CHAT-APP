import { useState, useEffect, useCallback } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    Slide,
    CircularProgress,
    Divider,
    Fab,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Chat as ChatIcon,
    Search as SearchIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Close as CloseIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Transition for dialog
const Transition = (props) => <Slide direction="up" {...props} />;

export default function WhatsAppSidebar({ onChatSelect }) {
    const { user, logout } = useAuthStore();
    const { conversations, selectedUser, setSelectedUser, onlineUsers, searchUsers } = useChatStore();
    const { groups, selectedGroup, setSelectedGroup, setSelectedChannel } = useGroupStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTab, setActiveTab] = useState('chats');
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatSearch, setNewChatSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search for new chat
    const searchForUsers = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchUsers(query);
            setSearchResults(results || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchUsers]);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (newChatSearch) {
                searchForUsers(newChatSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [newChatSearch, searchForUsers]);

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

    const handleNewChatUserSelect = (selectedUserFromSearch) => {
        setSelectedUser(selectedUserFromSearch);
        setSelectedGroup(null);
        setSelectedChannel(null);
        setNewChatOpen(false);
        setNewChatSearch('');
        setSearchResults([]);
        if (onChatSelect) onChatSelect();
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        if (group.channels && group.channels.length > 0) {
            setSelectedChannel(group.channels[0]);
        }
        if (onChatSelect) onChatSelect();
    };

    const formatMessageTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return 'Yesterday';
        }
        return format(date, 'MMM d');
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        src={user?.profilePicture}
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#00a884',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' }
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#e9edef', fontWeight: 600, fontSize: '1.1rem' }}>
                        Chats
                    </Typography>
                </Box>
                <Box>
                    <IconButton
                        sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}
                        onClick={() => setNewChatOpen(true)}
                    >
                        <ChatIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }} onClick={handleMenuOpen}>
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
                        transition: 'all 0.2s',
                        '&:focus-within': {
                            bgcolor: '#2a3942',
                        }
                    }}
                >
                    <SearchIcon sx={{ color: '#aebac1', mr: 1, fontSize: 20 }} />
                    <InputBase
                        placeholder="Search or start new chat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            flexGrow: 1,
                            color: '#e9edef',
                            fontSize: '0.95rem',
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
                        transition: 'all 0.2s',
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
                        transition: 'all 0.2s',
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
                    <AnimatePresence>
                        {activeTab === 'chats' ? (
                            filteredConversations.length > 0 ? (
                                filteredConversations.map((conversation, index) => {
                                    const isSelected = selectedUser?._id === conversation.user?._id;
                                    const isOnline = onlineUsers.has(conversation.user?._id);
                                    return (
                                        <motion.div
                                            key={conversation.user._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleChatSelect(conversation)}
                                                    sx={{
                                                        bgcolor: isSelected ? '#2a3942' : 'transparent',
                                                        py: 1.5,
                                                        '&:hover': {
                                                            bgcolor: '#202c33',
                                                        },
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Badge
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            badgeContent={
                                                                isOnline && (
                                                                    <Box
                                                                        sx={{
                                                                            width: 12,
                                                                            height: 12,
                                                                            borderRadius: '50%',
                                                                            bgcolor: '#00a884',
                                                                            border: '2px solid #111b21',
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                        >
                                                            <Avatar
                                                                src={conversation.user.profilePicture}
                                                                sx={{
                                                                    bgcolor: '#00a884',
                                                                    width: 50,
                                                                    height: 50,
                                                                }}
                                                            >
                                                                {conversation.user.username?.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        </Badge>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        sx={{ ml: 1 }}
                                                        primary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                                                                    {conversation.user.username}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#8696a0' }}>
                                                                    {formatMessageTime(conversation.lastMessage?.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#8696a0',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: '250px',
                                                                }}
                                                            >
                                                                {conversation.lastMessage?.messageText || 'Start a conversation'}
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
                                                                    fontWeight: 600,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <ChatIcon sx={{ fontSize: 60, color: '#2a3942', mb: 2 }} />
                                        <Typography sx={{ color: '#8696a0' }}>No chats yet</Typography>
                                        <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                                            Tap the chat icon to start a conversation
                                        </Typography>
                                    </motion.div>
                                </Box>
                            )
                        ) : (
                            filteredGroups.length > 0 ? (
                                filteredGroups.map((group, index) => {
                                    const isSelected = selectedGroup?._id === group._id;
                                    return (
                                        <motion.div
                                            key={group._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => handleGroupSelect(group)}
                                                    sx={{
                                                        bgcolor: isSelected ? '#2a3942' : 'transparent',
                                                        py: 1.5,
                                                        '&:hover': {
                                                            bgcolor: '#202c33',
                                                        },
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={group.icon}
                                                            sx={{
                                                                bgcolor: '#00a884',
                                                                width: 50,
                                                                height: 50,
                                                            }}
                                                        >
                                                            {group.name?.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        sx={{ ml: 1 }}
                                                        primary={
                                                            <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                                                                {group.name}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" sx={{ color: '#8696a0' }}>
                                                                {group.members?.length || 0} members
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <GroupIcon sx={{ fontSize: 60, color: '#2a3942', mb: 2 }} />
                                        <Typography sx={{ color: '#8696a0' }}>No groups yet</Typography>
                                        <Typography variant="body2" sx={{ color: '#8696a0', mt: 1 }}>
                                            Create or join a group to get started
                                        </Typography>
                                    </motion.div>
                                </Box>
                            )
                        )}
                    </AnimatePresence>
                </List>
            </Box>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                onClick={() => setNewChatOpen(true)}
                sx={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    bgcolor: '#00a884',
                    '&:hover': { bgcolor: '#06cf9c' },
                }}
            >
                <AddIcon />
            </Fab>

            {/* New Chat Dialog */}
            <Dialog
                open={newChatOpen}
                onClose={() => {
                    setNewChatOpen(false);
                    setNewChatSearch('');
                    setSearchResults([]);
                }}
                fullWidth
                maxWidth="sm"
                TransitionComponent={Transition}
                PaperProps={{
                    sx: {
                        bgcolor: '#111b21',
                        borderRadius: 3,
                        maxHeight: '80vh',
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: '#202c33',
                    color: '#e9edef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        New Chat
                    </Typography>
                    <IconButton onClick={() => setNewChatOpen(false)} sx={{ color: '#aebac1' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {/* Search Input */}
                    <Box sx={{ p: 2, bgcolor: '#111b21' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: '#202c33',
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                            }}
                        >
                            <SearchIcon sx={{ color: '#aebac1', mr: 1 }} />
                            <InputBase
                                autoFocus
                                placeholder="Search by username or email..."
                                value={newChatSearch}
                                onChange={(e) => setNewChatSearch(e.target.value)}
                                sx={{
                                    flexGrow: 1,
                                    color: '#e9edef',
                                    '& ::placeholder': {
                                        color: '#aebac1',
                                        opacity: 1,
                                    },
                                }}
                            />
                            {isSearching && <CircularProgress size={20} sx={{ color: '#00a884' }} />}
                        </Box>
                    </Box>

                    <Divider sx={{ bgcolor: '#2a3942' }} />

                    {/* Search Results */}
                    <List sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {searchResults.length > 0 ? (
                            searchResults.map((result, index) => (
                                <motion.div
                                    key={result._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            onClick={() => handleNewChatUserSelect(result)}
                                            sx={{
                                                py: 1.5,
                                                '&:hover': { bgcolor: '#202c33' },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={result.profilePicture}
                                                    sx={{
                                                        bgcolor: '#00a884',
                                                        width: 50,
                                                        height: 50,
                                                    }}
                                                >
                                                    {result.username?.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                sx={{ ml: 1 }}
                                                primary={
                                                    <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                                                        {result.username}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                                                        {result.email}
                                                    </Typography>
                                                }
                                            />
                                            {result.isOnline && (
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        bgcolor: '#00a884',
                                                    }}
                                                />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                </motion.div>
                            ))
                        ) : newChatSearch && !isSearching ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography sx={{ color: '#8696a0' }}>
                                    No users found for "{newChatSearch}"
                                </Typography>
                            </Box>
                        ) : !newChatSearch ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <SearchIcon sx={{ fontSize: 60, color: '#2a3942', mb: 2 }} />
                                <Typography sx={{ color: '#8696a0' }}>
                                    Search for users to start a conversation
                                </Typography>
                            </Box>
                        ) : null}
                    </List>
                </DialogContent>
            </Dialog>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        bgcolor: '#233138',
                        color: '#e9edef',
                        borderRadius: 2,
                        minWidth: 180,
                    }
                }}
            >
                <MenuItem
                    onClick={handleMenuClose}
                    sx={{ '&:hover': { bgcolor: '#2a3942' } }}
                >
                    New Group
                </MenuItem>
                <MenuItem
                    onClick={handleMenuClose}
                    sx={{ '&:hover': { bgcolor: '#2a3942' } }}
                >
                    Settings
                </MenuItem>
                <Divider sx={{ bgcolor: '#2a3942' }} />
                <MenuItem
                    onClick={() => {
                        logout();
                        handleMenuClose();
                    }}
                    sx={{
                        color: '#f15c6d',
                        '&:hover': { bgcolor: '#2a3942' }
                    }}
                >
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}
