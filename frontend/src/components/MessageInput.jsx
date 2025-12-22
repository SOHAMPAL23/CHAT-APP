import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Paperclip, Image as ImageIcon, Mic } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function MessageInput() {
    const { sendMessage, selectedUser, isSending } = useChatStore();
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedUser || isSending) return;

        const result = await sendMessage(selectedUser._id, {
            messageText: message.trim(),
        });

        if (result.success) {
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    return (
        <div className="message-input-container">
            <form onSubmit={handleSubmit}>
                <div className="message-input-wrapper">
                    <div className="message-input-actions">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="icon-btn"
                            title="Attach File"
                        >
                            <Paperclip size={20} />
                        </motion.button>
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="icon-btn"
                            title="Send Image"
                        >
                            <ImageIcon size={20} />
                        </motion.button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        className="message-input"
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />

                    <div className="message-input-actions">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="icon-btn"
                            title="Emoji"
                        >
                            <Smile size={20} />
                        </motion.button>

                        {message.trim() ? (
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="send-btn"
                                disabled={isSending}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                {isSending ? (
                                    <div className="spinner-small"></div>
                                ) : (
                                    <Send size={20} />
                                )}
                            </motion.button>
                        ) : (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="icon-btn"
                                title="Voice Message"
                            >
                                <Mic size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
