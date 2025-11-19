/**
 * Conversation Store - Zustand State Management
 * Manages conversation state with REST API and real-time Socket updates
 */

import { create } from "zustand";
import { toast } from "sonner";
import { conversationService } from "@/socket/conversationService"; // Real-time only
import { conversationApiService } from "@/services/conversationApiService"; // REST API
import type { 
  Conversation,
  ConversationUpdatedResponse,
  ConversationErrorResponse,
  UserTypingResponse
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
  getConversations: () => Promise<void>;
  getConversationDetail: (conversationId: string) => Promise<void>;
  searchConversations: (query: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  getTotalUnreadCount: () => Promise<void>;
  resetUnreadCount: (conversationId: string) => Promise<void>;
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
        console.log('[data ]', response.data);
        const conversation = response.data ;
        
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
   * Lấy danh sách conversations (REST API)
   */
  getConversations: async () => {
    try {
      set({ loading: true });
      const response = await conversationApiService.getConversations();
      
      if (response.success) {
        set({ conversations: response.data });
        console.log(`📋 Loaded ${response.data?.length} conversations`);
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
        console.log(`🔍 Found ${response.data?.length} conversations for "${query}"`);
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
      
      if (response.success) {
        set({ totalUnreadCount: response.data });
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
      console.log("⚠️ Real-time conversation listeners already setup, skipping...");
      return;
    }

    console.log("🔧 Setting up real-time conversation Socket listeners...");

    // Listen for conversation updates (real-time)
    conversationService.onConversationUpdated((data: unknown) => {
      const typedData = data as ConversationUpdatedResponse;
      console.log("🔄 Conversation updated (real-time):", typedData);
      if (typedData.conversationId && typedData.updates) {
        get()._updateConversation(typedData.conversationId, typedData.updates);
      }
    });

    // Listen for new conversation notifications (real-time)
    conversationService.onNewConversationNotification((data: unknown) => {
      const typedData = data as { conversation: Conversation };
      console.log("🆕 New conversation notification:", typedData);
      // Refresh conversations list to include new conversation
      get()._addConversation(typedData.conversation);
    });

    // Listen for conversation deleted (real-time)
    conversationService.onConversationDeleted((data: unknown) => {
      const typedData = data as { conversationId: string };
      console.log("🗑️ Conversation deleted (real-time):", typedData);
      if (typedData.conversationId) {
        get()._removeConversation(typedData.conversationId);
      }
    });

    // Listen for unread count changes (real-time)
    conversationService.onUnreadCountChanged((data: unknown) => {
      const typedData = data as { conversationId: string; unreadCount: number };
      console.log("📬 Unread count changed (real-time):", typedData);
      if (typedData.conversationId && typeof typedData.unreadCount === 'number') {
        get()._updateConversation(typedData.conversationId, { unreadCount: typedData.unreadCount });
        // Also update total unread count
        get().getTotalUnreadCount();
      }
    });

    // Listen for typing indicators (real-time)
    conversationService.onUserTyping((data: unknown) => {
      const typedData = data as UserTypingResponse;
      console.log("⌨️ User typing (real-time):", typedData);
      // Handle typing indicators in UI
    });

    conversationService.onUserStoppedTyping((data: unknown) => {
      const typedData = data as UserTypingResponse;
      console.log("⌨️ User stopped typing (real-time):", typedData);
      // Handle typing indicators in UI
    });

    // Listen for conversation errors (real-time)
    conversationService.onConversationError((data: unknown) => {
      const typedData = data as ConversationErrorResponse;
      console.error("❌ Conversation error (real-time):", typedData);
      if (typedData.message) {
        toast.error(typedData.message);
      }
    });

    console.log("✅ Real-time conversation listeners setup complete");
    set({ _listenersSetup: true });
  },

  /**
   * Remove real-time Socket listeners
   */
  removeSocketListeners: () => {
    console.log("🧹 Removing real-time conversation Socket listeners...");
    conversationService.removeAllListeners();
    set({ _listenersSetup: false });
    console.log("✅ Real-time conversation Socket listeners removed");
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