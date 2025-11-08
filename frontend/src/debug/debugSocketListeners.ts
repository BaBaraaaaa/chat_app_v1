// Debug utility để check Socket listeners
import { socketService } from '@/services/socketService';

export const debugSocketListeners = {
  // Check socket connection và basic info
  checkConnection: () => {
    const socket = socketService.getSocket();
    console.log('🔍 Socket Debug Info:');
    console.log('Connected:', socketService.isConnected());
    console.log('Socket ID:', socket?.id);
    console.log('Socket exists:', !!socket);
  },

  // Manual cleanup test
  testCleanup: () => {
    console.log('🧹 Testing manual cleanup...');
    socketService.removeAllListeners();
    console.log('✅ All listeners removed');
  },

  // Simplified listener check
  checkBasicListeners: () => {
    const socket = socketService.getSocket();
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    console.log('📊 Socket Event Check:');
    console.log('Connected:', socket.connected);
    console.log('Socket has listeners:', socket.hasListeners);
    
    // Log a sample to see if we have duplicates
    console.log('Available events:', ['FRIEND_REQUEST_RECEIVED', 'FRIEND_REQUEST_RESPONSE']);
  },

  // Clean all listeners và log
  cleanAndLog: () => {
    console.log('🧹 Cleaning all listeners...');
    socketService.removeAllListeners();
    console.log('✅ Cleanup complete');
    
    setTimeout(() => {
      console.log('📊 After cleanup - reconnecting...');
    }, 100);
  }
};

// Make it available globally for debugging
declare global {
  interface Window {
    debugSocketListeners: typeof debugSocketListeners;
  }
}

window.debugSocketListeners = debugSocketListeners;

// Make it available globally for debugging
declare global {
  interface Window {
    debugSocketListeners: typeof debugSocketListeners;
  }
}

window.debugSocketListeners = debugSocketListeners;