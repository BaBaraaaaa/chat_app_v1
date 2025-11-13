# useSocketStore vs useFriendStore - Phân chia chức năng

## 🔌 useSocketStore - Core Socket Connection Management

### Chức năng chính:
Quản lý **connection Socket cơ bản** và các features liên quan đến connection.

### Responsibilities:
1. **Socket Connection Management**
   - `connect(token)`: Kết nối Socket với authentication
   - `disconnect()`: Ngắt kết nối Socket
   - `isConnected`: Trạng thái kết nối
   - `isConnecting`: Trạng thái đang kết nối
   - `connectionError`: Lỗi kết nối

2. **Online Users Tracking**
   - `onlineUsers[]`: Danh sách user đang online
   - `onlineCount`: Số lượng user online
   - `updateOnlineUsers()`: Cập nhật danh sách online

3. **General Notifications System** 
   - `notifications[]`: Tổng hợp tất cả thông báo
   - `unreadCount`: Số thông báo chưa đọc
   - `addNotification()`: Thêm thông báo
   - `removeNotification()`: Xóa thông báo
   - `clearNotifications()`: Xóa tất cả
   - `markAsRead()`: Đánh dấu đã đọc

4. **Core Socket Listeners**
   - `ONLINE_USERS_LIST`: Cập nhật danh sách user online

### Current State:
```typescript
// ✅ ACTIVE - Core connection features
setupEventListeners: () => {
  socketService.onOnlineUsersList((data) => {
    get().updateOnlineUsers(data.data, data.count);
  });
}

// ❌ COMMENTED OUT - Friend features moved to useFriendStore
// All friend-related listeners have been moved
```

---

## 👥 useFriendStore - Friend Management Features

### Chức năng chính:
Quản lý **tất cả features liên quan đến bạn bè** bao gồm REST API và real-time Socket events.

### Responsibilities:
1. **Friend Data Management**
   - `friends[]`: Danh sách bạn bè hiện tại
   - `receivedRequests[]`: Lời mời kết bạn nhận được
   - `sentRequests[]`: Lời mời kết bạn đã gửi
   - `loading`: Trạng thái loading

2. **REST API Friend Operations**
   - `getFriendsList()`: Lấy danh sách bạn bè
   - `getFriendRequests()`: Lấy lời mời nhận được
   - `getSentRequests()`: Lấy lời mời đã gửi
   - `sendFriendRequest()`: Gửi lời mời kết bạn
   - `acceptFriendRequest()`: Chấp nhận lời mời
   - `declineFriendRequest()`: Từ chối lời mời
   - `cancelFriendRequest()`: Hủy lời mời đã gửi
   - `removeFriend()`: Xóa bạn bè

3. **Socket-Enhanced Friend Operations**
   - Tất cả operations trên có phiên bản Socket để real-time updates
   - Optimistic UI updates + Socket confirmation
   - Fallback to REST API nếu Socket không available

4. **Real-time Socket Listeners**
   - `FRIEND_REQUEST_RECEIVED`: Nhận lời mời mới
   - `FRIEND_REQUEST_RESPONSE`: Phản hồi từ người khác
   - `FRIEND_REQUEST_PROCESSED`: Xử lý lời mời thành công
   - `FRIEND_REQUEST_CANCELLED`: Lời mời bị hủy
   - `CANCEL_FRIEND_REQUEST_SUCCESS`: Hủy lời mời thành công
   - `FRIEND_REMOVED`: Bị xóa bởi bạn bè
   - `REMOVE_FRIEND_SUCCESS`: Xóa bạn bè thành công
   - `REMOVE_FRIEND_ERROR`: Lỗi khi xóa bạn bè

### Current State:
```typescript
// ✅ ACTIVE - All friend-related Socket listeners
setupSocketListeners: () => {
  // Setup tất cả friend events
  socketService.onFriendRequestReceived(handler);
  socketService.onFriendRequestResponse(handler);
  socketService.onFriendRequestProcessed(handler);
  // ... và nhiều events khác
}
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   useSocket Hook                     │
│          (Orchestrates both stores)                 │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────┐    ┌──────▼────────┐
│ useSocketStore│    │ useFriendStore│
│   (Core)      │    │   (Features)  │
└───────────────┘    └───────────────┘
        │                   │
        │                   │
┌───────▼──────┐    ┌──────▼────────┐
│• Connection  │    │• Friend data  │
│• Online users│    │• Friend ops   │
│• Notifications│   │• Socket events│
│• Core events │    │• Real-time    │
└──────────────┘    └───────────────┘
```

## 🔄 Flow Example: Send Friend Request

### 1. User clicks "Send Friend Request"
```typescript
// Component calls useFriendStore
const { sendFriendRequest } = useFriendStore();
await sendFriendRequest(userId, message);
```

### 2. useFriendStore processes
```typescript
// Try Socket first, fallback to REST
if (socketService.isConnected()) {
  socketService.sendFriendRequest(data);
} else {
  await friendService.sendFriendRequest(data);
}
```

### 3. Real-time updates
```typescript
// useFriendStore listeners handle responses
socketService.onFriendRequestSent((data) => {
  toast.success(data.message);
  get().getSentRequests(); // Refresh UI
});
```

---

## 📝 Summary

| Store | Purpose | Current Role |
|-------|---------|--------------|
| **useSocketStore** | Core Socket infrastructure | Connection management, online users, general notifications |
| **useFriendStore** | Friend features | All friend operations + real-time Socket events |

### Key Benefits:
✅ **Separation of concerns**: Core vs Features  
✅ **No listener conflicts**: Each store handles different events  
✅ **Maintainable**: Clear responsibilities  
✅ **Scalable**: Easy to add new friend features to useFriendStore  

Hiện tại hệ thống đã được tối ưu để tránh duplicate listeners và có architecture rõ ràng!