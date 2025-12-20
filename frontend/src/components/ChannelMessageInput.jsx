import { useState } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { Send as SendIcon, EmojiEmotions as EmojiIcon, AttachFile as AttachIcon } from '@mui/icons-material';
import { useGroupStore } from '../store/groupStore';
import socketService from '../lib/socket';

export default function ChannelMessageInput() {
    const { selectedChannel, selectedGroup, sendChannelMessage, isSending } = useGroupStore();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    if (!selectedChannel || !selectedGroup) return null;

    const handleSend = async () => {
        if (!message.trim() || isSending) return;

        const messageText = message.trim();
        setMessage('');

        // Send via socket for real-time
        socketService.sendChannelMessage(selectedChannel._id, selectedGroup._id, messageText);

        // Also send via API to save in database (socket handler does this too, but this is backup)
        await sendChannelMessage(selectedChannel._id, { messageText });

        // Stop typing indicator
        if (isTyping) {
            socketService.channelTyping(selectedChannel._id, false);
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Typing indicator
        if (e.target.value && !isTyping) {
            socketService.channelTyping(selectedChannel._id, true);
            setIsTyping(true);
        } else if (!e.target.value && isTyping) {
            socketService.channelTyping(selectedChannel._id, false);
            setIsTyping(false);
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1,
                    bgcolor: 'background.elevated',
                    borderRadius: 2,
                    p: 1,
                }}
            >
                <IconButton size="small" sx={{ mb: 0.5 }}>
                    <AttachIcon />
                </IconButton>

                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${selectedChannel.name}`}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: '0.95rem',
                        },
                    }}
                />

                <IconButton size="small" sx={{ mb: 0.5 }}>
                    <EmojiIcon />
                </IconButton>

                <Tooltip title="Send message">
                    <span>
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={!message.trim() || isSending}
                            sx={{ mb: 0.5 }}
                        >
                            <SendIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            <Box sx={{ mt: 0.5, px: 1 }}>
                <Box
                    component="span"
                    sx={{
                        fontSize: '0.7rem',
                        color: 'text.disabled',
                    }}
                >
                    Use @ to mention someone
                </Box>
            </Box>
        </Box>
    );
}
