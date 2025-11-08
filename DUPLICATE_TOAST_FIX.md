# Fix: Duplicate Toast Notifications in Socket CRUD Operations

## Problem
Khi thực hiện CRUD operations qua Socket, users thấy multiple toast notifications thay vì chỉ 1 toast, dẫn đến trải nghiệm không tốt.

## Root Causes

### 1. Double Toast Sources
```typescript
// Action method shows toast
removeFriend: async (friendId: string) => {
  socketService.removeFriend({ friendId });
  toast.success("Đã xóa bạn bè!"); // ❌ Toast #1
}

// Socket listener cũng shows toast  
socketService.onRemoveFriendSuccess((data) => {
  toast.success(data.message); // ❌ Toast #2
});
```

### 2. Potential Duplicate Listeners
Listeners có thể được setup multiple times do component re-renders hoặc reconnections.

### 3. No Toast Deduplication
Không có mechanism để prevent same toast message trong thời gian ngắn.

## Solutions Applied

### 1. Remove Toast from Action Methods (Socket Path)
Khi sử dụng Socket, chỉ để Socket listeners handle toast notifications.

#### Before:
```typescript
removeFriend: async (friendId: string) => {
  if (socketService.isConnected()) {
    socketService.removeFriend({ friendId });
    toast.success("Đã xóa bạn bè!"); // ❌ Duplicate
  }
}
```

#### After:
```typescript
removeFriend: async (friendId: string) => {
  if (socketService.isConnected()) {
    socketService.removeFriend({ friendId });
    // ✅ Socket listener sẽ handle toast
  } else {
    // Chỉ show toast cho REST API fallback
    toast.success("Đã xóa bạn bè!");
  }
}
```

### 2. Added Listener Setup Protection
Thêm flag để đảm bảo listeners chỉ được setup một lần.

#### FriendState Interface:
```typescript
export interface FriendState {
  // ... existing fields
  _listenersSetup: boolean; // ✅ New flag
}
```

#### Setup Logic:
```typescript
setupSocketListeners: () => {
  // 🛡️ Tránh setup duplicate listeners
  if (get()._listenersSetup) {
    console.log('⚠️ Socket listeners đã được setup, bỏ qua...');
    return;
  }
  
  // Setup listeners...
  
  // 🏁 Đánh dấu listeners đã được setup
  set({ _listenersSetup: true });
}

removeSocketListeners: () => {
  // Remove listeners...
  
  // 🔄 Reset setup flag
  set({ _listenersSetup: false });
}
```

### 3. Created Toast Deduplication Utility
Tạo utility để prevent duplicate toast messages trong thời gian ngắn.

#### debouncedToast.ts:
```typescript
class ToastManager {
  private recentToasts = new Map<string, number>();
  private DEBOUNCE_TIME = 1000; // 1 second

  success(message: string): void {
    const key = this.getToastKey('success', message);
    if (this.shouldShowToast(key)) {
      toast.success(message);
    }
  }
  
  // Prevents same message within 1 second
}

export const debouncedToast = new ToastManager();
```

## Changes Summary

### Files Modified:

#### 1. useFriendStore.ts
- ✅ Removed toast from `removeFriend()` Socket path
- ✅ Removed toast from `sendFriendRequest()` Socket path  
- ✅ Removed toast from `acceptFriendRequest()` Socket path
- ✅ Added `_listenersSetup` flag protection
- ✅ Set/reset flag in setup/cleanup methods

#### 2. type/store.ts
- ✅ Added `_listenersSetup: boolean` to FriendState interface

#### 3. utils/debouncedToast.ts
- ✅ Created new toast deduplication utility

## Expected Behavior After Fix

### Socket CRUD Flow:
1. **User action** → Method called (no immediate toast)
2. **Socket emit** → Send event to server
3. **Server response** → Socket listener receives event
4. **Single toast** → Only listener shows notification

### Listener Protection:
1. **First setup** → Listeners installed, flag = true
2. **Subsequent calls** → Protected by flag, no duplicate setup
3. **Cleanup** → Listeners removed, flag = false

### Toast Deduplication:
1. **First toast** → Shown normally
2. **Duplicate within 1s** → Blocked by debounce
3. **After 1s** → New toast allowed

## Testing

### Manual Test Cases:
1. **Send friend request** → Should see only 1 success toast
2. **Accept friend request** → Should see only 1 success toast  
3. **Remove friend** → Should see only 1 success toast
4. **Navigate pages quickly** → No duplicate listener setup logs
5. **Multiple rapid actions** → No toast spam

### Debug Tools:
```javascript
// Check listener setup status
useFriendStore.getState()._listenersSetup

// Test debounced toast
import { debouncedToast } from '@/utils/debouncedToast';
debouncedToast.success("Test message"); // Multiple calls = 1 toast
```

## Results
✅ **Before**: 2-3 toasts per action  
✅ **After**: 1 toast per action  
✅ **Listener protection**: No duplicate setup  
✅ **Toast deduplication**: Available for future use  
✅ **Clean architecture**: Clear separation between action and notification  

Now Socket CRUD operations will show exactly one toast notification per action!