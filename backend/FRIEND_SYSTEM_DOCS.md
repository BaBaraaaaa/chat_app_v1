# Friend Request System Documentation

## Tổng quan

Hệ thống Friend Request đã được tích hợp giữa REST API và Socket.IO để cung cấp trải nghiệm real-time cho người dùng. Hệ thống bao gồm:

1. **FriendService**: Service chung xử lý logic friend requests
2. **FriendController**: REST API endpoints
3. **Socket Handler**: Real-time events
4. **NotificationService**: Quản lý thông báo real-time

## Cấu trúc hệ thống

### 1. FriendService (`/services/friendService.ts`)

Chứa tất cả logic xử lý friend requests:

- `sendFriendRequest()`: Gửi lời mời kết bạn
- `acceptFriendRequest()`: Chấp nhận lời mời
- `declineFriendRequest()`: Từ chối lời mời  
- `cancelFriendRequest()`: Hủy lời mời đã gửi
- `getFriendRequests()`: Lấy danh sách lời mời nhận được
- `getSentFriendRequests()`: Lấy danh sách lời mời đã gửi
- `getFriendsList()`: Lấy danh sách bạn bè

### 2. REST API Endpoints (`/controllers/friendsController.ts`)

Tất cả endpoints sử dụng `FriendService`:

- `GET /api/friends` - Lấy danh sách bạn bè
- `POST /api/friends/request` - Gửi lời mời kết bạn
- `POST /api/friends/accept/:requestId` - Chấp nhận lời mời
- `POST /api/friends/decline/:requestId` - Từ chối lời mời
- `DELETE /api/friends/cancel/:requestId` - Hủy lời mời đã gửi
- `GET /api/friends/requests` - Lấy lời mời nhận được
- `GET /api/friends/sent` - Lấy lời mời đã gửi

### 3. Socket Events (`/socket/registerFriendRequestHandler.ts`)

#### Client to Server Events:

```typescript
// Gửi lời mời kết bạn
socket.emit("SEND_FRIEND_REQUEST", {
  fromUserId: "user_id",
  toUserId: "target_user_id", // hoặc toUsername
  toUsername: "target_username", // hoặc toUserId
  message: "Hello!"
});

// Phản hồi lời mời (chấp nhận/từ chối)
socket.emit("RESPOND_FRIEND_REQUEST", {
  requestId: "request_id", 
  response: "accepted", // hoặc "declined"
  userId: "current_user_id"
});

// Hủy lời mời đã gửi
socket.emit("CANCEL_FRIEND_REQUEST", {
  requestId: "request_id",
  userId: "current_user_id"
});

// Lấy danh sách lời mời
socket.emit("GET_FRIEND_REQUESTS", {
  userId: "current_user_id"
});

// Lấy danh sách bạn bè
socket.emit("GET_FRIENDS_LIST", {
  userId: "current_user_id"
});

// Lấy danh sách users online (dev)
socket.emit("GET_ONLINE_USERS");
```

#### Server to Client Events:

```typescript
// Nhận lời mời kết bạn mới
socket.on("RECEIVE_FRIEND_REQUEST", (data) => {
  // data.request: Thông tin request
  // data.message: "Bạn có lời mời kết bạn mới!"
});

// Xác nhận gửi lời mời thành công
socket.on("FRIEND_REQUEST_SENT", (data) => {
  // data.success: true/false
  // data.message: Thông báo
  // data.data: Thông tin request
});

// Lỗi khi gửi lời mời
socket.on("FRIEND_REQUEST_ERROR", (data) => {
  // data.success: false
  // data.message: Thông báo lỗi
  // data.hasReverseRequest: có lời mời ngược lại không
});

// Nhận phản hồi lời mời từ người khác
socket.on("FRIEND_REQUEST_RESPONSE", (data) => {
  // data.requestId: ID của request
  // data.response: "accepted" hoặc "declined"
  // data.responderId: ID người phản hồi
  // data.message: Thông báo
});

// Xác nhận phản hồi thành công
socket.on("RESPOND_FRIEND_REQUEST_SUCCESS", (data) => {
  // data.success: true
  // data.requestId, data.response, data.message, data.data
});

// Lỗi khi phản hồi
socket.on("RESPOND_FRIEND_REQUEST_ERROR", (data) => {
  // data.success: false
  // data.message: Thông báo lỗi
});

// Nhận thông báo lời mời bị hủy
socket.on("FRIEND_REQUEST_CANCELLED", (data) => {
  // data.requestId: ID request bị hủy
  // data.fromUserId: ID người hủy
  // data.message: Thông báo
});

// Danh sách lời mời
socket.on("FRIEND_REQUESTS_LIST", (data) => {
  // data.success: true/false
  // data.data: Array các lời mời
});

// Danh sách bạn bè
socket.on("FRIENDS_LIST", (data) => {
  // data.success: true/false
  // data.data.friends: Array bạn bè
});

// Danh sách users online
socket.on("ONLINE_USERS_LIST", (data) => {
  // data.success: true
  // data.data: Array user IDs online
  // data.count: Số lượng users online
});
```

## Notification Service (`/services/notificationService.ts`)

Quản lý thông báo real-time:

- `sendFriendRequestNotification()`: Gửi thông báo lời mời mới
- `sendFriendResponseNotification()`: Gửi thông báo phản hồi
- `sendFriendCancelNotification()`: Gửi thông báo hủy lời mời
- `isUserOnline()`: Kiểm tra user có online không
- `getOnlineUsers()`: Lấy danh sách users online

## Type Definitions (`/types/friendTypes.ts`)

Chứa các interface và type definitions cho:

- `FriendSocketEvents`: Socket event types
- `ApiResponse`: Response format chung
- `FriendRequestNotification`: Notification data structure

## Luồng hoạt động

### 1. Gửi lời mời kết bạn:

**REST API:**
```
POST /api/friends/request
Body: { toUserId: "...", message: "..." }
```

**Socket:**
```javascript
socket.emit("SEND_FRIEND_REQUEST", {
  fromUserId: "current_user",
  toUserId: "target_user", 
  message: "Hello!"
});
```

**Kết quả:**
- Lời mời được lưu vào database
- Người nhận (nếu online) nhận thông báo real-time
- Người gửi nhận xác nhận

### 2. Phản hồi lời mời:

**REST API:**
```
POST /api/friends/accept/:requestId
hoặc
POST /api/friends/decline/:requestId
```

**Socket:**
```javascript
socket.emit("RESPOND_FRIEND_REQUEST", {
  requestId: "...",
  response: "accepted", // hoặc "declined"
  userId: "current_user"
});
```

**Kết quả:**
- Request status được cập nhật
- Nếu accept: thêm vào danh sách bạn bè
- Người gửi lời mời (nếu online) nhận thông báo

### 3. Tích hợp Frontend

```javascript
// Kết nối socket
const socket = io();

// Đăng ký user online
socket.emit("user:online", currentUserId);

// Lắng nghe thông báo
socket.on("RECEIVE_FRIEND_REQUEST", (data) => {
  // Hiển thị thông báo lời mời mới
  showNotification(data.message);
  // Cập nhật UI
  updateFriendRequestsList();
});

socket.on("FRIEND_REQUEST_RESPONSE", (data) => {
  // Hiển thị thông báo phản hồi
  showNotification(data.message);
  // Cập nhật danh sách bạn bè nếu accepted
  if (data.response === "accepted") {
    updateFriendsList();
  }
});

// Gửi lời mời qua socket
function sendFriendRequest(targetUserId, message) {
  socket.emit("SEND_FRIEND_REQUEST", {
    fromUserId: currentUserId,
    toUserId: targetUserId,
    message: message
  });
}

// Hoặc qua REST API
async function sendFriendRequestAPI(targetUserId, message) {
  const response = await fetch('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUserId: targetUserId, message })
  });
  return response.json();
}
```

## Lợi ích của hệ thống mới

1. **Consistency**: Cùng một logic được sử dụng cho cả REST API và Socket
2. **Real-time**: Thông báo tức thì cho users online
3. **Fallback**: REST API làm fallback khi socket không khả dụng
4. **Maintainable**: Code được tách biệt rõ ràng theo chức năng
5. **Type Safety**: Sử dụng TypeScript đầy đủ
6. **Notification System**: Hệ thống thông báo chuyên nghiệp

## Testing

### Test REST API:
```bash
# Gửi lời mời
curl -X POST http://localhost:3000/api/friends/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"toUserId": "target_user_id", "message": "Hello!"}'

# Lấy danh sách lời mời
curl -X GET http://localhost:3000/api/friends/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Socket:
Sử dụng Socket.IO client hoặc testing tools như Postman để test các socket events.