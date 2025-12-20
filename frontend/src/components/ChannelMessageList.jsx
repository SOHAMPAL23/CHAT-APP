import { useEffect, useRef } from 'react';
import { Box, Typography, Avatar, Paper, IconButton, Chip } from '@mui/material';
import { MoreVert as MoreVertIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { useGroupStore } from '../store/groupStore';
import { useAuthStore } from '../store/authStore';
import socketService from '../lib/socket';
import { format } from 'date-fns';

export default function ChannelMessageList() {
    const { user } = useAuthStore();
    const { selectedChannel, channelMessages, addChannelMessage } = useGroupStore();
    const messagesEndRef = useRef(null);

    const messages = selectedChannel ? channelMessages[selectedChannel._id] || [] : [];

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for channel messages
    useEffect(() => {
        if (!selectedChannel) return;

        const handleChannelMessage = ({ channelId, message }) => {
            if (channelId === selectedChannel._id) {
                addChannelMessage(channelId, message);
            }
        };

        socketService.on('receiveChannelMessage', handleChannelMessage);
        socketService.on('channelMessageSent', (message) => {
            // Message already added by sendChannelMessage in store
        });

        return () => {
            socketService.off('receiveChannelMessage', handleChannelMessage);
        };
    }, [selectedChannel, addChannelMessage]);

    if (!selectedChannel) return null;

    if (messages.length === 0) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Welcome to #{selectedChannel.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    This is the beginning of the #{selectedChannel.name} channel.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                },
            }}
        >
            {messages.map((message, index) => {
                const sender = message.senderId;
                const isOwnMessage = (sender?._id || sender) === user?._id;
                const showAvatar = index === 0 || messages[index - 1].senderId?._id !== sender?._id;
                const messageTime = format(new Date(message.createdAt), 'HH:mm');

                return (
                    <Box
                        key={message._id}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            px: 2,
                            py: showAvatar ? 1 : 0.25,
                            '&:hover': {
                                bgcolor: 'background.hover',
                            },
                            '&:hover .message-actions': {
                                opacity: 1,
                            },
                        }}
                    >
                        {/* Avatar */}
                        <Box sx={{ width: 40, flexShrink: 0 }}>
                            {showAvatar ? (
                                <Avatar
                                    src={sender?.profilePicture}
                                    sx={{ width: 40, height: 40 }}
                                >
                                    {sender?.username?.charAt(0).toUpperCase()}
                                </Avatar>
                            ) : (
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    sx={{
                                        opacity: 0,
                                        '.MuiBox-root:hover &': {
                                            opacity: 1,
                                        },
                                        fontSize: '0.65rem',
                                        ml: 1,
                                    }}
                                >
                                    {messageTime}
                                </Typography>
                            )}
                        </Box>

                        {/* Message Content */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            {showAvatar && (
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {sender?.username || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {message.messageText}
                            </Typography>

                            {/* Mentions */}
                            {message.mentions && message.mentions.length > 0 && (
                                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {message.mentions.map((mention) => (
                                        <Chip
                                            key={mention._id}
                                            label={`@${mention.username}`}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Reply indicator */}
                            {message.replyTo && (
                                <Paper
                                    sx={{
                                        mt: 0.5,
                                        p: 0.5,
                                        bgcolor: 'background.elevated',
                                        borderLeft: 3,
                                        borderColor: 'primary.main',
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary">
                                        Replying to: {message.replyTo.messageText?.substring(0, 50)}...
                                    </Typography>
                                </Paper>
                            )}
                        </Box>

                        {/* Message Actions */}
                        <Box
                            className="message-actions"
                            sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                display: 'flex',
                                gap: 0.5,
                            }}
                        >
                            <IconButton size="small">
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                );
            })}
            <div ref={messagesEndRef} />
        </Box>
    );
}
