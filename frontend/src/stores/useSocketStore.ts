import { create } from 'zustand';
import { socketService } from '@/services/socketService';
import type { 
  FriendRequest, 
  User,
  OnlineUsersListData
} from '@/types/socket';

interface SocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Online users
  onlineUsers: string[];
  onlineCount: number;
  
  // Real-time notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Internal flag to prevent duplicate listener setup
  _coreListenersSetup: boolean;
  
  // Internal flag to prevent duplicate user registration
  _userRegistered: boolean;
  
  // Actions
  connect: (token?: string) => Promise<boolean>;
  disconnect: () => void;
  registerUser: (userId: string) => void;
  setupEventListeners: () => void;
  removeEventListeners: () => void;
  
  // Friend request actions via socket
  sendFriendRequestSocket: (toUserId: string, fromUserId: string, message?: string) => void;
  respondToFriendRequestSocket: (requestId: string, response: "accepted" | "declined", userId: string) => void;
  cancelFriendRequestSocket: (requestId: string, userId: string) => void;
  
  // Notification management
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: () => void;
  
  // Online users management
  updateOnlineUsers: (users: string[], count: number) => void;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accepted' | 'friend_declined' | 'friend_cancelled';
  title: string;
  message: string;
  data?: FriendRequest | User;
  timestamp: Date;
  read: boolean;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  onlineUsers: [],
  onlineCount: 0,
  notifications: [],
  unreadCount: 0,
  _coreListenersSetup: false,
  _userRegistered: false,

  // === CONNECTION ACTIONS ===
  connect: async (token?: string): Promise<boolean> => {
    try {
      set({ isConnecting: true, connectionError: null });
      
      await socketService.connect(token);
      
      set({ 
        isConnected: true, 
        isConnecting: false,
        connectionError: null 
      });
      
      // Setup event listeners after successful connection
      get().setupEventListeners();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      set({ 
        isConnected: false, 
        isConnecting: false,
        connectionError: errorMessage 
      });
      console.error('Socket connection failed:', error);
      return false;
    }
  },

  disconnect: () => {
    get().removeEventListeners();
    socketService.disconnect();
    set({ 
      isConnected: false, 
      isConnecting: false,
      connectionError: null,
      onlineUsers: [],
      onlineCount: 0,
      _userRegistered: false // ✅ Reset registration flag
    });
  },

  registerUser: (userId: string) => {
    const state = get();
    
    // ✅ Prevent duplicate registration
    if (state._userRegistered) {
      console.log('⚠️ User already registered in store, skipping...');
      return;
    }
    
    socketService.registerUserOnline(userId);
    set({ _userRegistered: true });
  },

  // === EVENT LISTENERS SETUP ===
  setupEventListeners: () => {
    const state = get();
    
    // Prevent duplicate setup
    if (state._coreListenersSetup) {
      console.log('⚠️ Core listeners already setup, skipping...');
      return;
    }

    console.log('🔧 Setting up core Socket connection listeners...');

    // === CORE CONNECTION LISTENERS ONLY ===
    
    // Online users list - Core connection feature
    socketService.onOnlineUsersList((data: OnlineUsersListData) => {
      console.log('👥 Online users updated:', data);
      get().updateOnlineUsers(data.data, data.count);
    });
    
    // Mark as setup
    set({ _coreListenersSetup: true });
    
    // Request initial online users list
    socketService.getOnlineUsers();
    
    console.log('✅ Core Socket listeners setup complete');
  },

  removeEventListeners: () => {
    console.log('🧹 Removing core Socket listeners...');
    // Only remove specific listeners, not all
    socketService.removeListener('ONLINE_USERS_LIST');
    // Reset flag so listeners can be re-setup on reconnect
    set({ _coreListenersSetup: false });
    console.log('✅ Core Socket listeners removed');
  },

  // === SOCKET ACTIONS ===
  sendFriendRequestSocket: (toUserId: string, fromUserId: string, message?: string) => {
    socketService.sendFriendRequest({
      fromUserId,
      toUserId,
      message
    });
  },

  respondToFriendRequestSocket: (requestId: string, response: "accepted" | "declined") => {
    socketService.respondToFriendRequest({
      requestId,
      response
    });
  },

  cancelFriendRequestSocket: (requestId: string) => {
    socketService.cancelFriendRequest(requestId);
  },

  // === NOTIFICATION MANAGEMENT ===
  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  removeNotification: (id: string) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };
    });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  markAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  // === ONLINE USERS MANAGEMENT ===
  updateOnlineUsers: (users: string[], count: number) => {
    console.log('👥 Updating online users:', { users, count, previousCount: get().onlineCount });
    set({ onlineUsers: users, onlineCount: count });
  }
}));

export default useSocketStore;