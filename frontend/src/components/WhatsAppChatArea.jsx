import { Box, Typography, Avatar, IconButton, Paper } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import MessageList from './MessageList';
import WhatsAppMessageInput from './WhatsAppMessageInput';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageInput from './ChannelMessageInput';

export default function WhatsAppChatArea({ onBack }) {
    const { selectedUser, onlineUsers } = useChatStore();
    const { selectedGroup, selectedChannel } = useGroupStore();

    // Empty state
    if (!selectedUser && !selectedChannel) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#222e35',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23222e35\'/%3E%3Cpath d=\'M20 20h60v60H20z\' fill=\'%23182229\' opacity=\'.1\'/%3E%3C/svg%3E")',
                }}
            >
                <Box
                    sx={{
                        width: 360,
                        textAlign: 'center',
                        p: 4,
                        bgcolor: 'rgba(17, 27, 33, 0.8)',
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h5" sx={{ color: '#e9edef', mb: 2, fontWeight: 600 }}>
                        WhatsApp Web
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#8696a0', mb: 3 }}>
                        Send and receive messages without keeping your phone online.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8696a0' }}>
                        Select a chat to start messaging
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Channel view
    if (selectedChannel && selectedGroup) {
        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: '#202c33',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        borderBottom: '1px solid #2a3942',
                    }}
                >
                    <IconButton onClick={onBack} sx={{ color: '#aebac1', display: { md: 'none' } }}>
                        <ArrowBackIcon />
                    </IconButton>

                    <Avatar sx={{ bgcolor: '#00a884' }}>
                        {selectedGroup.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                            {selectedGroup.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8696a0' }}>
                            #{selectedChannel.name}
                        </Typography>
                    </Box>

                    <IconButton sx={{ color: '#aebac1' }}>
                        <SearchIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1' }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                {/* Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#0b141a',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20h60v60H20z\' fill=\'%23182229\' opacity=\'.05\'/%3E%3C/svg%3E")',
                    }}
                >
                    <ChannelMessageList />
                </Box>

                {/* Input */}
                <Box sx={{ bgcolor: '#202c33', p: 1 }}>
                    <ChannelMessageInput />
                </Box>
            </Box>
        );
    }

    // DM view
    const isOnline = selectedUser && onlineUsers.has(selectedUser._id);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: '#202c33',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: '1px solid #2a3942',
                }}
            >
                <IconButton onClick={onBack} sx={{ color: '#aebac1', display: { md: 'none' } }}>
                    <ArrowBackIcon />
                </IconButton>

                <Box sx={{ position: 'relative' }}>
                    <Avatar src={selectedUser?.profilePicture} sx={{ bgcolor: '#00a884' }}>
                        {selectedUser?.username?.charAt(0).toUpperCase()}
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
                                bgcolor: '#00a884',
                                border: '2px solid #202c33',
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ color: '#e9edef', fontWeight: 500 }}>
                        {selectedUser?.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isOnline ? '#00a884' : '#8696a0' }}>
                        {isOnline ? 'online' : 'offline'}
                    </Typography>
                </Box>

                <IconButton sx={{ color: '#aebac1' }}>
                    <SearchIcon />
                </IconButton>
                <IconButton sx={{ color: '#aebac1' }}>
                    <MoreVertIcon />
                </IconButton>
            </Box>

            {/* Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: '#0b141a',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20h60v60H20z\' fill=\'%23182229\' opacity=\'.05\'/%3E%3C/svg%3E")',
                }}
            >
                <MessageList />
            </Box>

            {/* Input */}
            <Box sx={{ bgcolor: '#202c33', p: 1 }}>
                <WhatsAppMessageInput />
            </Box>
        </Box>
    );
}
