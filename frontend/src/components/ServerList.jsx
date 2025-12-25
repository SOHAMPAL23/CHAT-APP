import { useState } from 'react';
import {
    Box,
    Avatar,
    Tooltip,
    IconButton,
    Divider,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Home as HomeIcon,
    Explore as ExploreIcon,
} from '@mui/icons-material';
import { useGroupStore } from '../store/groupStore';
import { useChatStore } from '../store/chatStore';

export default function ServerList() {
    const { groups, selectedGroup, setSelectedGroup, createGroup, joinGroup } = useGroupStore();
    const { setSelectedUser } = useChatStore();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSelectHome = () => {
        setSelectedGroup(null);
        setSelectedUser(null);
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;

        setIsCreating(true);
        const result = await createGroup({
            name: groupName,
            description: groupDescription,
            isPublic: false,
        });

        if (result.success) {
            setCreateDialogOpen(false);
            setGroupName('');
            setGroupDescription('');
            setSelectedGroup(result.group);
        }
        setIsCreating(false);
    };

    const handleJoinGroup = async () => {
        if (!inviteCode.trim()) return;

        setIsCreating(true);
        const result = await joinGroup(inviteCode);

        if (result.success) {
            setJoinDialogOpen(false);
            setInviteCode('');
            setSelectedGroup(result.group);
        }
        setIsCreating(false);
    };

    return (
        <>
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 1,
                    gap: 1,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                    },
                }}
            >
                {/* Home Button */}
                <Tooltip title="Home (Direct Messages)" placement="right">
                    <IconButton
                        onClick={handleSelectHome}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: selectedGroup === null ? '30%' : '50%',
                            bgcolor: selectedGroup === null ? 'primary.main' : 'background.paper',
                            color: selectedGroup === null ? 'primary.contrastText' : 'text.primary',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderRadius: '30%',
                                bgcolor: selectedGroup === null ? 'primary.dark' : 'background.hover',
                            },
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                </Tooltip>

                <Divider sx={{ width: '32px', my: 0.5 }} />

                {/* Server List */}
                {groups.map((group) => (
                    <Tooltip key={group._id} title={group.name} placement="right">
                        <Badge
                            badgeContent={0}
                            color="error"
                            overlap="circular"
                            sx={{
                                '& .MuiBadge-badge': {
                                    right: 4,
                                    top: 4,
                                },
                            }}
                        >
                            <Avatar
                                onClick={() => handleSelectGroup(group)}
                                src={group.icon}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: selectedGroup?._id === group._id ? '30%' : '50%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    bgcolor: 'primary.main',
                                    fontWeight: 600,
                                    fontSize: '1.2rem',
                                    border: selectedGroup?._id === group._id ? 2 : 0,
                                    borderColor: 'primary.main',
                                    '&:hover': {
                                        borderRadius: '30%',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                {group.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </Badge>
                    </Tooltip>
                ))}

                {/* Add Server Button */}
                <Tooltip title="Add a Server" placement="right">
                    <IconButton
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            color: 'success.main',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderRadius: '30%',
                                bgcolor: 'success.main',
                                color: 'success.contrastText',
                            },
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                {/* Join Server Button */}
                <Tooltip title="Join a Server" placement="right">
                    <IconButton
                        onClick={() => setJoinDialogOpen(true)}
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: 'background.paper',
                            color: 'info.main',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderRadius: '30%',
                                bgcolor: 'info.main',
                                color: 'info.contrastText',
                            },
                        }}
                    >
                        <ExploreIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Create Server Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => !isCreating && setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create Your Server</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Give your server a personality with a name and description. You can always change it later.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Server Name"
                        fullWidth
                        variant="outlined"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        disabled={isCreating}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        disabled={isCreating}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateGroup}
                        variant="contained"
                        disabled={!groupName.trim() || isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Join Server Dialog */}
            <Dialog
                open={joinDialogOpen}
                onClose={() => !isCreating && setJoinDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Join a Server</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter an invite code to join an existing server.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Invite Code"
                        fullWidth
                        variant="outlined"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        disabled={isCreating}
                        placeholder="e.g., aBcD1234"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setJoinDialogOpen(false)} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoinGroup}
                        variant="contained"
                        disabled={!inviteCode.trim() || isCreating}
                    >
                        {isCreating ? 'Joining...' : 'Join Server'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
