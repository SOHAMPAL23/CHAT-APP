import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, LogOut, Settings, Search, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useStoryStore } from '../store/storyStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Sidebar() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { conversations, selectedUser, setSelectedUser, onlineUsers } = useChatStore();
    const { stories } = useStoryStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = useMemo(() => {
        if (!conversations) return [];
        if (!searchQuery.trim()) return conversations;

        return conversations.filter((conv) =>
            conv.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <h1 className="sidebar-title">
                    <MessageCircle />
                    Messages
                </h1>
                <div className="sidebar-actions">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="icon-btn"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="icon-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </motion.button>
                </div>
            </div>

            {/* Stories Section */}
            {stories?.length > 0 && (
                <div className="stories-section">
                    <div className="stories-container">
                        {/* Add Story */}
                        <div className="story-item">
                            <div className="story-avatar-wrapper">
                                <div className="story-avatar">
                                    <img
                                        src={user?.profilePicture || 'https://ui-avatars.com/api/?name=' + user?.username}
                                        alt="Your story"
                                    />
                                </div>
                                <div className="add-story-btn">
                                    <Plus size={14} />
                                </div>
                            </div>
                            <p className="story-username">Your Story</p>
                        </div>

                        {/* Other Stories */}
                        {stories.map((story) => (
                            <motion.div
                                key={story._id}
                                whileHover={{ scale: 1.05 }}
                                className="story-item"
                            >
                                <div className="story-avatar-wrapper">
                                    <div className="story-avatar">
                                        <img
                                            src={story.userId?.profilePicture || 'https://ui-avatars.com/api/?name=' + story.userId?.username}
                                            alt={story.userId?.username}
                                        />
                                    </div>
                                </div>
                                <p className="story-username">{story.userId?.username}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="search-container">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        className="input search-input"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="conversations-list">
                {filteredConversations.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {searchQuery ? 'No conversations found' : 'No conversations yet'}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const isOnline = onlineUsers.has(conversation.user?._id);
                        const isSelected = selectedUser?._id === conversation.user?._id;

                        return (
                            <motion.div
                                key={conversation.user?._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 4 }}
                                className={`conversation-item ${isSelected ? 'active' : ''}`}
                                onClick={() => setSelectedUser(conversation.user)}
                            >
                                <div className="conversation-avatar">
                                    <img
                                        src={conversation.user?.profilePicture || 'https://ui-avatars.com/api/?name=' + conversation.user?.username}
                                        alt={conversation.user?.username}
                                    />
                                    {isOnline && <div className="online-indicator"></div>}
                                </div>

                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <span className="conversation-name">
                                            {conversation.user?.username}
                                        </span>
                                        {conversation.lastMessage && (
                                            <span className="conversation-time">
                                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                                    addSuffix: false,
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="conversation-preview">
                                        <p className="conversation-message">
                                            {conversation.lastMessage?.messageText || 'Start a conversation'}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                            <span className="unread-badge">{conversation.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
