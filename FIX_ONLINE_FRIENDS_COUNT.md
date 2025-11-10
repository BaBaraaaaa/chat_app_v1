# Fix: Hiển thị số bạn bè Online

## 🐛 Vấn đề
Badge "X bạn online" không hiển thị vì backend không emit event `ONLINE_USERS_LIST`.

## ✅ Giải pháp đã áp dụng

### 1. Backend - Emit ONLINE_USERS_LIST Event

**File**: `backend/src/socket/registerSocketHandlers.ts`

#### A. Emit khi user online:
```typescript
socket.on("user:online", async (userId: string) => {
  // ... add user to onlineUsers array
  
  // 🆕 Broadcast danh sách online users
  io.emit("ONLINE_USERS_LIST", {
    data: onlineUsers.map((u) => u.userId),
    count: onlineUsers.length
  });
});
```

#### B. Emit khi user disconnect:
```typescript
socket.on("disconnect", () => {
  // ... remove user from onlineUsers array
  
  // 🆕 Broadcast updated list
  io.emit("ONLINE_USERS_LIST", {
    data: onlineUsers.map((u) => u.userId),
    count: onlineUsers.length
  });
});
```

#### C. Handler để client request:
```typescript
socket.on("GET_ONLINE_USERS", () => {
  socket.emit("ONLINE_USERS_LIST", {
    data: onlineUsers.map((u) => u.userId),
    count: onlineUsers.length
  });
});
```

---

### 2. Frontend - Request Online Users

**File**: `frontend/src/stores/useSocketStore.ts`

```typescript
setupEventListeners: () => {
  // Listen for online users updates
  socketService.onOnlineUsersList((data: OnlineUsersListData) => {
    console.log('👥 Online users updated:', data);
    get().updateOnlineUsers(data.data, data.count);
  });
  
  // 🆕 Request initial online users list
  socketService.getOnlineUsers();
}
```

---

### 3. Debug Logs đã thêm

#### Frontend - FriendsMainContent.tsx:
```typescript
console.log('🔍 FriendsMainContent Debug:', {
  totalFriends: friends.length,
  onlineFriendsCount,
  friendIds: friends.map(f => f._id),
  isUserOnlineCheck: friends.map(f => ({ id: f._id, online: isUserOnline(f._id) }))
});
```

#### Frontend - FriendsSidebar.tsx:
```typescript
console.log('🔍 FriendsSidebar Debug:', {
  totalFriends: friends.length,
  onlineFriendsCount,
  sampleCheck: friends.slice(0, 3).map(f => ({ 
    id: f._id, 
    name: f.displayName,
    online: isUserOnline(f._id) 
  }))
});
```

#### Frontend - useSocketStore.ts:
```typescript
updateOnlineUsers: (users: string[], count: number) => {
  console.log('👥 Updating online users:', { 
    users, 
    count, 
    previousCount: get().onlineCount 
  });
  set({ onlineUsers: users, onlineCount: count });
}
```

---

## 🧪 Cách Test

### Bước 1: Restart Backend
```bash
cd backend
npm run dev
```

### Bước 2: Restart Frontend
```bash
cd frontend
npm run dev
```

### Bước 3: Test với 2 users

#### User A (Browser 1):
1. Đăng nhập
2. Vào tab "Bạn bè"
3. Mở DevTools Console (F12)
4. Kiểm tra logs:
```
👥 Online users updated: { data: ['user_a_id'], count: 1 }
🔍 FriendsSidebar Debug: { totalFriends: X, onlineFriendsCount: 0 }
```

#### User B (Browser 2/Incognito):
1. Đăng nhập (phải là bạn bè của User A)
2. Quan sát User A console sẽ thấy:
```
👥 Online users updated: { data: ['user_a_id', 'user_b_id'], count: 2 }
🔍 FriendsSidebar Debug: { totalFriends: X, onlineFriendsCount: 1 }
```

#### User A UI:
- Badge "1 bạn online" xuất hiện ở header
- Badge "1 online" xuất hiện ở sidebar
- Green dot xuất hiện ở avatar của User B

---

## 🔍 Debug Checklist

### ✅ Backend Logs (Terminal):
```
🟢 User connected: [socket-id]
👥 Online users: [ 'user_id_1' ]
👥 Online users: [ 'user_id_1', 'user_id_2' ]
🔴 User disconnected: [socket-id]
```

### ✅ Frontend Console Logs:
```
🔧 Setting up core Socket connection listeners...
👥 Online users updated: { data: [...], count: X }
🔍 FriendsSidebar Debug: { onlineFriendsCount: X }
🔍 FriendsMainContent Debug: { onlineFriendsCount: X }
```

### ✅ UI Elements:
- [ ] Badge hiển thị ở header: `[● X bạn online]`
- [ ] Badge hiển thị ở sidebar: `[● X online]`
- [ ] Green dot ở avatar của friends online
- [ ] Badge biến mất khi không có friend online

---

## 🎯 Expected Behavior

### Scenario 1: User đăng nhập
- Event `user:online` emit
- Backend broadcast `ONLINE_USERS_LIST`
- Frontend update `onlineUsers` array
- UI re-render với badge

### Scenario 2: Friend đăng nhập
- Backend broadcast `ONLINE_USERS_LIST` (updated)
- Frontend filter friends.includes(onlineUsers)
- `onlineFriendsCount` tăng
- Badge cập nhật real-time

### Scenario 3: Friend đăng xuất
- Backend broadcast `ONLINE_USERS_LIST` (updated)
- `onlineFriendsCount` giảm
- Badge cập nhật hoặc biến mất
- Green dot biến mất

---

## 🚨 Troubleshooting

### Problem 1: Badge không hiển thị
**Check:**
```typescript
// Console log trong component
console.log('onlineFriendsCount:', onlineFriendsCount);
console.log('friends:', friends);
console.log('isUserOnline check:', friends.map(f => isUserOnline(f._id)));
```

**Possible causes:**
- Backend chưa restart
- Socket chưa connected
- User không phải bạn bè
- Event listener chưa setup

### Problem 2: Count không đúng
**Check:**
```typescript
// Trong useSocketStore
console.log('onlineUsers:', get().onlineUsers);
console.log('friends:', useFriendStore.getState().friends);
```

**Possible causes:**
- `onlineUsers` array empty
- `friends` array empty
- User IDs không match (string vs ObjectId)

### Problem 3: Không real-time update
**Check:**
- Backend có emit `ONLINE_USERS_LIST` khi disconnect?
- Frontend có listen `ONLINE_USERS_LIST` event?
- Socket connection có ổn định?

---

## 📊 Data Flow

```
User Login
    ↓
Frontend: registerUser(userId)
    ↓
Backend: socket.on('user:online')
    ↓
Backend: add to onlineUsers array
    ↓
Backend: io.emit('ONLINE_USERS_LIST')
    ↓
Frontend: onOnlineUsersList listener
    ↓
Frontend: updateOnlineUsers(data, count)
    ↓
Frontend: set({ onlineUsers: [...] })
    ↓
Component: useMemo filter friends
    ↓
Component: onlineFriendsCount calculated
    ↓
UI: Badge render (if count > 0)
```

---

## 🎉 Success Indicators

Khi fix thành công, bạn sẽ thấy:

1. ✅ Backend log: `👥 Online users: [...]`
2. ✅ Frontend log: `👥 Online users updated: {...}`
3. ✅ Console log: `🔍 Debug: { onlineFriendsCount: X }`
4. ✅ UI badge: `[● X bạn online]` hoặc `[● X online]`
5. ✅ Green dot trên avatar friends online
6. ✅ Real-time update khi friend login/logout

---

## 🔄 Next Steps

Sau khi test thành công:

1. **Remove debug logs** (optional):
   - Comment hoặc xóa các `console.log` debug
   - Giữ lại logs quan trọng

2. **Test edge cases**:
   - Multiple friends online/offline cùng lúc
   - Network interruption
   - Reconnection scenarios

3. **Performance check**:
   - Monitor với nhiều friends (100+)
   - Check memory leaks
   - Optimize re-renders nếu cần

---

## 📝 Files Changed

- ✅ `backend/src/socket/registerSocketHandlers.ts`
- ✅ `frontend/src/stores/useSocketStore.ts`
- ✅ `frontend/src/components/friends/FriendsMainContent.tsx` (debug)
- ✅ `frontend/src/components/friends/FriendsSidebar.tsx` (debug)
