# Hiển thị số bạn bè Online

## ✅ Đã implement

### 1. **FriendsSidebar** - Header Badge
**Location**: `d:\chat_app_v1\frontend\src\components\friends\FriendsSidebar.tsx`

```tsx
// Tính số bạn bè đang online
const onlineFriendsCount = friends.filter(friend => isUserOnline(friend._id)).length;

// Hiển thị badge
{onlineFriendsCount > 0 && (
  <Badge variant="outline" className="text-sm text-green-600 border-green-600">
    <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
    {onlineFriendsCount} online
  </Badge>
)}
```

**Features**:
- ✅ Đếm số bạn bè online real-time
- ✅ Green badge với dot animation
- ✅ Chỉ hiển thị khi có bạn online (> 0)
- ✅ Đặt cạnh badge tổng số bạn bè

**Visual Example**:
```
┌─────────────────────────────────┐
│ 👥 Bạn bè    [12] [● 5 online]  │
└─────────────────────────────────┘
```

---

### 2. **FriendsMainContent** - Header Badge  
**Location**: `d:\chat_app_v1\frontend\src\components\friends\FriendsMainContent.tsx`

```tsx
// Tính số bạn bè đang online với useMemo (performance)
const onlineFriendsCount = useMemo(
  () => friends.filter(friend => isUserOnline(friend._id)).length,
  [friends, isUserOnline]
);

// Header hiển thị
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold">Quản lý bạn bè</h1>
  <SocketStatus showNotifications={true} showOnlineCount={false} />
  {onlineFriendsCount > 0 && (
    <Badge variant="outline" className="text-green-600 border-green-600">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1.5" />
      {onlineFriendsCount} bạn online
    </Badge>
  )}
</div>
```

**Features**:
- ✅ useMemo để optimize performance
- ✅ Green dot với pulse animation
- ✅ Đặt cạnh SocketStatus component
- ✅ Chỉ đếm friends, không đếm tất cả users online

**Visual Example**:
```
┌─────────────────────────────────────────────────────────┐
│ Quản lý bạn bè  [🔔 Socket Connected] [● 5 bạn online] │
└─────────────────────────────────────────────────────────┘
```

---

### 3. **Individual Friend Online Status**
**Location**: `FriendsSidebar.tsx` - Friend List Items

```tsx
{filteredFriends.map((friend) => {
  const isOnline = isUserOnline(friend._id);
  
  return (
    <div key={friend._id}>
      <Avatar>
        {/* Avatar content */}
      </Avatar>
      {/* Green dot nếu online */}
      {isOnline && (
        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
      )}
    </div>
  );
})}
```

**Features**:
- ✅ Green dot ở góc dưới phải avatar
- ✅ Chỉ hiển thị khi friend online
- ✅ Real-time updates khi status thay đổi
- ✅ Border white để nổi bật

---

## 🔄 Data Flow

```
Socket Store (onlineUsers array)
        ↓
useSocket() hook
        ↓
isUserOnline(friendId) method
        ↓
Filter friends array
        ↓
Count online friends
        ↓
Display badge (conditional)
```

---

## 🎯 Logic đếm bạn online

### Method 1: Direct filter (FriendsSidebar)
```tsx
const onlineFriendsCount = friends.filter(friend => isUserOnline(friend._id)).length;
```

**Pros**: Simple, straightforward
**Cons**: Re-compute mỗi render

### Method 2: useMemo (FriendsMainContent)
```tsx
const onlineFriendsCount = useMemo(
  () => friends.filter(friend => isUserOnline(friend._id)).length,
  [friends, isUserOnline]
);
```

**Pros**: Performance optimization, chỉ re-compute khi dependencies change
**Cons**: Slightly more code

---

## 📊 So sánh với tính năng cũ

| Feature | Trước đây | Bây giờ |
|---------|-----------|---------|
| Online count | Tất cả users | Chỉ bạn bè |
| Display location | SocketStatus only | SocketStatus + 2 badges |
| Real-time updates | ✅ | ✅ |
| Per-friend status | ✅ | ✅ |
| Performance | Good | Better (useMemo) |

---

## 🎨 UI/UX Details

### Badge Styling:
```tsx
<Badge 
  variant="outline" 
  className="text-green-600 border-green-600"
>
  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-1.5" />
  {onlineFriendsCount} bạn online
</Badge>
```

**Colors**:
- Text: `text-green-600`
- Border: `border-green-600`
- Dot: `bg-green-500`
- Animation: `animate-pulse`

**Spacing**:
- Dot margin: `mr-1.5`
- Badge size: Auto based on text
- Gap between badges: `gap-2` or `gap-3`

---

## 🧪 Testing

### Test Case 1: Không có bạn online
**Expected**: Badge không hiển thị
```tsx
onlineFriendsCount = 0
// Badge element: null (conditional render)
```

### Test Case 2: 1 bạn online
**Expected**: Badge hiển thị "1 bạn online"
```tsx
onlineFriendsCount = 1
// Display: [● 1 bạn online]
```

### Test Case 3: Nhiều bạn online
**Expected**: Badge hiển thị số lượng
```tsx
onlineFriendsCount = 5
// Display: [● 5 bạn online]
```

### Test Case 4: Bạn online/offline real-time
**Action**: User B đăng nhập/đăng xuất
**Expected**: 
- Count tăng/giảm ngay lập tức
- Dot animation xuất hiện/biến mất
- No page reload needed

---

## ⚡ Performance Optimizations

1. **useMemo** - Cache computed value
2. **Conditional Render** - Chỉ render badge khi count > 0
3. **Filter once** - Không filter multiple times
4. **Event-driven** - Socket updates trigger re-render automatically

---

## 🎯 User Benefits

1. **Visibility**: Thấy ngay có bao nhiêu bạn online
2. **Context**: Chỉ đếm bạn bè, không phải strangers
3. **Real-time**: Cập nhật tức thì
4. **Visual Cue**: Green color + animation = online
5. **Non-intrusive**: Badge nhỏ gọn, không chiếm nhiều space

---

## 📝 Code Location Summary

| File | Line | What |
|------|------|------|
| FriendsSidebar.tsx | ~23 | Count calculation |
| FriendsSidebar.tsx | ~38-43 | Badge display (header) |
| FriendsSidebar.tsx | ~110-112 | Individual green dot |
| FriendsMainContent.tsx | ~47-50 | useMemo count |
| FriendsMainContent.tsx | ~161-167 | Badge display (header) |

---

## 🚀 Future Enhancements

- [ ] Nhóm online/offline friends
- [ ] Sort by online status
- [ ] Last seen timestamp
- [ ] Custom status messages
- [ ] Do not disturb mode
- [ ] Bulk online notifications
