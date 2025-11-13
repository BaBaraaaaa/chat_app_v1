// Test remove friend Socket functionality
import { socketService } from '@/services/socketService';

export const testRemoveFriend = {
  // Test Socket connection
  testConnection: () => {
    console.log('Socket connected:', socketService.isConnected());
    console.log('Socket:', socketService.getSocket()?.id);
  },

  // Test remove friend emit
  testRemoveFriend: (friendId: string) => {
    console.log('Sending REMOVE_FRIEND event with friendId:', friendId);
    socketService.removeFriend({ friendId });
  },

  // Test listeners
  setupTestListeners: () => {
    socketService.onFriendRemoved((data) => {
      console.log('TEST: Received FRIEND_REMOVED:', data);
    });

    socketService.onRemoveFriendSuccess((data) => {
      console.log('TEST: Received REMOVE_FRIEND_SUCCESS:', data);
    });

    socketService.onRemoveFriendError((data) => {
      console.log('TEST: Received REMOVE_FRIEND_ERROR:', data);
    });

    console.log('Test listeners setup complete');
  },

  // Cleanup test listeners
  cleanupTestListeners: () => {
    socketService.removeListener('FRIEND_REMOVED');
    socketService.removeListener('REMOVE_FRIEND_SUCCESS');
    socketService.removeListener('REMOVE_FRIEND_ERROR');
    console.log('Test listeners cleaned up');
  }
};

// Make it available globally for testing
declare global {
  interface Window {
    testRemoveFriend: typeof testRemoveFriend;
  }
}

window.testRemoveFriend = testRemoveFriend;