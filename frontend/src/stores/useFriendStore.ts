import { friendService } from "@/services/friendService";
import type { FriendState } from "@/type/store";
import { toast } from "sonner";
import { create } from "zustand";

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export const useFriendStore = create<FriendState>((set, get) => ({
    friends: [],
    receivedRequests: [],
    sentRequests: [],
    loading: false,

    getFriendsList: async () => {
        try {
            set({ loading: true });
            const response = await friendService.getFriendsList();
            set({ friends: response.data?.friends || [] });
        } catch (error) {
            console.log("Lỗi khi lấy danh sách bạn bè:", error);
            toast.error("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
        } finally {
            set({ loading: false });
        }
    },

    getFriendRequests: async () => {
        try {
            set({ loading: true });
            const response = await friendService.getReceivedFriendRequests();
            set({ receivedRequests: response.data || [] });
        } catch (error) {
            console.log("Lỗi khi lấy lời mời kết bạn:", error);
            toast.error("Không thể tải lời mời kết bạn.");
        } finally {
            set({ loading: false });
        }
    },

    getSentRequests: async () => {
        try {
            set({ loading: true });
            const response = await friendService.getSentFriendRequests();
            set({ sentRequests: response.data || [] });
        } catch (error) {
            console.log("Lỗi khi lấy lời mời đã gửi:", error);
            toast.error("Không thể tải lời mời đã gửi.");
        } finally {
            set({ loading: false });
        }
    },

    sendFriendRequest: async (userId: string, message?: string) => {
        try {
            await friendService.sendFriendRequest(userId, message);
            toast.success("Đã gửi lời mời kết bạn!");
            // Refresh sent requests
            get().getSentRequests();
        } catch (error: unknown) {
            const errorMessage = (error as ApiError)?.response?.data?.message || "Không thể gửi lời mời kết bạn.";
            toast.error(errorMessage);
        }
    },

    sendFriendRequestByUsername: async (username: string, message?: string) => {
        try {
            await friendService.sendFriendRequestByUsername(username, message);
            toast.success("Đã gửi lời mời kết bạn!");
            // Refresh sent requests
            get().getSentRequests();
        } catch (error: unknown) {
            const errorMessage = (error as ApiError)?.response?.data?.message || "Không thể gửi lời mời kết bạn.";
            toast.error(errorMessage);
        }
    },

    acceptFriendRequest: async (requestId: string) => {
        try {
            await friendService.acceptFriendRequest(requestId);
            toast.success("Đã chấp nhận lời mời kết bạn!");
            // Refresh friends and requests
            get().getFriendsList();
            get().getFriendRequests();
        } catch (error: unknown) {
            const errorMessage = (error as ApiError)?.response?.data?.message || "Không thể chấp nhận lời mời.";
            toast.error(errorMessage);
        }
    },

    declineFriendRequest: async (requestId: string) => {
        try {
            await friendService.declineFriendRequest(requestId);
            toast.success("Đã từ chối lời mời kết bạn!");
            // Refresh requests
            get().getFriendRequests();
        } catch (error: unknown) {
            const errorMessage = (error as ApiError)?.response?.data?.message || "Không thể từ chối lời mời.";
            toast.error(errorMessage);
        }
    },

    cancelFriendRequest: async (requestId: string) => {
        try {
            await friendService.cancelFriendRequest(requestId);
            toast.success("Đã hủy lời mời kết bạn!");
            // Refresh sent requests
            get().getSentRequests();
        } catch (error: unknown) {
            const errorMessage = (error as ApiError)?.response?.data?.message || "Không thể hủy lời mời.";
            toast.error(errorMessage);
        }
    }
}));