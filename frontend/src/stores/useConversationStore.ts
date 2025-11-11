/**
 * Conversation Store - Zustand State Management
 * Manages conversation state and Socket.IO listeners
 */

import { create } from "zustand";
import { toast } from "sonner";
import { conversationService } from "@/services/conversationService";
import type { Conversation } from "@/types/message";

interface ConversationState {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  searchResults: Conversation[];
  totalUnreadCount: number;
  _listenersSetup: boolean;

  // Actions
  getOrCreateConversation: (otherUserId: string) => void;
  getConversations: () => void;
  getConversationDetail: (conversationId: string) => void;
  searchConversations: (query: string) => void;
  deleteConversation: (conversationId: string) => void;
  getTotalUnreadCount: () => void;
  resetUnreadCount: (conversationId: string) => void;
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

  // ==================== ACTIONS ====================

  /**
   * Tạo hoặc lấy conversation
   */
  getOrCreateConversation: (otherUserId: string) => {
    if (!conversationService.isConnected()) {
      toast.error("Không thể tạo cuộc hội thoại. Vui lòng kiểm tra kết nối.");
      return;
    }
    set({ loading: true });
    conversationService.getOrCreateConversation({ otherUserId });
  },

  /**
   * Lấy danh sách conversations
   */
  getConversations: () => {
    if (!conversationService.isConnected()) {
      console.warn("⚠️ Socket chưa kết nối, đợi kết nối để lấy conversations");
      return;
    }
    set({ loading: true });
    conversationService.getConversations();
  },

  /**
   * Lấy chi tiết conversation
   */
  getConversationDetail: (conversationId: string) => {
    if (!conversationService.isConnected()) {
      console.warn("⚠️ Socket chưa kết nối");
      return;
    }
    conversationService.getConversationDetail({ conversationId });
  },

  /**
   * Tìm kiếm conversations
   */
  searchConversations: (query: string) => {
    if (!conversationService.isConnected()) {
      toast.error("Không thể tìm kiếm. Vui lòng kiểm tra kết nối.");
      return;
    }
    conversationService.searchConversations({ query });
  },

  /**
   * Xóa conversation
   */
  deleteConversation: (conversationId: string) => {
    conversationService.deleteConversation({ conversationId });
    // Optimistic update
    get()._removeConversation(conversationId);
  },

  /**
   * Lấy tổng số tin nhắn chưa đọc
   */
  getTotalUnreadCount: () => {
    if (!conversationService.isConnected()) {
      return;
    }
    conversationService.getTotalUnreadCount();
  },

  /**
   * Reset unread count
   */
  resetUnreadCount: (conversationId: string) => {
    conversationService.resetUnreadCount({ conversationId });
    // Optimistic update
    get()._updateConversation(conversationId, { unreadCount: 0 });
  },

  /**
   * Set current conversation
   */
  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
  },

  /**
   * Clear search results
   */
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // ==================== SOCKET LISTENERS ====================

  /**
   * Setup Socket listeners
   */
  setupSocketListeners: () => {
    if (get()._listenersSetup) {
      console.log("⚠️ Conversation listeners đã được setup, bỏ qua...");
      return;
    }

    get().removeSocketListeners();

    console.log("🔧 Đang thiết lập conversation Socket listeners...");

    // Listen for conversation created
    conversationService.onConversationCreated((data) => {
      console.log("✅ Conversation created:", data);
      if (data.success && data.data) {
        get()._addConversation(data.data);
        get().setCurrentConversation(data.data);
        set({ loading: false });
      } else {
        set({ loading: false });
      }
    });

    // Listen for conversations list
    conversationService.onConversationsList((data) => {
      console.log("📬 Nhận danh sách conversations:", data);
      if (data.success && data.data) {
        get()._setConversations(data.data);
        set({ loading: false });
      } else {
        set({ loading: false });
        toast.error("Không thể tải danh sách cuộc hội thoại");
      }
    });

    // Listen for conversation detail
    conversationService.onConversationDetail((data) => {
      console.log("📋 Chi tiết conversation:", data);
      if (data.success && data.data) {
        get().setCurrentConversation(data.data);
      }
    });

    // Listen for search results
    conversationService.onSearchConversationsResult((data) => {
      console.log("🔍 Kết quả tìm kiếm:", data);
      if (data.success && data.data) {
        get()._setSearchResults(data.data);
      } else {
        toast.error("Không thể tìm kiếm");
      }
    });

    // Listen for delete success
    conversationService.onDeleteConversationSuccess((data) => {
      console.log("✅ Xóa conversation thành công:", data);
      if (data.success) {
        toast.success("Đã xóa cuộc hội thoại");
      }
    });

    // Listen for total unread count
    conversationService.onTotalUnreadCount((data) => {
      console.log("📊 Tổng unread count:", data);
      if (data.success && data.data) {
        get()._setTotalUnreadCount(data.data.totalUnread);
      }
    });

    // Listen for reset unread count success
    conversationService.onResetUnreadCountSuccess((data) => {
      console.log("✅ Reset unread count thành công:", data);
    });

    // Listen for errors
    conversationService.onConversationError((data) => {
      console.error("❌ Lỗi conversation:", data);
      toast.error(data.message);
      set({ loading: false });
    });

    conversationService.onConversationsError((data) => {
      console.error("❌ Lỗi lấy conversations:", data);
      toast.error(data.message);
      set({ loading: false });
    });

    console.log("✅ Đã thiết lập xong conversation Socket listeners");
    set({ _listenersSetup: true });
  },

  /**
   * Remove Socket listeners
   */
  removeSocketListeners: () => {
    console.log("🧹 Đang xóa conversation Socket listeners...");
    conversationService.removeAllListeners();
    set({ _listenersSetup: false });
    console.log("✅ Đã xóa xong conversation Socket listeners");
  },

  // ==================== INTERNAL STATE SETTERS ====================

  /**
   * Set conversations
   */
  _setConversations: (conversations: Conversation[]) => {
    set({ conversations: [...conversations] }); // ✅ Tạo array mới để trigger re-render
  },

  /**
   * Add new conversation
   */
  _addConversation: (conversation: Conversation) => {
    set(state => {
      // Kiểm tra conversation đã tồn tại chưa
      if (state.conversations.some(c => c._id === conversation._id)) {
        return state;
      }
      return {
        conversations: [conversation, ...state.conversations]
      };
    });
  },

  /**
   * Update conversation
   */
  _updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c._id === conversationId ? { ...c, ...updates } : c
      ),
      currentConversation:
        state.currentConversation?._id === conversationId
          ? { ...state.currentConversation, ...updates }
          : state.currentConversation
    }));
  },

  /**
   * Remove conversation
   */
  _removeConversation: (conversationId: string) => {
    set(state => ({
      conversations: state.conversations.filter(c => c._id !== conversationId),
      currentConversation:
        state.currentConversation?._id === conversationId
          ? null
          : state.currentConversation
    }));
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
  },
}));
