import { useState } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Collapse,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Divider,
} from '@mui/material';
import {
    Tag as TagIcon,
    VolumeUp as VoiceIcon,
    Campaign as AnnouncementIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
    PersonAdd as InviteIcon,
    ExitToApp as LeaveIcon,
    Lock as LockIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import ThemeSelector from './ThemeSelector';

export default function ChannelList({ onClose }) {
    const { user } = useAuthStore();
    const {
        selectedGroup,
        channels,
        selectedChannel,
        setSelectedChannel,
        createChannel,
        leaveGroup,
        generateInviteCode,
    } = useGroupStore();

    const [expandedCategories, setExpandedCategories] = useState({ 'TEXT CHANNELS': true });
    const [anchorEl, setAnchorEl] = useState(null);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [themeDialogOpen, setThemeDialogOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [channelType, setChannelType] = useState('text');
    const [inviteCode, setInviteCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    if (!selectedGroup) return null;

    const isOwner = selectedGroup.owner === user?._id || selectedGroup.owner?._id === user?._id;
    const userMember = selectedGroup.members?.find(
        (m) => (m.user?._id || m.user) === user?._id
    );
    const userRole = userMember?.role || 'member';
    const canManage = ['owner', 'admin'].includes(userRole);

    // Group channels by category
    const channelsByCategory = channels.reduce((acc, channel) => {
        const category = channel.category || 'UNCATEGORIZED';
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
        return acc;
    }, {});

    const toggleCategory = (category) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    const handleChannelClick = (channel) => {
        setSelectedChannel(channel);
        if (onClose) onClose();
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCreateChannel = async () => {
        if (!channelName.trim()) return;

        setIsCreating(true);
        const result = await createChannel(selectedGroup._id, {
            name: channelName.toLowerCase().replace(/\s+/g, '-'),
            type: channelType,
            category: 'TEXT CHANNELS',
        });

        if (result.success) {
            setCreateChannelOpen(false);
            setChannelName('');
            setChannelType('text');
        }
        setIsCreating(false);
    };

    const handleGenerateInvite = async () => {
        const result = await generateInviteCode(selectedGroup._id);
        if (result.success) {
            setInviteCode(result.inviteCode);
            setInviteDialogOpen(true);
        }
        handleMenuClose();
    };

    const handleLeaveServer = async () => {
        if (confirm('Are you sure you want to leave this server?')) {
            await leaveGroup(selectedGroup._id);
            handleMenuClose();
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(inviteCode);
    };

    const getChannelIcon = (type) => {
        switch (type) {
            case 'voice':
                return <VoiceIcon fontSize="small" />;
            case 'announcement':
                return <AnnouncementIcon fontSize="small" />;
            default:
                return <TagIcon fontSize="small" />;
        }
    };

    return (
        <>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Server Header */}
                <Box
                    sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: 'background.hover',
                        },
                    }}
                    onClick={handleMenuOpen}
                >
                    <Typography variant="h6" fontWeight={700} noWrap>
                        {selectedGroup.name}
                    </Typography>
                    <ExpandMoreIcon />
                </Box>

                {/* Channels List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1 }}>
                    {Object.entries(channelsByCategory).map(([category, categoryChannels]) => (
                        <Box key={category}>
                            {/* Category Header */}
                            <ListItemButton
                                onClick={() => toggleCategory(category)}
                                sx={{ px: 2, py: 0.5 }}
                            >
                                <ListItemIcon sx={{ minWidth: 24, mr: 1 }}>
                                    {expandedCategories[category] ? (
                                        <ExpandMoreIcon fontSize="small" />
                                    ) : (
                                        <ExpandLessIcon fontSize="small" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={category}
                                    primaryTypographyProps={{
                                        variant: 'caption',
                                        fontWeight: 700,
                                        color: 'text.secondary',
                                    }}
                                />
                                {canManage && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCreateChannelOpen(true);
                                        }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </ListItemButton>

                            {/* Channels in Category */}
                            <Collapse in={expandedCategories[category]} timeout="auto">
                                <List disablePadding>
                                    {categoryChannels.map((channel) => (
                                        <ListItem key={channel._id} disablePadding>
                                            <ListItemButton
                                                selected={selectedChannel?._id === channel._id}
                                                onClick={() => handleChannelClick(channel)}
                                                sx={{
                                                    pl: 4,
                                                    py: 0.75,
                                                    '&.Mui-selected': {
                                                        bgcolor: 'action.selected',
                                                        '&:hover': {
                                                            bgcolor: 'action.selected',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                                                    {getChannelIcon(channel.type)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={channel.name}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        fontWeight: selectedChannel?._id === channel._id ? 600 : 400,
                                                    }}
                                                />
                                                {channel.isPrivate && (
                                                    <LockIcon fontSize="small" sx={{ color: 'text.disabled', ml: 1 }} />
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    ))}
                </Box>

                {/* User Info at Bottom */}
                <Box
                    sx={{
                        p: 1,
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.elevated',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.contrastText',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {user?.username}
                        </Typography>
                        <Chip label={userRole} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
                    </Box>
                    <IconButton size="small" onClick={() => setThemeDialogOpen(true)} title="Change Theme">
                        <PaletteIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* Theme Selector Dialog */}
            <ThemeSelector open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} />

            {/* Server Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {canManage && (
                    <MenuItem onClick={handleGenerateInvite}>
                        <ListItemIcon>
                            <InviteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Invite People</ListItemText>
                    </MenuItem>
                )}
                {canManage && (
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Server Settings</ListItemText>
                    </MenuItem>
                )}
                {canManage && <Divider />}
                {!isOwner && (
                    <MenuItem onClick={handleLeaveServer} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <LeaveIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Leave Server</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {/* Create Channel Dialog */}
            <Dialog
                open={createChannelOpen}
                onClose={() => !isCreating && setCreateChannelOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create Channel</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Channel Type</InputLabel>
                        <Select
                            value={channelType}
                            label="Channel Type"
                            onChange={(e) => setChannelType(e.target.value)}
                            disabled={isCreating}
                        >
                            <MenuItem value="text">Text Channel</MenuItem>
                            <MenuItem value="voice">Voice Channel</MenuItem>
                            <MenuItem value="announcement">Announcement Channel</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Channel Name"
                        fullWidth
                        variant="outlined"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        disabled={isCreating}
                        placeholder="new-channel"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateChannelOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateChannel}
                        variant="contained"
                        disabled={!channelName.trim() || isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Channel'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Invite Friends to {selectedGroup.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Share this invite code with your friends:
                    </Typography>
                    <TextField
                        fullWidth
                        value={inviteCode}
                        InputProps={{
                            readOnly: true,
                        }}
                        onClick={copyInviteCode}
                        sx={{ cursor: 'pointer' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Click to copy
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteDialogOpen(false)}>Close</Button>
                    <Button onClick={copyInviteCode} variant="contained">
                        Copy Code
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
