import { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MessageBubble from './MessageBubble';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

export default function MessageList() {
    const { selectedUser, messages, isLoading } = useChatStore();
    const { user } = useAuthStore();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const currentMessages = selectedUser ? messages[selectedUser._id] || [] : [];

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    // Group messages by date
    const groupedMessages = currentMessages.reduce((groups, message) => {
        const date = new Date(message.createdAt);
        const dateKey = format(date, 'yyyy-MM-dd');

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {});

    const formatDateDivider = (dateString) => {
        const date = new Date(dateString);

        if (isToday(date)) {
            return 'Today';
        } else if (isYesterday(date)) {
            return 'Yesterday';
        } else {
            return format(date, 'MMMM d, yyyy');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress sx={{ color: '#00a884' }} />
            </Box>
        );
    }

    // Empty state
    if (currentMessages.length === 0) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Box sx={{ textAlign: 'center' }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'rgba(0, 168, 132, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#00a884">
                                <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M20,16H5.17L4,17.17V4H20V16M7,9V11H9V9H7M11,9V11H13V9H11M15,9V11H17V9H15Z" />
                            </svg>
                        </Box>
                        <Typography sx={{ color: '#8696a0', fontSize: '0.95rem' }}>
                            No messages yet
                        </Typography>
                        <Typography sx={{ color: '#8696a0', fontSize: '0.85rem', mt: 0.5 }}>
                            Start the conversation! 👋
                        </Typography>
                    </Box>
                </motion.div>
            </Box>
        );
    }

    return (
        <Box
            ref={messagesContainerRef}
            sx={{
                height: '100%',
                overflowY: 'auto',
                py: 2,
                px: { xs: 1, md: 2 },
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <AnimatePresence>
                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <Box key={dateKey}>
                        {/* Date Divider */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                margin: '16px 0',
                            }}
                        >
                            <Box
                                sx={{
                                    px: 2,
                                    py: 0.75,
                                    bgcolor: 'rgba(30, 44, 52, 0.9)',
                                    borderRadius: 2,
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#8696a0',
                                        fontWeight: 500,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {formatDateDivider(dateKey)}
                                </Typography>
                            </Box>
                        </motion.div>

                        {/* Messages for this date */}
                        {msgs.map((message, index) => {
                            const isSent =
                                message.senderId?._id === user?._id ||
                                message.senderId === user?._id;

                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isSent={isSent}
                                    index={index}
                                />
                            );
                        })}
                    </Box>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </Box>
    );
}
