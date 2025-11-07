# Friend Request System - Tích hợp REST API và Socket.IO

## Tóm tắt

Đã thành công tích hợp hệ thống Friend Request giữa REST API và Socket.IO, tạo ra một hệ thống thống nhất và hiệu quả.

## Các file đã tạo/cập nhật

### 1. Service Layer
- ✅ `src/services/friendService.ts` - Service chung xử lý logic friend requests
- ✅ `src/services/notificationService.ts` - Quản lý thông báo real-time

### 2. Controller Layer  
- ✅ `src/controllers/friendsController.ts` - Đã cập nhật để sử dụng FriendService

### 3. Socket Layer
- ✅ `src/socket/registerFriendRequestHandler.ts` - Đã cập nhật để sử dụng FriendService và NotificationService

### 4. Type Definitions
- ✅ `src/types/friendTypes.ts` - Định nghĩa interfaces và types

### 5. Documentation
- ✅ `FRIEND_SYSTEM_DOCS.md` - Tài liệu chi tiết hệ thống
- ✅ `FRIEND_SYSTEM_DEMO.ts` - Ví dụ cách sử dụng

## Tính năng chính

### REST API Endpoints
- `GET /api/friends` - Lấy danh sách bạn bè
- `POST /api/friends/request` - Gửi lời mời kết bạn
- `POST /api/friends/accept/:requestId` - Chấp nhận lời mời
- `POST /api/friends/decline/:requestId` - Từ chối lời mời
- `DELETE /api/friends/cancel/:requestId` - Hủy lời mời đã gửi
- `GET /api/friends/requests` - Lấy lời mời nhận được
- `GET /api/friends/sent` - Lấy lời mời đã gửi

### Socket Events

#### Client → Server
- `SEND_FRIEND_REQUEST` - Gửi lời mời kết bạn
- `RESPOND_FRIEND_REQUEST` - Phản hồi lời mời (accept/decline)
- `CANCEL_FRIEND_REQUEST` - Hủy lời mời đã gửi
- `GET_FRIEND_REQUESTS` - Lấy danh sách lời mời
- `GET_FRIENDS_LIST` - Lấy danh sách bạn bè
- `GET_ONLINE_USERS` - Lấy users online (dev)

#### Server → Client
- `RECEIVE_FRIEND_REQUEST` - Nhận lời mời mới
- `FRIEND_REQUEST_SENT` - Xác nhận gửi lời mời
- `FRIEND_REQUEST_ERROR` - Lỗi gửi lời mời
- `FRIEND_REQUEST_RESPONSE` - Nhận phản hồi lời mời
- `RESPOND_FRIEND_REQUEST_SUCCESS` - Xác nhận phản hồi
- `RESPOND_FRIEND_REQUEST_ERROR` - Lỗi phản hồi
- `FRIEND_REQUEST_CANCELLED` - Nhận thông báo hủy lời mời
- `CANCEL_FRIEND_REQUEST_SUCCESS` - Xác nhận hủy lời mời
- `FRIEND_REQUESTS_LIST` - Danh sách lời mời
- `FRIENDS_LIST` - Danh sách bạn bè

## Lợi ích

1. **Thống nhất**: Cùng một logic cho cả REST API và Socket
2. **Real-time**: Thông báo tức thì cho users online  
3. **Type Safety**: Sử dụng TypeScript đầy đủ
4. **Maintainable**: Code tách biệt rõ ràng theo chức năng
5. **Scalable**: Dễ mở rộng thêm tính năng
6. **Error Handling**: Xử lý lỗi toàn diện

## Cách sử dụng

### Frontend (React/Vue/Angular)
```javascript
// Kết nối socket
const socket = io();
socket.emit("user:online", currentUserId);

// Gửi lời mời qua socket
socket.emit("SEND_FRIEND_REQUEST", {
  fromUserId: currentUserId,
  toUserId: targetUserId,
  message: "Hello!"
});

// Lắng nghe thông báo
socket.on("RECEIVE_FRIEND_REQUEST", (data) => {
  showNotification(data.message);
});

// Hoặc gửi qua REST API
fetch('/api/friends/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ toUserId: targetUserId, message: "Hello!" })
});
```

### Backend Service
```typescript
import { FriendService } from './services/friendService';

// Sử dụng service trực tiếp
const result = await FriendService.sendFriendRequest({
  fromUserId: "user1",
  toUserId: "user2",
  message: "Hello!"
});

if (result.success) {
  console.log("Sent successfully:", result.data);
} else {
  console.log("Error:", result.message);
}
```

## Testing

Xem file `FRIEND_SYSTEM_DOCS.md` để biết chi tiết cách test REST API và Socket events.

## Kế hoạch tiếp theo

1. Implement frontend components để sử dụng hệ thống
2. Thêm unit tests cho các services
3. Thêm integration tests cho socket events
4. Implement caching cho performance optimization
5. Thêm rate limiting cho API endpoints