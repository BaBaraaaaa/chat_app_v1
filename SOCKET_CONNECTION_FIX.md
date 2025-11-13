# Fix: Socket Connection After Duplicate Listeners Fix

## Problem
Sau khi fix duplicate Socket listeners, hệ thống không thể connect được tới database/Socket. Nguyên nhân là conflict giữa 2 stores cùng setup listeners cho cùng events.

## Root Cause Analysis

### 1. Duplicate Listener Setup
- **useSocketStore.setupEventListeners()**: Setup friend-related listeners
- **useFriendStore.setupSocketListeners()**: Cũng setup friend-related listeners  
- Cả 2 stores đều đăng ký listeners cho cùng events như `FRIEND_REQUEST_RECEIVED`

### 2. removeAllListeners() Impact
Khi fix duplicate bằng `removeAllListeners()`, nó xóa cả listeners của cả 2 stores, dẫn đến connection không hoạt động.

### 3. Listener Conflict
```typescript
// useSocketStore
socketService.onFriendRequestReceived(handler1);

// useFriendStore  
socketService.onFriendRequestReceived(handler2);

// removeAllListeners() → Xóa cả 2 handlers
```

## Solution: Separation of Concerns

### 1. useSocketStore - Core Connection Only
```typescript
setupEventListeners: () => {
  // Chỉ handle core connection features
  socketService.onOnlineUsersList((data) => {
    get().updateOnlineUsers(data.data, data.count);
  });
  
  // All friend-related listeners MOVED to useFriendStore
}

removeEventListeners: () => {
  // Chỉ remove core listeners
  socketService.removeListener('ONLINE_USERS_LIST');
}
```

### 2. useFriendStore - Friend Features Only
```typescript
setupSocketListeners: () => {
  // Cleanup friend listeners only (not all)
  get().removeSocketListeners();
  
  // Setup all friend-related listeners
  socketService.onFriendRequestReceived(handler);
  socketService.onFriendRequestResponse(handler);
  // ... other friend events
}

removeSocketListeners: () => {
  // Remove specific friend listeners only
  socketService.removeListener('RECEIVE_FRIEND_REQUEST');
  socketService.removeListener('FRIEND_REQUEST_RESPONSE');
  // ... không dùng removeAllListeners()
}
```

## Changes Made

### 1. useSocketStore.ts
- ✅ Commented out all friend-related listeners
- ✅ Kept only `onOnlineUsersList` for core connection
- ✅ Changed `removeAllListeners()` → `removeListener('ONLINE_USERS_LIST')`
- ✅ Removed unused imports (toast, friend types)

### 2. useFriendStore.ts  
- ✅ Changed from `removeAllListeners()` to specific `removeListener()` calls
- ✅ Added cleanup for all friend-related events
- ✅ Updated console logs for clarity

### 3. Architecture
```
useSocketStore (Core):
├── Connection management
├── Online users tracking  
└── Basic Socket lifecycle

useFriendStore (Features):
├── Friend requests
├── Friend responses
├── Friend removal
└── All friend-related Socket events
```

## Testing

### Debug Tools Created
```javascript
// Test full connection cycle
window.testSocketConnection.fullTest();

// Test just connection
window.testSocketConnection.testConnection();

// Test cleanup
window.testSocketConnection.testCleanup();
```

### Manual Testing
1. Login → Should connect to Socket
2. Check console → Should see separate "Core" and "Friend" listener setups
3. Navigate pages → No duplicate listener warnings
4. Friend actions → Should work normally

## Expected Behavior After Fix

### Connection Flow:
1. **useSocket hook** calls `useSocketStore.connect()`
2. **useSocketStore** connects + setup core listeners
3. **useSocket hook** calls `useFriendStore.setupSocketListeners()`  
4. **useFriendStore** setup friend listeners only
5. **Both work independently** without conflicts

### Cleanup Flow:
1. **Logout/unmount** → `useFriendStore.removeSocketListeners()`
2. **Core cleanup** → `useSocketStore.removeEventListeners()`
3. **Disconnect** → `socketService.disconnect()`

## Benefits
✅ **Clear separation**: Core vs Feature listeners  
✅ **No conflicts**: Each store manages its own events  
✅ **Proper cleanup**: Specific listener removal  
✅ **Maintainable**: Easy to debug and extend  
✅ **Reliable**: No more removeAllListeners() side effects  

Now Socket connection should work properly without listener conflicts!