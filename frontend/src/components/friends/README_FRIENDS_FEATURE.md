# Friends Feature - Chat Application

## Tổng quan

Phần Friend Management đã được xây dựng với layout phù hợp với kiến trúc ứng dụng chat, tương tự như ChatPanel với 2 phần chính: Sidebar và Main Content.

## Cấu trúc Components

### 1. FriendsPanel (Main Container)
- **File**: `FriendsPanel.tsx`
- **Chức năng**: Container chính quản lý toàn bộ phần friends
- **Đặc điểm**:
  - Setup và cleanup Socket listeners khi mount/unmount
  - Fetch initial data (friends list, received/sent requests)
  - Auto re-setup listeners khi Socket connection thay đổi
  - Layout 2 cột: Sidebar + Main Content

### 2. FriendsSidebar (Left Sidebar)
- **File**: `FriendsSidebar.tsx`
- **Chức năng**: Hiển thị danh sách bạn bè và thống kê
- **Tính năng**:
  - Search bar để tìm kiếm bạn bè
  - Hiển thị badge thông báo số lượng lời mời nhận/gửi
  - Danh sách bạn bè với avatar và online status
  - Empty state khi chưa có bạn bè

### 3. FriendsMainContent (Main Area)
- **File**: `FriendsMainContent.tsx`
- **Chức năng**: Nội dung chính quản lý lời mời và bạn bè
- **Tính năng**:
  - Header với status indicator (Real-time/Offline)
  - Button "Thêm bạn" với dialog
  - Card "Lời mời nhận được" với actions: Chấp nhận/Từ chối
  - Card "Lời mời đã gửi" với action: Hủy
  - Card "Danh sách bạn bè" với action: Xóa
  - Empty state với CTA "Thêm bạn bè đầu tiên"
  - Auto refresh data
  - Format time hiển thị (vừa xong, X giờ trước, X ngày trước)

## Socket Integration

### Socket Listeners được setup:
1. **RECEIVE_FRIEND_REQUEST** - Nhận lời mời kết bạn mới
2. **FRIEND_REQUEST_RESPONSE** - Nhận phản hồi từ người khác
3. **FRIEND_REQUEST_PROCESSED** - Khi mình xử lý lời mời
4. **FRIEND_REQUEST_CANCELLED** - Lời mời bị hủy
5. **FRIEND_REQUEST_SENT** - Gửi lời mời thành công
6. **FRIEND_REQUEST_ERROR** - Lỗi xử lý lời mời
7. **CANCEL_FRIEND_REQUEST_SUCCESS** - Hủy lời mời thành công
8. **FRIEND_REMOVED** - Bạn bè bị xóa
9. **REMOVE_FRIEND_SUCCESS** - Xóa bạn thành công
10. **REMOVE_FRIEND_ERROR** - Lỗi xóa bạn

### Fallback Strategy
- Ưu tiên sử dụng Socket.IO cho real-time updates
- Tự động fallback về REST API khi Socket không available
- Toast notifications điều chỉnh dựa trên connection status

## Integration với ChatAppPage

```tsx
import FriendsPanel from "@/components/friends/FriendsPanel";

const renderMainContent = () => {
  switch (activeView) {
    case 'friends':
      return <FriendsPanel />;
    // ... other cases
  }
};
```

## UI/UX Features

### 1. Real-time Status Indicator
- Badge màu xanh + animation pulse khi connected
- Badge màu cam khi offline mode

### 2. Responsive Design
- Desktop: 2-column layout (sidebar 320px + main content)
- Tương tự ChatPanel để consistency

### 3. Toast Notifications
- Thông báo khi nhận lời mời mới
- Thông báo khi lời mời được accept/decline
- Thông báo khi gửi/hủy lời mời thành công
- Error notifications với retry guidance

### 4. Optimistic Updates
- UI update ngay khi thực hiện action
- Sync với backend trong background
- Rollback nếu có lỗi

### 5. Loading States
- Loading spinner khi fetch data
- Disabled buttons khi đang process
- Animated refresh icon

## Store Integration

Sử dụng `useFriendStore` từ Zustand với các methods:
- `getFriendsList()` - Lấy danh sách bạn bè
- `getFriendRequests()` - Lấy lời mời nhận được
- `getSentRequests()` - Lấy lời mời đã gửi
- `sendFriendRequestByUsername()` - Gửi lời mời qua email/username
- `acceptFriendRequest()` - Chấp nhận lời mời
- `declineFriendRequest()` - Từ chối lời mời
- `cancelFriendRequest()` - Hủy lời mời đã gửi
- `removeFriend()` - Xóa bạn bè
- `setupSocketListeners()` - Setup real-time listeners
- `removeSocketListeners()` - Cleanup listeners

## Testing

Đã test thành công tại `SocketTestPage.tsx`:
- ✅ Socket connection/disconnection
- ✅ Real-time friend requests
- ✅ Accept/Decline requests
- ✅ Send/Cancel requests
- ✅ Remove friends
- ✅ Fallback to REST API
- ✅ Duplicate listeners prevention

## Navigation

Access qua NavigationSidebar:
- Icon: Users (Lucide React)
- Label: "Bạn bè"
- Active state: Primary color highlight

## Next Steps

1. ✅ Xây dựng FriendsPanel với layout 2 cột
2. ✅ Tích hợp Socket listeners
3. ✅ Thêm vào ChatAppPage
4. 🔄 Test trên production environment
5. 📝 Có thể thêm features:
   - Friend suggestions
   - Mutual friends count
   - Online/Offline status real-time
   - Chat history với từng friend
   - Block/Unblock functionality
