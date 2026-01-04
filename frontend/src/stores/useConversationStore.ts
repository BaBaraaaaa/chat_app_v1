/**
 * Conversation Store - Zustand State Management
 * Manages conversation state with REST API and real-time Socket updates
 */

import { create } from "zustand";
import { toast } from "sonner";
import { conversationService } from "@/socket/conversationService"; // Real-time only
import { conversationApiService } from "@/services/conversationApiService"; // REST API
import { useAuthStore } from "./useAuthStore";
import type {
  Conversation,
  ConversationUpdatedResponse,
} from "@/types/message";

interface ConversationState {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  searchResults: Conversation[];
  totalUnreadCount: number;
  _listenersSetup: boolean;

  // Actions
  getOrCreateConversation: (otherUserId: string) => Promise<void>;
  createGroup: (name: string, participantIds: string[], avatarUrl?: string) => Promise<string | null>;
  getConversations: () => Promise<void>;
  getConversationDetail: (conversationId: string) => Promise<void>;
  searchConversations: (query: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  getTotalUnreadCount: () => Promise<void>;
  resetUnreadCount: (conversationId: string) => Promise<void>;
  addParticipants: (conversationId: string, participantIds: string[]) => Promise<void>;
  removeParticipant: (conversationId: string, participantId: string) => Promise<void>;
  leaveGroup: (conversationId: string) => Promise<void>;
  updateGroupAvatar: (conversationId: string, file: File) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearSearchResults: () => void;

  // Socket listeners
  setupSocketListeners: () => void;
  removeSocketListeners: () => void;

  // Internal state setters
  _setConversations: (conversations: Conversation[]) => void;
  _addConversation: (conversation: Conversation) => void;
  _updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  _removeConversation: (conversationId: string) => void;
  _setSearchResults: (results: Conversation[]) => void;
  _setTotalUnreadCount: (count: number) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  // ==================== STATE ====================
  conversations: [],
  currentConversation: null,
  loading: false,
  searchResults: [],
  totalUnreadCount: 0,
  _listenersSetup: false,

  // ==================== ACTIONS (REST API) ====================

  /**
   * Tạo hoặc lấy conversation (REST API)
   */
  getOrCreateConversation: async (otherUserId: string) => {
    try {
      set({ loading: true });
      const response = await conversationApiService.getOrCreateConversation(otherUserId);

      if (response.success && response.data) {
        const conversation = response.data;

        // Add to conversations list if not exists
        const state = get();
        const exists = state.conversations.find(c => c._id === conversation?._id);
        if (!exists) {
          set({
            conversations: [conversation, ...state.conversations],
            currentConversation: conversation
          });
        } else {
          set({ currentConversation: conversation });
        }

        // Join room for real-time updates
        conversationService.joinConversationRoom(conversation._id);

        toast.success("Cuộc hội thoại đã sẵn sàng");
      } else {
        toast.error("Không thể tạo cuộc hội thoại");
      }
    } catch (error) {
      console.error("Failed to create/get conversation:", error);
      toast.error("Lỗi khi tạo cuộc hội thoại");
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Tạo cuộc hội thoại nhóm (REST API)
   */
  createGroup: async (name: string, participantIds: string[], avatarUrl?: string) => {
    try {
      set({ loading: true });
      const response = await conversationApiService.createGroup(name, participantIds, avatarUrl);

      if (response.success && response.data) {
        const conversation = response.data;

        // Add to conversations list
        const state = get();
        set({
          conversations: [conversation, ...state.conversations],
          currentConversation: conversation
        });

        // Join room for real-time updates
        conversationService.joinConversationRoom(conversation._id);

        toast.success("Tạo nhóm thành công");
        return conversation._id;
      } else {
        toast.error("Không thể tạo nhóm");
        return null;
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Lỗi khi tạo nhóm");
      return null;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Lấy danh sách conversations (REST API)
   */
  getConversations: async () => {
    try {
      set({ loading: true });
      const response = await conversationApiService.getConversations();

      if (response.success) {
        set({ conversations: response.data });
      } else {
        toast.error("Không thể tải danh sách cuộc hội thoại");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Lỗi khi tải danh sách cuộc hội thoại");
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Lấy chi tiết conversation (REST API)
   */
  getConversationDetail: async (conversationId: string) => {
    try {
      set({ loading: true });
      const response = await conversationApiService.getConversationDetail(conversationId);

      if (response.success) {
        set({ currentConversation: response.data });
        // Join room for real-time updates
        conversationService.joinConversationRoom(conversationId);
      } else {
        toast.error("Không thể tải chi tiết cuộc hội thoại");
      }
    } catch (error) {
      console.error("Failed to load conversation detail:", error);
      toast.error("Lỗi khi tải chi tiết cuộc hội thoại");
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Tìm kiếm conversations (REST API)
   */
  searchConversations: async (query: string) => {
    try {
      set({ loading: true });
      const response = await conversationApiService.searchConversations(query);

      if (response.success) {
        set({ searchResults: response.data });
      } else {
        set({ searchResults: [] });
        toast.error("Không thể tìm kiếm cuộc hội thoại");
      }
    } catch (error) {
      console.error("Failed to search conversations:", error);
      set({ searchResults: [] });
      toast.error("Lỗi khi tìm kiếm cuộc hội thoại");
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Xóa conversation (REST API)
   */
  deleteConversation: async (conversationId: string) => {
    try {
      // Optimistic update
      get()._removeConversation(conversationId);

      const response = await conversationApiService.deleteConversation(conversationId);

      if (response.success) {
        toast.success("Đã xóa cuộc hội thoại");
        // Leave room
        conversationService.leaveConversationRoom(conversationId);
      } else {
        // Revert optimistic update
        console.error("Failed to delete conversation, need to reload");
        await get().getConversations();
        toast.error("Không thể xóa cuộc hội thoại");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Revert optimistic update - reload data
      await get().getConversations();
      toast.error("Lỗi khi xóa cuộc hội thoại");
    }
  },

  /**
   * Lấy tổng số tin nhắn chưa đọc (REST API)
   */
  getTotalUnreadCount: async () => {
    try {
      const response = await conversationApiService.getTotalUnreadCount();

      if (response.success && response.data) {
        // Backend returns object { totalUnread: number }
        const count = typeof response.data === 'object' && 'totalUnread' in response.data
          ? (response.data as any).totalUnread
          : response.data;
        set({ totalUnreadCount: Number(count) });
      }
    } catch (error) {
      console.error("Failed to get total unread count:", error);
    }
  },

  /**
   * Reset unread count (REST API)
   */
  resetUnreadCount: async (conversationId: string) => {
    try {
      // Optimistic update
      get()._updateConversation(conversationId, { unreadCount: 0 });

      const response = await conversationApiService.resetUnreadCount(conversationId);
      if (response.success) {
        // Also notify real-time
        conversationService.markAsReadRealtime(conversationId);
        // Refresh total unread count
        await get().getTotalUnreadCount();
      } else {
        // Revert optimistic update - reload conversation
        await get().getConversationDetail(conversationId);
        toast.error("Không thể đánh dấu đã đọc");
      }
    } catch (error) {
      console.error("Failed to reset unread count:", error);
      // Revert optimistic update
      await get().getConversationDetail(conversationId);
      toast.error("Lỗi khi đánh dấu đã đọc");
    }
  },

  /**
   * Thêm thành viên vào nhóm
   */
  addParticipants: async (conversationId: string, participantIds: string[]) => {
    try {
      const response = await conversationApiService.addParticipants(conversationId, participantIds);
      if (response.success && response.data) {
        toast.success("Đã thêm thành viên");
        // Update local state is optional since real-time update might handle it, 
        // but explicit update is faster for the admin
        get()._updateConversation(conversationId, { participants: response.data.participants });
      } else {
        toast.error(response.message || "Không thể thêm thành viên");
      }
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      toast.error("Lỗi khi thêm thành viên");
    }
  },

  /**
   * Xóa thành viên khỏi nhóm
   */
  removeParticipant: async (conversationId: string, participantId: string) => {
    try {
      const response = await conversationApiService.removeParticipant(conversationId, participantId);
      if (response.success && response.data) {
        toast.success("Đã xóa thành viên");
        get()._updateConversation(conversationId, { participants: response.data.participants });
      } else {
        toast.error(response.message || "Không thể xóa thành viên");
      }
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
      toast.error("Lỗi khi xóa thành viên");
    }
  },

  /**
   * Rời nhóm
   */
  leaveGroup: async (conversationId: string) => {
    try {
      const response = await conversationApiService.leaveGroup(conversationId);
      if (response.success) {
        toast.success("Đã rời nhóm");
        get()._removeConversation(conversationId);
        conversationService.leaveConversationRoom(conversationId);
      } else {
        toast.error(response.message || "Không thể rời nhóm");
      }
    } catch (error) {
      console.error("Lỗi khi rời nhóm:", error);
      toast.error("Lỗi khi rời nhóm");
    }
  },

  /**
   * Cập nhật avatar nhóm
   */
  updateGroupAvatar: async (conversationId: string, file: File) => {
    try {
      const response = await conversationApiService.updateGroupAvatar(conversationId, file);
      if (response.success && response.data) {
        toast.success("Đã cập nhật avatar nhóm");
        get()._updateConversation(conversationId, { avatarUrl: response.data.avatarUrl });

        // Also update currentConversation if it matches
        const state = get();
        if (state.currentConversation?._id === conversationId) {
          set({ currentConversation: { ...state.currentConversation, avatarUrl: response.data.avatarUrl } });
        }
      } else {
        toast.error(response.message || "Không thể cập nhật avatar");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar nhóm:", error);
      toast.error("Lỗi khi cập nhật avatar nhóm");
    }
  },

  /**
   * Set current conversation
   */
  setCurrentConversation: (conversation: Conversation | null) => {
    // Leave previous room if any
    const prevConversation = get().currentConversation;
    if (prevConversation) {
      conversationService.leaveConversationRoom(prevConversation._id);
    }

    // Join new room if conversation exists
    if (conversation) {
      conversationService.joinConversationRoom(conversation._id);
    }

    set({ currentConversation: conversation });
  },

  /**
   * Clear search results
   */
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // ==================== SOCKET LISTENERS (Real-time only) ====================

  /**
   * Setup real-time Socket listeners only
   */
  setupSocketListeners: () => {
    if (get()._listenersSetup) {
      return;
    }


    // Listen for conversation updates (real-time)
    conversationService.onConversationUpdated((data: unknown) => {
      const typedData = data as ConversationUpdatedResponse;
      if (typedData.conversationId && typedData.updates) {
        get()._updateConversation(typedData.conversationId, typedData.updates);
      }
    });

    // Listen for new conversation notifications (real-time)
    conversationService.onNewConversationNotification((data: unknown) => {
      const typedData = data as { conversation: Conversation };
      // Refresh conversations list to include new conversation
      get()._addConversation(typedData.conversation);
    });

    // Listen for conversation deleted (real-time)
    conversationService.onConversationDeleted((data: unknown) => {
      const typedData = data as { conversationId: string };
      if (typedData.conversationId) {
        get()._removeConversation(typedData.conversationId);
      }
    });

    // Listen for unread count changes (real-time)
    conversationService.onUnreadCountChanged((data: unknown) => {
      const typedData = data as { conversationId: string; unreadCount: number };
      if (typedData.conversationId && typeof typedData.unreadCount === 'number') {
        get()._updateConversation(typedData.conversationId, { unreadCount: typedData.unreadCount });
        // Also update total unread count
        get().getTotalUnreadCount();
      }
    });


    // Listen for member joined
    conversationService.onMemberJoined((data: any) => {
      if (data.conversation) {
        get()._updateConversation(data.conversation._id, { participants: data.conversation.participants });
        toast.info(`${data.newMember?.displayName || data.newMember?.username || 'Thành viên'} đã tham gia nhóm`);

        // Refresh messages if current
        if (get().currentConversation?._id === data.conversation._id) {
          // @ts-ignore
          window.useMessageStore?.getState().getMessagesByCursor(data.conversation._id);
        }
      }
    });

    // Listen for member left
    conversationService.onMemberLeft((data: any) => {
      if (data.conversationId) {
        // Nếu là chính mình rời nhóm (qua device khác chẳng hạn)
        // @ts-ignore
        if (data.userId === useAuthStore.getState().user?._id) {
          get()._removeConversation(data.conversationId);
          toast.info("Bạn đã rời khỏi nhóm");
        } else {
          // Người khác rời nhóm
          if (data.updatedConversation) {
            get()._updateConversation(data.conversationId, { participants: data.updatedConversation.participants });
          }
          toast.info("Một thành viên đã rời nhóm");

          // Refresh messages if current
          if (get().currentConversation?._id === data.conversationId) {
            // @ts-ignore
            window.useMessageStore?.getState().getMessagesByCursor(data.conversationId);
          }
        }
      }
    });

    // Listen for member removed
    conversationService.onMemberRemoved((data: any) => {
      if (data.conversationId) {
        // Kiểm tra xem có phải mình bị xóa không
        const currentUserId = (useAuthStore.getState().user as any)?._id;

        if (data.participantId === currentUserId || !data.participantId) {
          // Là mình bị xóa (hoặc đây là unicast cho mình)
          get()._removeConversation(data.conversationId);
          toast.warning(data.message || "Bạn đã bị xóa khỏi nhóm");

          // Nếu đang mở group đó thì đóng lại
          if (get().currentConversation?._id === data.conversationId) {
            set({ currentConversation: null });
          }
        } else {
          // Người khác bị xóa
          if (data.updatedConversation) {
            get()._updateConversation(data.conversationId, { participants: data.updatedConversation.participants });
          }
          toast.info(data.message || "Một thành viên đã bị xóa khỏi nhóm");

          // Refresh messages if current
          if (get().currentConversation?._id === data.conversationId) {
            // @ts-ignore
            window.useMessageStore?.getState().getMessagesByCursor(data.conversationId);
          }
        }
      }
    });

    set({ _listenersSetup: true });
  },

  /**
   * Remove real-time Socket listeners
   */
  removeSocketListeners: () => {
    conversationService.removeAllListeners();
    set({ _listenersSetup: false });
  },

  // ==================== INTERNAL STATE SETTERS ====================

  /**
   * Set conversations list
   */
  _setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  /**
   * Add conversation to list
   */
  _addConversation: (conversation: Conversation) => {
    const state = get();
    const exists = state.conversations.find(c => c._id === conversation._id);
    if (!exists) {
      set({ conversations: [conversation, ...state.conversations] });
    }
  },

  /**
   * Update conversation in list
   */
  _updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
    const state = get();
    const conversationIndex = state.conversations.findIndex(c => c._id === conversationId);

    if (conversationIndex !== -1) {
      const updatedConversations = [...state.conversations];
      updatedConversations[conversationIndex] = { ...updatedConversations[conversationIndex], ...updates };
      set({ conversations: updatedConversations });

      // Also update current conversation if it matches
      if (state.currentConversation?._id === conversationId) {
        set({ currentConversation: { ...state.currentConversation, ...updates } });
      }
    }
  },

  /**
   * Remove conversation from list
   */
  _removeConversation: (conversationId: string) => {
    const state = get();
    const filteredConversations = state.conversations.filter(c => c._id !== conversationId);

    set({
      conversations: filteredConversations,
      currentConversation: state.currentConversation?._id === conversationId ? null : state.currentConversation
    });
  },

  /**
   * Set search results
   */
  _setSearchResults: (results: Conversation[]) => {
    set({ searchResults: results });
  },

  /**
   * Set total unread count
   */
  _setTotalUnreadCount: (count: number) => {
    set({ totalUnreadCount: count });
  }
}));

export default useConversationStore;