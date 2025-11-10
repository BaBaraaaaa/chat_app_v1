# Testing Real-time Friends Features

## 🧪 Các bước test chức năng Real-time

### Setup môi trường test:
1. Đảm bảo backend Socket.IO server đang chạy
2. Có ít nhất 2 tài khoản test để test real-time
3. Mở 2 browser/tabs khác nhau cho 2 users

---

## 1. Test Socket Connection Status

### Bước 1: Kiểm tra connection indicator
- [ ] Đăng nhập vào ứng dụng
- [ ] Vào mục "Bạn bè" (Friends)
- [ ] Quan sát góc trên bên phải header
- [ ] Thấy: **Green Wifi icon** + text "X online"
- [ ] Hover để xem tooltip: "Đã kết nối"

### Bước 2: Test disconnect
- [ ] Tắt backend server
- [ ] Quan sát icon chuyển sang **Red WifiOff**
- [ ] Text thay đổi thành "Không kết nối"

### Bước 3: Test reconnect
- [ ] Bật lại backend server
- [ ] Thấy **Loader icon** với animation (Đang kết nối...)
- [ ] Sau vài giây: **Green Wifi icon** trở lại

---

## 2. Test Notifications Bell

### Test notification popup:
- [ ] Click vào **Bell icon** ở header
- [ ] Popover hiển thị danh sách thông báo
- [ ] Unread notifications có background màu xanh
- [ ] Thấy time format: "Vừa xong", "5 phút trước", etc.

### Test mark as read:
- [ ] Click bell khi có unread notifications
- [ ] Badge số (red circle) biến mất
- [ ] Notifications background chuyển từ xanh sang normal

### Test remove notification:
- [ ] Click nút **×** bên phải mỗi notification
- [ ] Notification biến mất khỏi list
- [ ] Count giảm xuống

### Test clear all:
- [ ] Click "Xóa tất cả" ở góc trên
- [ ] Tất cả notifications biến mất
- [ ] Hiển thị: "Không có thông báo mới"

---

## 3. Test Real-time Friend Requests

### Scenario: User A gửi lời mời cho User B

**User A (Người gửi):**
- [ ] Click nút "Thêm bạn"
- [ ] Nhập email của User B
- [ ] Click "Gửi lời mời"
- [ ] Thấy toast: "Đã gửi lời mời kết bạn!"
- [ ] Card "Lời mời đã gửi" xuất hiện NGAY LẬP TỨC
- [ ] Có thể click "Hủy" để hủy lời mời

**User B (Người nhận) - TAB/BROWSER KHÁC:**
- [ ] **KHÔNG CẦN RELOAD TRANG**
- [ ] Toast notification xuất hiện: "Bạn nhận được lời mời kết bạn từ [User A]"
- [ ] Bell icon có badge (số thông báo)
- [ ] Card "Lời mời nhận được" cập nhật REAL-TIME
- [ ] Sidebar badge "Lời mời nhận được" tăng lên

---

## 4. Test Accept/Decline Friend Request

### Scenario: User B chấp nhận lời mời

**User B:**
- [ ] Click nút "Chấp nhận" ở lời mời từ User A
- [ ] Toast: "Lời mời kết bạn đã được chấp nhận!"
- [ ] Request biến mất khỏi "Lời mời nhận được"
- [ ] User A xuất hiện trong "Danh sách bạn bè"
- [ ] Sidebar cập nhật: Badge "Bạn bè" tăng lên

**User A - REAL-TIME (không reload):**
- [ ] Toast notification: "Lời mời kết bạn đã được chấp nhận!"
- [ ] Bell notification xuất hiện
- [ ] Request biến mất khỏi "Lời mời đã gửi"
- [ ] User B xuất hiện trong "Danh sách bạn bè"
- [ ] Sidebar friend list cập nhật

### Scenario: User B từ chối lời mời

**User B:**
- [ ] Click nút "Từ chối"
- [ ] Toast: "Đã từ chối lời mời kết bạn"
- [ ] Request biến mất

**User A - REAL-TIME:**
- [ ] Toast: "Lời mời kết bạn đã bị từ chối"
- [ ] Request biến mất khỏi "Lời mời đã gửi"

---

## 5. Test Cancel Friend Request

### Scenario: User A hủy lời mời đã gửi

**User A:**
- [ ] Vào "Lời mời đã gửi"
- [ ] Click nút "Hủy" ở lời mời đã gửi
- [ ] Toast: "Đã hủy lời mời kết bạn"
- [ ] Request biến mất NGAY LẬP TỨC

**User B - REAL-TIME:**
- [ ] Toast: "Một lời mời kết bạn đã bị hủy"
- [ ] Request biến mất khỏi "Lời mời nhận được"
- [ ] Badge count giảm xuống

---

## 6. Test Remove Friend

### Scenario: User A xóa User B khỏi bạn bè

**User A:**
- [ ] Vào "Danh sách bạn bè"
- [ ] Click icon **Trash** ở User B
- [ ] Confirm dialog: "Bạn có chắc muốn xóa [User B] khỏi danh sách bạn bè?"
- [ ] Click OK
- [ ] Toast: "Đã xóa [User B] khỏi danh sách bạn bè"
- [ ] User B biến mất khỏi danh sách

**User B - REAL-TIME:**
- [ ] Toast: "[User A] đã xóa bạn khỏi danh sách bạn bè"
- [ ] User A biến mất khỏi danh sách bạn bè
- [ ] Sidebar count cập nhật

---

## 7. Test Online Status Real-time

### Setup: 2 users đã là bạn bè

**User A:**
- [ ] Vào tab "Bạn bè"
- [ ] Xem danh sách friends ở sidebar
- [ ] Thấy User B **KHÔNG có green dot** (offline)

**User B:**
- [ ] Đăng nhập vào ứng dụng
- [ ] Socket kết nối thành công

**User A - REAL-TIME (không reload):**
- [ ] Green dot xuất hiện ở avatar của User B
- [ ] Online count ở header tăng lên

**User B:**
- [ ] Đăng xuất hoặc đóng tab

**User A - REAL-TIME:**
- [ ] Green dot biến mất khỏi avatar User B
- [ ] Online count giảm xuống

---

## 8. Test Optimistic Updates

### Test UI response ngay lập tức:

**Accept Friend Request:**
- [ ] Click "Chấp nhận"
- [ ] Request biến mất NGAY (không đợi server)
- [ ] Friend xuất hiện ngay trong danh sách
- [ ] Nếu có lỗi → Rollback và show error toast

**Remove Friend:**
- [ ] Click "Xóa"
- [ ] Friend biến mất NGAY khỏi danh sách
- [ ] UI cập nhật instant
- [ ] Server sync trong background

**Cancel Request:**
- [ ] Click "Hủy"
- [ ] Request biến mất NGAY
- [ ] Smooth UX, no lag

---

## 9. Test Search & Filter

**Test search trong Sidebar:**
- [ ] Nhập tên friend vào search bar
- [ ] Danh sách filter real-time
- [ ] Online status vẫn hiển thị đúng
- [ ] Không ảnh hưởng đến Socket connection

---

## 10. Test Manual Refresh

**Test button "Làm mới":**
- [ ] Click nút "Làm mới" ở header
- [ ] Icon refresh có animation (spin)
- [ ] Toast: "Đã cập nhật dữ liệu"
- [ ] Tất cả data refresh từ server
- [ ] Sync với real-time data

---

## 11. Test Offline Mode (REST API Fallback)

**Scenario: Socket không connected**

### Setup:
- [ ] Tắt backend Socket server (hoặc block port)
- [ ] Frontend vẫn có thể dùng REST API

**User A:**
- [ ] Thấy **Red WifiOff icon** (Offline)
- [ ] Click "Thêm bạn" và gửi lời mời
- [ ] Request vẫn gửi được qua REST API
- [ ] Toast: "Đã gửi lời mời kết bạn!"

**User B:**
- [ ] **CẦN PHẢI RELOAD** hoặc click "Làm mới" để thấy request
- [ ] Accept/Decline vẫn hoạt động qua REST API
- [ ] User A cần reload để thấy kết quả

**Kết luận:** Offline mode vẫn functional, chỉ mất real-time features.

---

## 12. Test Multiple Tabs (Same User)

**Scenario: User A mở 2 tabs**

**Tab 1:**
- [ ] Accept một friend request

**Tab 2 (cùng user A):**
- [ ] Request biến mất real-time
- [ ] Friend list cập nhật
- [ ] Đồng bộ giữa các tabs

---

## 13. Test Connection Recovery

**Scenario: Mất kết nối tạm thời**

- [ ] User đang online, socket connected
- [ ] Tắt WiFi 5 giây
- [ ] Icon chuyển sang WifiOff (red)
- [ ] Bật lại WiFi
- [ ] Socket tự động reconnect
- [ ] Icon chuyển sang Wifi (green)
- [ ] Listeners setup lại
- [ ] Real-time features hoạt động bình thường

---

## 📊 Checklist tổng hợp

### Essential Features:
- [ ] SocketStatus component hiển thị đúng
- [ ] Online/Offline status real-time
- [ ] Notifications bell with badge
- [ ] Send friend request real-time
- [ ] Accept/Decline real-time
- [ ] Cancel request real-time
- [ ] Remove friend real-time
- [ ] Online status per friend real-time
- [ ] Optimistic UI updates
- [ ] Auto reconnection

### Nice to Have:
- [ ] Toast notifications không trùng lặp
- [ ] Smooth animations
- [ ] Loading states
- [ ] Error handling
- [ ] Search filtering
- [ ] Manual refresh
- [ ] Multiple tabs sync

---

## 🐛 Common Issues & Solutions

### Issue 1: Socket không kết nối
**Solution:**
- Check backend server đang chạy
- Check `VITE_SERVER_URL` trong `.env`
- Check CORS settings
- Check browser console logs

### Issue 2: Không nhận real-time updates
**Solution:**
- Check Socket connection status (green icon)
- Reload trang để re-setup listeners
- Check backend Socket events được emit đúng
- Check browser console cho errors

### Issue 3: Toast notifications trùng lặp
**Solution:**
- Đảm bảo Socket listeners chỉ setup một lần
- Check `_listenersSetup` flag trong store
- Cleanup listeners properly on unmount

### Issue 4: Online status không đúng
**Solution:**
- Check `onlineUsers` array trong Socket store
- Check backend user registration
- Check `isUserOnline()` method

---

## ✅ Expected Results

Khi test thành công, bạn sẽ thấy:
- 🟢 Instant UI updates (< 100ms)
- 🟢 Real-time sync giữa users
- 🟢 Smooth animations & transitions
- 🟢 No page reloads needed
- 🟢 Proper error handling
- 🟢 Graceful offline fallback
- 🟢 Consistent notifications
- 🟢 Auto reconnection works
