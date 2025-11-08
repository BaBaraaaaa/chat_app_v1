// Simple test để verify Socket connection không bị conflict
import { socketService } from '@/services/socketService';
import { useSocketStore } from '@/stores/useSocketStore';
import { useFriendStore } from '@/stores/useFriendStore';

export const testSocketConnection = {
  // Test basic connection
  testConnection: async () => {
    console.log('🧪 Testing Socket connection...');
    
    try {
      // Test socketService direct connection
      console.log('1. Testing socketService...');
      await socketService.connect();
      console.log('✅ SocketService connected:', socketService.isConnected());
      
      // Test store connection
      console.log('2. Testing useSocketStore...');
      const success = await useSocketStore.getState().connect();
      console.log('✅ UseSocketStore connected:', success);
      
      // Test friend store
      console.log('3. Testing useFriendStore...');
      if (socketService.isConnected()) {
        useFriendStore.getState().setupSocketListeners();
        console.log('✅ Friend listeners setup complete');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  },

  // Test cleanup
  testCleanup: () => {
    console.log('🧪 Testing cleanup...');
    
    // Cleanup friend listeners
    useFriendStore.getState().removeSocketListeners();
    console.log('✅ Friend listeners cleaned');
    
    // Cleanup core listeners
    useSocketStore.getState().removeEventListeners();
    console.log('✅ Core listeners cleaned');
    
    // Disconnect
    useSocketStore.getState().disconnect();
    console.log('✅ Socket disconnected');
  },

  // Full test cycle
  fullTest: async () => {
    console.log('🧪 Running full Socket test cycle...');
    
    // Connect
    const connected = await testSocketConnection.testConnection();
    if (!connected) return false;
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Cleanup
    testSocketConnection.testCleanup();
    
    console.log('✅ Full test cycle complete');
    return true;
  }
};

// Make available globally
declare global {
  interface Window {
    testSocketConnection: typeof testSocketConnection;
  }
}

window.testSocketConnection = testSocketConnection;