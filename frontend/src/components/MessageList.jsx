import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import MessageBubble from './MessageBubble';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

export default function MessageList() {
    const { selectedUser, messages } = useChatStore();
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

    if (currentMessages.length === 0) {
        return (
            <div className="messages-container">
                <div className="empty-state">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <p style={{ color: 'var(--text-muted)' }}>
                            No messages yet. Start the conversation!
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="messages-container" ref={messagesContainerRef}>
            <AnimatePresence>
                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                        {/* Date Divider */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="message-date-divider"
                        >
                            <span className="date-badge">{formatDateDivider(dateKey)}</span>
                        </motion.div>

                        {/* Messages for this date */}
                        {msgs.map((message, index) => {
                            const isSent = message.senderId?._id === user?._id || message.senderId === user?._id;

                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isSent={isSent}
                                    index={index}
                                />
                            );
                        })}
                    </div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
}
