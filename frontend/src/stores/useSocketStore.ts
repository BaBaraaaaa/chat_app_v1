import { create } from 'zustand';
import { socketService } from '@/socket/socketService';
import type { OnlineUsersListData } from '@/types/socket';

interface SocketState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Online users
  onlineUsers: string[];
  onlineCount: number;
  
  // Internal flags
  _coreListenersSetup: boolean;
  _userRegistered: boolean;
  
  // Core actions
  connect: (token?: string) => Promise<boolean>;
  disconnect: () => void;
  registerUser: (userId: string) => void;
  setupCoreListeners: () => void;
  removeCoreListeners: () => void;
  
  // Online users management
  updateOnlineUsers: (users: string[], count: number) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  onlineUsers: [],
  onlineCount: 0,
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
      
      // Setup core listeners after successful connection (cho phép tái kết nối)
      get().setupCoreListeners();
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
    get().removeCoreListeners();
    socketService.disconnect();
    set({ 
      isConnected: false, 
      isConnecting: false,
      connectionError: null,
      onlineUsers: [],
      onlineCount: 0,
      _userRegistered: false
    });
  },

  registerUser: (userId: string) => {
    const state = get();
    
    // Prevent duplicate registration
    if (state._userRegistered) {
      console.log('⚠️ User already registered in store, skipping...');
      return;
    }
    
    socketService.registerUserOnline(userId);
    set({ _userRegistered: true });
  },

  // === CORE EVENT LISTENERS SETUP ===
  setupCoreListeners: () => {
    const state = get();
    
    // Prevent duplicate setup
    if (state._coreListenersSetup) {
      console.log('⚠️ Core listeners already setup, skipping...');
      return;
    }

    console.log('🔧 Setting up core Socket listeners...');
    
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

  removeCoreListeners: () => {
    console.log('🧹 Removing core Socket listeners...');
    // Only remove core listeners
    socketService.removeListener('ONLINE_USERS_LIST');
    // Reset flag so listeners can be re-setup on reconnect
    set({ _coreListenersSetup: false });
    console.log('✅ Core Socket listeners removed');
  },

  // === ONLINE USERS MANAGEMENT ===
  updateOnlineUsers: (users: string[], count: number) => {
    console.log('👥 Updating online users:', { users, count, previousCount: get().onlineCount });
    set({ onlineUsers: users, onlineCount: count });
  }
}));

export default useSocketStore;