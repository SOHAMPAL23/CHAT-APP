import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Avatar, IconButton, Tooltip, Popover } from '@mui/material';
import {
    DoneAll as DoneAllIcon,
    Done as DoneIcon,
    SentimentSatisfiedAlt as EmojiIcon,
    Delete as DeleteIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';
import { useChatStore } from '../store/chatStore';
import { format } from 'date-fns';

// Common emoji reactions
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export default function MessageBubble({ message, isSent, index }) {
    const { addReaction, selectedUser } = useChatStore();
    const [showActions, setShowActions] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState(null);

    const handleReaction = (emoji) => {
        if (selectedUser) {
            addReaction(message._id, emoji);
        }
        setEmojiAnchor(null);
    };

    const handleEmojiClick = (event) => {
        setEmojiAnchor(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setEmojiAnchor(null);
    };

    // Group reactions by emoji
    const groupedReactions = message.reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {}) || {};

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: index * 0.02,
                type: 'spring',
                stiffness: 500,
                damping: 30
            }}
            style={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                marginBottom: '4px',
                paddingLeft: isSent ? '60px' : '8px',
                paddingRight: isSent ? '8px' : '60px',
            }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <Box sx={{ display: 'flex', gap: 1, maxWidth: '75%', flexDirection: isSent ? 'row-reverse' : 'row' }}>
                {/* Avatar - only for received messages */}
                {!isSent && (
                    <Avatar
                        src={message.senderId?.profilePicture}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#00a884',
                            fontSize: '0.8rem',
                            flexShrink: 0,
                            mt: 'auto',
                            mb: 1,
                        }}
                    >
                        {message.senderId?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                )}

                {/* Message bubble */}
                <Box sx={{ position: 'relative' }}>
                    <Box
                        sx={{
                            position: 'relative',
                            bgcolor: isSent ? '#005c4b' : '#202c33',
                            color: '#e9edef',
                            px: 2,
                            py: 1,
                            borderRadius: isSent
                                ? '12px 12px 4px 12px'
                                : '12px 12px 12px 4px',
                            minWidth: '80px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                            '&::before': isSent ? {
                                content: '""',
                                position: 'absolute',
                                right: -6,
                                bottom: 0,
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: '0 0 8px 8px',
                                borderColor: 'transparent transparent #005c4b transparent',
                            } : {
                                content: '""',
                                position: 'absolute',
                                left: -6,
                                bottom: 0,
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: '0 8px 8px 0',
                                borderColor: 'transparent #202c33 transparent transparent',
                            },
                        }}
                    >
                        {/* Message text */}
                        <Typography
                            sx={{
                                fontSize: '0.95rem',
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {message.messageText}
                        </Typography>

                        {/* File attachments */}
                        {message.fileUrl && (
                            <Box sx={{ mt: 1 }}>
                                {message.fileType === 'image' && (
                                    <motion.img
                                        src={message.fileUrl}
                                        alt={message.fileName}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '300px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                    />
                                )}
                                {message.fileType === 'video' && (
                                    <video
                                        src={message.fileUrl}
                                        controls
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '300px',
                                            borderRadius: '8px',
                                        }}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Timestamp and read status */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 0.5,
                                mt: 0.5,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.7rem',
                                }}
                            >
                                {format(new Date(message.createdAt), 'h:mm a')}
                            </Typography>
                            {isSent && (
                                message.isRead ? (
                                    <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />
                                ) : (
                                    <DoneIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
                                )
                            )}
                        </Box>
                    </Box>

                    {/* Reactions */}
                    {Object.keys(groupedReactions).length > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                position: 'absolute',
                                bottom: -8,
                                ...(isSent ? { left: 8 } : { right: 8 }),
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 0.25,
                                    bgcolor: '#1e2c34',
                                    borderRadius: 3,
                                    px: 0.75,
                                    py: 0.25,
                                    border: '1px solid #2a3942',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                                    <Tooltip
                                        key={emoji}
                                        title={reactions.map(r => r.userId?.username || 'User').join(', ')}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.25,
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                            }}
                                            onClick={() => handleReaction(emoji)}
                                        >
                                            <span>{emoji}</span>
                                            {reactions.length > 1 && (
                                                <Typography variant="caption" sx={{ color: '#8696a0', fontSize: '0.7rem' }}>
                                                    {reactions.length}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                        </motion.div>
                    )}

                    {/* Quick actions */}
                    <AnimatePresence>
                        {showActions && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: -36,
                                    ...(isSent ? { right: 0 } : { left: 0 }),
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 0.25,
                                        bgcolor: '#1e2c34',
                                        borderRadius: 2,
                                        p: 0.5,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        border: '1px solid #2a3942',
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={handleEmojiClick}
                                        sx={{
                                            color: '#aebac1',
                                            '&:hover': {
                                                bgcolor: '#2a3942',
                                                color: '#00a884'
                                            }
                                        }}
                                    >
                                        <EmojiIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            color: '#aebac1',
                                            '&:hover': {
                                                bgcolor: '#2a3942',
                                                color: '#00a884'
                                            }
                                        }}
                                    >
                                        <ReplyIcon fontSize="small" />
                                    </IconButton>
                                    {isSent && (
                                        <IconButton
                                            size="small"
                                            sx={{
                                                color: '#aebac1',
                                                '&:hover': {
                                                    bgcolor: '#2a3942',
                                                    color: '#f15c6d'
                                                }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>

            {/* Emoji Picker Popover */}
            <Popover
                open={Boolean(emojiAnchor)}
                anchorEl={emojiAnchor}
                onClose={handleEmojiClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e2c34',
                        borderRadius: 2,
                        border: '1px solid #2a3942',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }
                }}
            >
                <Box sx={{ display: 'flex', gap: 0.5, p: 1 }}>
                    {QUICK_EMOJIS.map((emoji) => (
                        <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction(emoji)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.4rem',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '50%',
                            }}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </Box>
            </Popover>
        </motion.div>
    );
}
