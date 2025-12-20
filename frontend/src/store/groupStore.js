import { create } from 'zustand';
import axiosInstance from '../lib/axios';

export const useGroupStore = create((set, get) => ({
    groups: [],
    selectedGroup: null,
    selectedChannel: null,
    channels: [],
    channelMessages: {},
    isLoading: false,
    isSending: false,

    // Get all groups for the current user
    getGroups: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get('/groups');
            set({ groups: response.data.groups, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            set({ isLoading: false });
        }
    },

    // Get a specific group by ID
    getGroupById: async (groupId) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get(`/groups/${groupId}`);
            set({ selectedGroup: response.data.group, isLoading: false });
            return response.data.group;
        } catch (error) {
            console.error('Failed to fetch group:', error);
            set({ isLoading: false });
            return null;
        }
    },

    // Create a new group
    createGroup: async (groupData) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.post('/groups', groupData);
            set((state) => ({
                groups: [...state.groups, response.data.group],
                isLoading: false,
            }));
            return { success: true, group: response.data.group };
        } catch (error) {
            console.error('Failed to create group:', error);
            set({ isLoading: false });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Update group
    updateGroup: async (groupId, groupData) => {
        try {
            const response = await axiosInstance.put(`/groups/${groupId}`, groupData);
            set((state) => ({
                groups: state.groups.map((g) =>
                    g._id === groupId ? response.data.group : g
                ),
                selectedGroup:
                    state.selectedGroup?._id === groupId
                        ? response.data.group
                        : state.selectedGroup,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to update group:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Delete group
    deleteGroup: async (groupId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}`);
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup:
                    state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to delete group:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Join group with invite code
    joinGroup: async (inviteCode) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.post(`/groups/join/${inviteCode}`);
            set((state) => ({
                groups: [...state.groups, response.data.group],
                isLoading: false,
            }));
            return { success: true, group: response.data.group };
        } catch (error) {
            console.error('Failed to join group:', error);
            set({ isLoading: false });
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Leave group
    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.post(`/groups/${groupId}/leave`);
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                selectedGroup:
                    state.selectedGroup?._id === groupId ? null : state.selectedGroup,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to leave group:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Get channels for a group
    getChannels: async (groupId) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get(`/groups/${groupId}/channels`);
            set({ channels: response.data.channels, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch channels:', error);
            set({ isLoading: false });
        }
    },

    // Create a new channel
    createChannel: async (groupId, channelData) => {
        try {
            const response = await axiosInstance.post(
                `/groups/${groupId}/channels`,
                channelData
            );
            set((state) => ({
                channels: [...state.channels, response.data.channel],
            }));
            return { success: true, channel: response.data.channel };
        } catch (error) {
            console.error('Failed to create channel:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Update channel
    updateChannel: async (channelId, channelData) => {
        try {
            const response = await axiosInstance.put(
                `/channels/${channelId}`,
                channelData
            );
            set((state) => ({
                channels: state.channels.map((c) =>
                    c._id === channelId ? response.data.channel : c
                ),
                selectedChannel:
                    state.selectedChannel?._id === channelId
                        ? response.data.channel
                        : state.selectedChannel,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to update channel:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Delete channel
    deleteChannel: async (channelId) => {
        try {
            await axiosInstance.delete(`/channels/${channelId}`);
            set((state) => ({
                channels: state.channels.filter((c) => c._id !== channelId),
                selectedChannel:
                    state.selectedChannel?._id === channelId
                        ? null
                        : state.selectedChannel,
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to delete channel:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Get messages for a channel
    getChannelMessages: async (channelId, limit = 50, before = null) => {
        set({ isLoading: true });
        try {
            const params = { limit };
            if (before) params.before = before;

            const response = await axiosInstance.get(
                `/channels/${channelId}/messages`,
                { params }
            );

            set((state) => ({
                channelMessages: {
                    ...state.channelMessages,
                    [channelId]: response.data.messages,
                },
                isLoading: false,
            }));
        } catch (error) {
            console.error('Failed to fetch channel messages:', error);
            set({ isLoading: false });
        }
    },

    // Send message to channel
    sendChannelMessage: async (channelId, messageData) => {
        set({ isSending: true });
        try {
            const response = await axiosInstance.post(
                `/channels/${channelId}/messages`,
                messageData
            );

            set((state) => ({
                channelMessages: {
                    ...state.channelMessages,
                    [channelId]: [
                        ...(state.channelMessages[channelId] || []),
                        response.data.message,
                    ],
                },
                isSending: false,
            }));

            return { success: true };
        } catch (error) {
            console.error('Failed to send channel message:', error);
            set({ isSending: false });
            return { success: false };
        }
    },

    // Add received channel message
    addChannelMessage: (channelId, message) => {
        set((state) => ({
            channelMessages: {
                ...state.channelMessages,
                [channelId]: [...(state.channelMessages[channelId] || []), message],
            },
        }));
    },

    // Set selected group
    setSelectedGroup: (group) => {
        set({ selectedGroup: group });
        if (group) {
            get().getChannels(group._id);
        }
    },

    // Set selected channel
    setSelectedChannel: (channel) => {
        set({ selectedChannel: channel });
        if (channel) {
            get().getChannelMessages(channel._id);
        }
    },

    // Generate invite code
    generateInviteCode: async (groupId) => {
        try {
            const response = await axiosInstance.post(`/groups/${groupId}/invite`);
            return { success: true, inviteCode: response.data.inviteCode };
        } catch (error) {
            console.error('Failed to generate invite code:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Update member role
    updateMemberRole: async (groupId, memberId, role) => {
        try {
            await axiosInstance.put(`/groups/${groupId}/members/${memberId}/role`, {
                role,
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to update member role:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    // Kick member
    kickMember: async (groupId, memberId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to kick member:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },
}));
