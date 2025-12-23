import { io } from 'socket.io-client';

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(userId) {
        if (this.socket?.connected) {
            return this.socket;
        }

        // Get JWT token from cookies
        const token = getCookie('token');

        if (!token) {
            console.error('No authentication token found. Cannot connect socket.');
            return null;
        }

        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        this.socket = io(SOCKET_URL, {
            auth: { token }, // Send token instead of userId
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from listeners map
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (!this.socket) {
            console.warn('Socket not connected. Call connect() first.');
            return;
        }

        this.socket.emit(event, data);
    }

    isConnected() {
        return this.socket?.connected || false;
    }

    // Channel-specific methods
    joinChannel(channelId) {
        this.emit('joinChannel', { channelId });
    }

    leaveChannel(channelId) {
        this.emit('leaveChannel', { channelId });
    }

    joinGroup(groupId) {
        this.emit('joinGroup', { groupId });
    }

    sendChannelMessage(channelId, groupId, messageText, options = {}) {
        this.emit('sendChannelMessage', {
            channelId,
            groupId,
            messageText,
            mentions: options.mentions || [],
            mentionEveryone: options.mentionEveryone || false,
            replyTo: options.replyTo || null,
        });
    }

    channelTyping(channelId, isTyping) {
        this.emit('channelTyping', { channelId, isTyping });
    }

    // DM-specific methods (existing functionality)
    sendMessage(receiverId, messageText) {
        this.emit('sendMessage', { receiverId, messageText });
    }

    typing(receiverId, isTyping) {
        this.emit('typing', { receiverId, isTyping });
    }

    markAsRead(senderId) {
        this.emit('markAsRead', { senderId });
    }

    addReaction(messageId, emoji, receiverId) {
        this.emit('addReaction', { messageId, emoji, receiverId });
    }

    removeReaction(messageId, receiverId) {
        this.emit('removeReaction', { messageId, receiverId });
    }

    joinRoom(userId) {
        this.emit('joinRoom', { userId });
    }

    leaveRoom(userId) {
        this.emit('leaveRoom', { userId });
    }
}

// Export singleton instance
export default new SocketService();
