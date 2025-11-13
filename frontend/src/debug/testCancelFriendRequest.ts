// Test cancel friend request Socket functionality
import { socketService } from '@/services/socketService';

export const testCancelFriendRequest = {
  // Test Socket connection
  testConnection: () => {
    console.log('Socket connected:', socketService.isConnected());
    console.log('Socket:', socketService.getSocket()?.id);
  },

  // Test cancel friend request emit
  testCancelFriendRequest: (requestId: string) => {
    console.log('Sending CANCEL_FRIEND_REQUEST event with requestId:', requestId);
    socketService.cancelFriendRequest(requestId);
  },

  // Test listeners for both sides
  setupTestListeners: () => {
    // For sender (person who cancels)
    socketService.onCancelFriendRequestSuccess((data) => {
      console.log('TEST: Received CANCEL_FRIEND_REQUEST_SUCCESS (sender):', data);
    });

    // For recipient (person who receives cancellation)
    socketService.onFriendRequestCancelled((data) => {
      console.log('TEST: Received FRIEND_REQUEST_CANCELLED (recipient):', data);
    });

    console.log('Cancel friend request test listeners setup complete');
  },

  // Cleanup test listeners
  cleanupTestListeners: () => {
    socketService.removeListener('CANCEL_FRIEND_REQUEST_SUCCESS');
    socketService.removeListener('FRIEND_REQUEST_CANCELLED');
    console.log('Cancel friend request test listeners cleaned up');
  }
};

// Make it available globally for testing
declare global {
  interface Window {
    testCancelFriendRequest: typeof testCancelFriendRequest;
  }
}

window.testCancelFriendRequest = testCancelFriendRequest;