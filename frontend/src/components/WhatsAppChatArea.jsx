import { Box, Typography, Avatar, IconButton } from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Videocam as VideoCallIcon,
    Call as CallIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import MessageList from './MessageList';
import WhatsAppMessageInput from './WhatsAppMessageInput';
import ChannelMessageList from './ChannelMessageList';
import ChannelMessageInput from './ChannelMessageInput';
import { motion } from 'framer-motion';

export default function WhatsAppChatArea({ onBack }) {
    const { selectedUser, onlineUsers, typingUsers } = useChatStore();
    const { selectedGroup, selectedChannel } = useGroupStore();

    // Empty state - no chat selected
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
                    backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(0, 168, 132, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(0, 168, 132, 0.08) 0%, transparent 50%)
                    `,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative animated circles */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        border: '1px solid rgba(0, 168, 132, 0.1)',
                        top: '20%',
                        right: '-100px',
                        animation: 'pulse 4s ease-in-out infinite',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        border: '1px solid rgba(0, 168, 132, 0.15)',
                        bottom: '20%',
                        left: '-50px',
                        animation: 'pulse 4s ease-in-out infinite 1s',
                    }}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
                        sx={{
                            width: { xs: '90%', md: 420 },
                            textAlign: 'center',
                            p: 4,
                            bgcolor: 'rgba(17, 27, 33, 0.9)',
                            borderRadius: 4,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #00a884 0%, #06cf9c 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    boxShadow: '0 0 30px rgba(0, 168, 132, 0.3)',
                                }}
                            >
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                                    <path d="M17,12V3A1,1 0 0,0 16,2H3A1,1 0 0,0 2,3V17L6,13H16A1,1 0 0,0 17,12M21,6H19V15H6V17A1,1 0 0,0 7,18H18L22,22V7A1,1 0 0,0 21,6Z" />
                                </svg>
                            </Box>
                        </motion.div>

                        <Typography
                            variant="h4"
                            sx={{
                                color: '#e9edef',
                                mb: 2,
                                fontWeight: 700,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Welcome to Chat
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#8696a0',
                                mb: 3,
                                lineHeight: 1.6,
                            }}
                        >
                            Send and receive messages in real-time. Select a conversation from the sidebar to start chatting.
                        </Typography>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 3,
                                py: 1.5,
                                bgcolor: 'rgba(0, 168, 132, 0.1)',
                                borderRadius: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#00a884',
                                    animation: 'pulse 2s ease-in-out infinite',
                                }}
                            />
                            <Typography variant="body2" sx={{ color: '#00a884' }}>
                                Ready to connect
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>

                {/* CSS Keyframes */}
                <style>
                    {`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.5; transform: scale(1.05); }
                        }
                    `}
                </style>
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
                        gap: 1.5,
                        borderBottom: '1px solid #2a3942',
                    }}
                >
                    <IconButton onClick={onBack} sx={{ color: '#aebac1', display: { md: 'none' } }}>
                        <ArrowBackIcon />
                    </IconButton>

                    <Avatar
                        src={selectedGroup.icon}
                        sx={{
                            bgcolor: '#00a884',
                            width: 45,
                            height: 45,
                        }}
                    >
                        {selectedGroup.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ color: '#e9edef', fontWeight: 600 }}>
                            {selectedGroup.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8696a0' }}>
                            #{selectedChannel.name}
                        </Typography>
                    </Box>

                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <VideoCallIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <SearchIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>

                {/* Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#0b141a',
                        backgroundImage: `
                            radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 50%)
                        `,
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
    const isTyping = selectedUser && typingUsers.has(selectedUser._id);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        bgcolor: '#202c33',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        borderBottom: '1px solid #2a3942',
                    }}
                >
                    <IconButton onClick={onBack} sx={{ color: '#aebac1', display: { md: 'none' } }}>
                        <ArrowBackIcon />
                    </IconButton>

                    <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                        <Avatar
                            src={selectedUser?.profilePicture}
                            sx={{
                                bgcolor: '#00a884',
                                width: 45,
                                height: 45,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}
                        >
                            {selectedUser?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        {isOnline && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
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
                        <Typography sx={{ color: '#e9edef', fontWeight: 600 }}>
                            {selectedUser?.username}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: isTyping ? '#00a884' : isOnline ? '#00a884' : '#8696a0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            {isTyping ? (
                                <>
                                    <span>typing</span>
                                    <motion.span
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        ...
                                    </motion.span>
                                </>
                            ) : isOnline ? (
                                'online'
                            ) : (
                                'offline'
                            )}
                        </Typography>
                    </Box>

                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <VideoCallIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <CallIcon />
                    </IconButton>
                    <IconButton sx={{ color: '#aebac1', '&:hover': { color: '#00a884' } }}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </motion.div>

            {/* Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    bgcolor: '#0b141a',
                    backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 50%)
                    `,
                    position: 'relative',
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
