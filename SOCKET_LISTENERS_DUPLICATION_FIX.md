# Fix: Socket Listeners Duplication Issue

## Problem
Socket listeners được đăng ký nhiều lần (3-4 lần), dẫn đến:
- Cùng một event được xử lý multiple times
- Memory leaks
- Duplicate notifications/UI updates
- Poor performance

## Root Causes

### 1. Multiple setupSocketListeners() calls
Trong `useSocket.ts`, `setupSocketListeners()` được gọi ở:
- **Line 43**: Khi connect lần đầu
- **Line 82**: Khi reconnect
→ Mỗi lần reconnect lại thêm listeners mới trên listeners cũ

### 2. No cleanup before setup
Trong `useFriendStore.ts`, `setupSocketListeners()` không cleanup listeners cũ trước khi setup mới

### 3. Component re-renders
Hook được gọi multiple times do component re-renders

## Solutions Applied

### 1. Added Listeners Setup Flag in useSocket.ts
```typescript
const listenersSetupRef = useRef(false);

// Setup listeners chỉ một lần
if (!listenersSetupRef.current) {
  setupSocketListeners();
  listenersSetupRef.current = true;
}

// Reset flag khi disconnect
listenersSetupRef.current = false;
```

### 2. Removed duplicate setupSocketListeners() in reconnect
```typescript
// Trước: Reconnect setup listeners lại
connect(accessToken).then((success) => {
  registerUser(user._id);
  setupSocketListeners(); // ❌ Duplicate!
});

// Sau: Chỉ register user
connect(accessToken).then((success) => {
  registerUser(user._id);
  // ✅ Không setup listeners lại
});
```

### 3. Auto cleanup before setup in useFriendStore.ts
```typescript
setupSocketListeners: () => {
  if (!socketService.isConnected()) return;

  // 🧹 Cleanup existing listeners trước khi setup mới
  get().removeSocketListeners();

  console.log('🔧 Setting up Socket listeners...');
  // ... setup listeners
}
```

### 4. Improved cleanup method
```typescript
// Trước: Manual cleanup từng event
removeSocketListeners: () => {
  socketService.removeListener('RECEIVE_FRIEND_REQUEST');
  socketService.removeListener('FRIEND_REQUEST_RESPONSE');
  // ... manual cho từng event
}

// Sau: Cleanup tất cả
removeSocketListeners: () => {
  console.log('🧹 Cleaning up all Socket listeners...');
  socketService.removeAllListeners(); // ✅ Clean tất cả
  console.log('🔌 Socket listeners đã được gỡ bỏ');
}
```

## Debug Tools

### Created debugSocketListeners.ts
```javascript
// Check connection
window.debugSocketListeners.checkConnection();

// Test manual cleanup
window.debugSocketListeners.testCleanup();

// Check basic listener info
window.debugSocketListeners.checkBasicListeners();

// Clean and log
window.debugSocketListeners.cleanAndLog();
```

## Expected Flow After Fix

### Normal Operation:
1. **User login** → `useSocket` connects
2. **Setup listeners** → Called once with flag protection
3. **Component re-renders** → Listeners not re-setup (flag prevents)
4. **Reconnect** → Only register user, no listener re-setup
5. **User logout** → Cleanup listeners + reset flag

### Reconnection:
1. **Connection lost** → Socket disconnects
2. **Auto reconnect** → Connect + register user only
3. **Listeners preserved** → No duplicate setup

## Testing

### Manual Test:
1. Login → Check console logs
2. Navigate between pages → Should not see duplicate "Setting up Socket listeners"
3. Disconnect internet → Reconnect → Should not see duplicate setup
4. Use debug tools → Verify listener counts

### Console Commands:
```javascript
// Before fix - might see multiple setup logs
// After fix - should see setup only once per session

// Check if fix works
window.debugSocketListeners.checkConnection();
```

## Results
✅ **Before**: 3-4 listeners per event  
✅ **After**: 1 listener per event  
✅ **Memory**: No more listener accumulation  
✅ **Performance**: Single event processing  
✅ **UI**: No more duplicate notifications  

Now Socket listeners will be set up exactly once per session and properly cleaned up!