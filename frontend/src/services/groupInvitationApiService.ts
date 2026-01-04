import axiosInstance from "@/lib/axios";
import type { GroupInvitationResponse } from "@/types/message";

export const groupInvitationApiService = {
    /**
     * Gửi lời mời vào nhóm
     */
    sendInvitation: async (
        conversationId: string,
        inviteeIds: string[],
        message?: string
    ): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.post("/group-invitations", {
            conversationId,
            inviteeIds,
            message
        });
        return response.data;
    },

    /**
     * Lấy danh sách lời mời đã nhận
     */
    getReceivedInvitations: async (): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.get("/group-invitations/received");
        return response.data;
    },

    /**
     * Lấy danh sách lời mời đã gửi
     */
    getSentInvitations: async (conversationId?: string): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.get("/group-invitations/sent", {
            params: { conversationId }
        });
        return response.data;
    },

    /**
     * Chấp nhận lời mời
     */
    acceptInvitation: async (invitationId: string): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.put(`/group-invitations/${invitationId}/accept`);
        return response.data;
    },

    /**
     * Từ chối lời mời
     */
    declineInvitation: async (invitationId: string): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.put(`/group-invitations/${invitationId}/decline`);
        return response.data;
    },

    /**
     * Hủy lời mời
     */
    cancelInvitation: async (invitationId: string): Promise<GroupInvitationResponse> => {
        const response = await axiosInstance.delete(`/group-invitations/${invitationId}`);
        return response.data;
    }
};
