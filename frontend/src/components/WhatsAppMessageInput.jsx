import { useState } from 'react';
import { Box, IconButton, InputBase } from '@mui/material';
import {
    Send as SendIcon,
    EmojiEmotions as EmojiIcon,
    AttachFile as AttachIcon,
    Mic as MicIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import socketService from '../lib/socket';

export default function WhatsAppMessageInput() {
    const { sendMessage, selectedUser, isSending } = useChatStore();
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (!message.trim() || !selectedUser || isSending) return;

        const messageText = message.trim();
        setMessage('');

        // Send via socket for real-time delivery
        await sendMessage(selectedUser._id, messageText);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                bgcolor: '#202c33',
                borderRadius: 2,
                p: 0.5,
            }}
        >
            <IconButton size="small" sx={{ color: '#8696a0' }}>
                <EmojiIcon />
            </IconButton>

            <IconButton size="small" sx={{ color: '#8696a0' }}>
                <AttachIcon />
            </IconButton>

            <InputBase
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                sx={{
                    bgcolor: '#2a3942',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    color: '#e9edef',
                    '& ::placeholder': {
                        color: '#8696a0',
                        opacity: 1,
                    },
                }}
            />

            {message.trim() ? (
                <IconButton
                    onClick={handleSend}
                    disabled={isSending}
                    sx={{
                        bgcolor: '#00a884',
                        color: '#111b21',
                        '&:hover': {
                            bgcolor: '#06cf9c',
                        },
                        '&:disabled': {
                            bgcolor: '#2a3942',
                            color: '#8696a0',
                        },
                    }}
                >
                    <SendIcon />
                </IconButton>
            ) : (
                <IconButton size="small" sx={{ color: '#8696a0' }}>
                    <MicIcon />
                </IconButton>
            )}
        </Box>
    );
}
