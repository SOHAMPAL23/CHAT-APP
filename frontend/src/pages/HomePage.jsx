import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useSocketStore from '../store/socketStore';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { users, messages, selectedUser, getUsers, getMessages, setSelectedUser, clearMessages } = useChatStore();
  const { socket, typingUsers } = useSocketStore();
  
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      getUsers();
    }
  }, [user, navigate, getUsers]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
    return () => clearMessages();
  }, [selectedUser, getMessages, clearMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    try {
      if (socket) {
        socket.emit('sendMessage', {
          receiverId: selectedUser._id,
          messageText: messageText.trim()
        });
      }
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isUserOnline = (userId) => {
    const { onlineUsers } = useChatStore.getState();
    return onlineUsers.includes(userId);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOtherUserTyping = typingUsers[selectedUser?._id];

  return (
    <div className="home-page">
      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="user-info">
              <div className="user-profile">
                <div className="user-avatar">
                  <img src={user?.profilePicture} alt={user?.username} />
                  <span className="status-indicator"></span>
                </div>
                <div className="user-details">
                  <h3>{user?.username}</h3>
                  <p>Online</p>
                </div>
              </div>
              <div className="user-actions">
                <button className="btn-icon" onClick={() => navigate('/profile')} title="Profile">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <button className="btn-icon" onClick={handleLogout} title="Logout">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="search-box">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="users-list">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className={`user-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="user-item-avatar">
                  <img src={u.profilePicture} alt={u.username} />
                  <span className={`status-indicator ${!isUserOnline(u._id) ? 'offline' : ''}`}></span>
                </div>
                <div className="user-item-info">
                  <h4>{u.username}</h4>
                  <p>{isUserOnline(u._id) ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedUser ? (
          <div className="chat-area">
            <div className="chat-header">
              <div className="chat-header-avatar">
                <img src={selectedUser.profilePicture} alt={selectedUser.username} />
                <span className={`status-indicator ${!selectedUser.isOnline ? 'offline' : ''}`}></span>
              </div>
              <div className="chat-header-info">
                <h3>{selectedUser.username}</h3>
                <p>{selectedUser.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            <div className="messages-container">
              {messages.map((message, index) => {
                const isOwnMessage = message.senderId._id === user._id;
                const showAvatar = index === 0 || messages[index - 1].senderId._id !== message.senderId._id;

                return (
                  <div key={message._id || index} className={`message ${isOwnMessage ? 'own' : ''}`}>
                    {showAvatar ? (
                      <div className="message-avatar">
                        <img src={message.senderId.profilePicture} alt={message.senderId.username} />
                      </div>
                    ) : (
                      <div style={{width: '32px'}}></div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        {message.messageText}
                      </div>
                      <div className="message-time">
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isOtherUserTyping && (
                <div className="typing-indicator">
                  <div className="message-avatar">
                    <img src={selectedUser.profilePicture} alt={selectedUser.username} />
                  </div>
                  <div className="typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" disabled={!messageText.trim()} className="send-button">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="no-chat">
            <div className="no-chat-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3>Welcome to Chat App</h3>
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
