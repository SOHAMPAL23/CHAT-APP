import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Smile, Trash2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { format } from 'date-fns';

export default function MessageBubble({ message, isSent, index }) {
    const { deleteMessage, addReaction, selectedUser } = useChatStore();
    const [showActions, setShowActions] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Delete this message?')) {
            await deleteMessage(message._id, selectedUser._id);
        }
    };

    const handleReaction = async (emoji) => {
        await addReaction(message._id, emoji, selectedUser._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {!isSent && (
                <div className="message-avatar">
                    <img
                        src={message.senderId?.profilePicture || 'https://ui-avatars.com/api/?name=' + message.senderId?.username}
                        alt={message.senderId?.username}
                    />
                </div>
            )}

            <div className="message-content">
                <div className="message-bubble">
                    {message.messageText && (
                        <p className="message-text">{message.messageText}</p>
                    )}

                    {message.fileUrl && (
                        <div className="message-file">
                            {message.fileType === 'image' && (
                                <img
                                    src={message.fileUrl}
                                    alt={message.fileName}
                                    style={{
                                        maxWidth: '300px',
                                        borderRadius: 'var(--radius-md)',
                                        marginTop: 'var(--spacing-sm)',
                                    }}
                                />
                            )}
                            {message.fileType === 'video' && (
                                <video
                                    src={message.fileUrl}
                                    controls
                                    style={{
                                        maxWidth: '300px',
                                        borderRadius: 'var(--radius-md)',
                                        marginTop: 'var(--spacing-sm)',
                                    }}
                                />
                            )}
                        </div>
                    )}

                    <div className="message-meta">
                        <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                        {isSent && (
                            <>
                                {message.isRead ? (
                                    <CheckCheck size={14} />
                                ) : (
                                    <Check size={14} />
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className="message-reactions">
                        {message.reactions.map((reaction, idx) => (
                            <motion.span
                                key={idx}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="reaction"
                            >
                                {reaction.emoji}
                            </motion.span>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            display: 'flex',
                            gap: '0.25rem',
                            marginTop: '0.25rem',
                            justifyContent: isSent ? 'flex-end' : 'flex-start',
                        }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction('❤️')}
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                            }}
                        >
                            ❤️
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReaction('👍')}
                            style={{
                                background: 'var(--bg-tertiary)',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                            }}
                        >
                            👍
                        </motion.button>
                        {isSent && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDelete}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--secondary)',
                                }}
                            >
                                <Trash2 size={14} />
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
