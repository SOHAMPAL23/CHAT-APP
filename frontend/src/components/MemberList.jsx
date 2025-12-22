import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Divider } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { useGroupStore } from '../store/groupStore';
import { useChatStore } from '../store/chatStore';

export default function MemberList() {
    const { selectedGroup } = useGroupStore();
    const { onlineUsers } = useChatStore();

    if (!selectedGroup) return null;

    // Group members by role
    const membersByRole = {
        owner: [],
        admin: [],
        moderator: [],
        member: [],
    };

    selectedGroup.members?.forEach((member) => {
        const role = member.role || 'member';
        membersByRole[role].push(member);
    });

    // Separate online and offline members
    const getOnlineMembers = (members) => {
        return members.filter((m) => {
            const userId = m.user?._id || m.user;
            return onlineUsers.has(userId);
        });
    };

    const getOfflineMembers = (members) => {
        return members.filter((m) => {
            const userId = m.user?._id || m.user;
            return !onlineUsers.has(userId);
        });
    };

    const renderMemberGroup = (title, members, roleColor) => {
        if (members.length === 0) return null;

        const onlineMembers = getOnlineMembers(members);
        const offlineMembers = getOfflineMembers(members);

        return (
            <Box key={title} sx={{ mb: 2 }}>
                <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ px: 2, display: 'block', mb: 1 }}
                >
                    {title} — {members.length}
                </Typography>
                <List disablePadding>
                    {/* Online Members */}
                    {onlineMembers.map((member) => {
                        const user = member.user;
                        const userId = user?._id || user;
                        const username = user?.username || 'Unknown';
                        const profilePicture = user?.profilePicture;

                        return (
                            <ListItem
                                key={userId}
                                sx={{
                                    px: 2,
                                    py: 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'background.hover',
                                    },
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar
                                            src={profilePicture}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: roleColor,
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <CircleIcon
                                            sx={{
                                                position: 'absolute',
                                                bottom: -2,
                                                right: -2,
                                                fontSize: 14,
                                                color: 'success.main',
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    </Box>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={member.nickname || username}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: 500,
                                    }}
                                />
                            </ListItem>
                        );
                    })}

                    {/* Offline Members */}
                    {offlineMembers.map((member) => {
                        const user = member.user;
                        const userId = user?._id || user;
                        const username = user?.username || 'Unknown';
                        const profilePicture = user?.profilePicture;

                        return (
                            <ListItem
                                key={userId}
                                sx={{
                                    px: 2,
                                    py: 0.5,
                                    cursor: 'pointer',
                                    opacity: 0.5,
                                    '&:hover': {
                                        bgcolor: 'background.hover',
                                        opacity: 0.7,
                                    },
                                }}
                            >
                                <ListItemAvatar sx={{ minWidth: 40 }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar
                                            src={profilePicture}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: 'text.disabled',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <CircleIcon
                                            sx={{
                                                position: 'absolute',
                                                bottom: -2,
                                                right: -2,
                                                fontSize: 14,
                                                color: 'text.disabled',
                                                bgcolor: 'background.paper',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    </Box>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={member.nickname || username}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: 500,
                                    }}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                height: '100%',
                overflowY: 'auto',
                py: 2,
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                },
            }}
        >
            <Typography variant="h6" fontWeight={700} sx={{ px: 2, mb: 2 }}>
                Members
            </Typography>

            {renderMemberGroup('OWNER', membersByRole.owner, 'error.main')}
            {renderMemberGroup('ADMINS', membersByRole.admin, 'warning.main')}
            {renderMemberGroup('MODERATORS', membersByRole.moderator, 'info.main')}
            {renderMemberGroup('MEMBERS', membersByRole.member, 'primary.main')}
        </Box>
    );
}
