import { create } from 'zustand';
import type { GroupInvitation, InvitationStatus } from '@/types/message';
import { groupInvitationApiService } from '@/services/groupInvitationApiService';
import { groupInvitationSocketService } from '@/socket/groupInvitationService';
import { toast } from 'sonner';

interface GroupInvitationState {
    receivedInvitations: GroupInvitation[];
    sentInvitations: GroupInvitation[];
    loading: boolean;

    // Actions
    getReceivedInvitations: () => Promise<void>;
    getSentInvitations: (conversationId?: string) => Promise<void>;
    sendInvitation: (conversationId: string, inviteeIds: string[], message?: string) => Promise<void>;
    acceptInvitation: (invitationId: string) => Promise<void>;
    declineInvitation: (invitationId: string) => Promise<void>;
    cancelInvitation: (invitationId: string) => Promise<void>;

    // Socket listeners
    setupSocketListeners: () => void;
    removeSocketListeners: () => void;
    _listenersSetup: boolean;

    // Store modifiers
    _addReceivedInvitation: (invitation: GroupInvitation) => void;
    _removeReceivedInvitation: (invitationId: string) => void;
    _updateInvitationStatus: (invitationId: string, status: InvitationStatus) => void;
}

export const useGroupInvitationStore = create<GroupInvitationState>((set, get) => ({
    receivedInvitations: [],
    sentInvitations: [],
    loading: false,

    getReceivedInvitations: async () => {
        set({ loading: true });
        try {
            const response = await groupInvitationApiService.getReceivedInvitations();
            if (response.success) {
                set({ receivedInvitations: response.data });
            }
        } catch (error) {
            console.error("Lỗi lấy lời mời nhận được:", error);
        } finally {
            set({ loading: false });
        }
    },

    getSentInvitations: async (conversationId?: string) => {
        set({ loading: true });
        try {
            const response = await groupInvitationApiService.getSentInvitations(conversationId);
            if (response.success) {
                set({ sentInvitations: response.data });
            }
        } catch (error) {
            console.error("Lỗi lấy lời mời đã gửi:", error);
        } finally {
            set({ loading: false });
        }
    },

    sendInvitation: async (conversationId, inviteeIds, message) => {
        try {
            const response = await groupInvitationApiService.sendInvitation(conversationId, inviteeIds, message);
            if (response.success) {
                toast.success(response.message);
                // Refresh sent invitations list
                get().getSentInvitations(conversationId);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi gửi lời mời");
        }
    },

    acceptInvitation: async (invitationId) => {
        try {
            const response = await groupInvitationApiService.acceptInvitation(invitationId);
            if (response.success) {
                toast.success(response.message);
                get()._removeReceivedInvitation(invitationId);
                // Có thể cần refresh conversation list thông qua store khác (useConversationStore)
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi chấp nhận lời mời");
        }
    },

    declineInvitation: async (invitationId) => {
        try {
            const response = await groupInvitationApiService.declineInvitation(invitationId);
            if (response.success) {
                toast.success(response.message);
                get()._removeReceivedInvitation(invitationId);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi từ chối lời mời");
        }
    },

    cancelInvitation: async (invitationId) => {
        try {
            const response = await groupInvitationApiService.cancelInvitation(invitationId);
            if (response.success) {
                toast.success(response.message);
                set(state => ({
                    sentInvitations: state.sentInvitations.filter(i => i._id !== invitationId)
                }));
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi hủy lời mời");
        }
    },

    _listenersSetup: false,

    setupSocketListeners: () => {
        if (!groupInvitationSocketService) return;
        if (get()._listenersSetup) return;

        // Lắng nghe lời mời nhận được
        groupInvitationSocketService.onInvitationReceived((data) => {
            get()._addReceivedInvitation(data.invitation);
            toast.info(`Bạn nhận được lời mời tham gia nhóm "${(data.invitation.conversationId as any)?.name || 'Nhóm mới'}"`);
        });

        // Lắng nghe khi gửi thành công
        groupInvitationSocketService.onInvitationSent((data) => {
            if (data.success) {
                get().getSentInvitations();
            }
        });

        // Lắng nghe khi status thay đổi (từ phía người khác)
        groupInvitationSocketService.onInvitationStatusChanged((data) => {
            get()._updateInvitationStatus(data.invitation._id, data.status as any);

            const groupName = (data.invitation.conversationId as any)?.name || "Nhóm";
            const inviteeName = (data.invitation.inviteeId as any)?.displayName || (data.invitation.inviteeId as any)?.username || "Thành viên";

            if (data.status === 'accepted') {
                toast.success(`${inviteeName} đã chấp nhận lời mời tham gia ${groupName}`);
            } else if (data.status === 'declined') {
                toast.info(`${inviteeName} đã từ chối lời mời tham gia ${groupName}`);
            } else if (data.status === 'cancelled') {
                toast.info(`Lời mời tham gia ${groupName} đã bị hủy bởi quản trị viên`);
                get()._removeReceivedInvitation(data.invitation._id);
            }
        });

        // Lắng nghe khi có thành viên mới tham gia qua lời mời (cho những member khác trong room)
        groupInvitationSocketService.onGroupMemberJoined((data) => {
            toast.info(`${data.newMember.displayName || data.newMember.username} đã tham gia nhóm`);
        });

        // Lắng nghe lỗi
        groupInvitationSocketService.onInvitationError((data) => {
            toast.error(data.message);
        });

        set({ _listenersSetup: true });
    },

    removeSocketListeners: () => {
        groupInvitationSocketService.removeAllListeners();
        set({ _listenersSetup: false });
    },

    _addReceivedInvitation: (invitation) => {
        set(state => {
            // Tránh duplicate
            if (state.receivedInvitations.some(i => i._id === invitation._id)) {
                return state;
            }
            return { receivedInvitations: [invitation, ...state.receivedInvitations] };
        });
    },

    _removeReceivedInvitation: (invitationId) => {
        set(state => ({
            receivedInvitations: state.receivedInvitations.filter(i => i._id !== invitationId)
        }));
    },

    _updateInvitationStatus: (invitationId, status) => {
        set(state => ({
            sentInvitations: state.sentInvitations.map(i =>
                i._id === invitationId ? { ...i, status } : i
            ),
            receivedInvitations: state.receivedInvitations.map(i =>
                i._id === invitationId ? { ...i, status } : i
            )
        }));
    }
}));
