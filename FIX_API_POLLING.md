# Fix: Remove API Polling - Chỉ dùng Socket Real-time

## 🐛 Vấn đề
API bị gọi liên tục mỗi 5 giây do useEffect dependencies không đúng, gây ra:
- Excessive API calls
- Wasted bandwidth
- Server load không cần thiết
- Khi đã có Socket real-time thì không cần polling

## 🔍 Root Cause

### Vấn đề 1: Dependencies array bao gồm functions
```typescript
// ❌ SAI - Functions trong dependencies
useEffect(() => {
  // fetch data...
}, [user, isConnected, fetchFriendRequests, fetchSentRequests, fetchFriends, setupSocketListeners, removeSocketListeners]);
```

**Tại sao sai?**
- Zustand store functions được tạo mới mỗi lần store update
- Mỗi khi state thay đổi → functions thay đổi → useEffect chạy lại
- Loop: fetch data → update state → functions change → useEffect → fetch again

### Vấn đề 2: Socket listeners setup lại liên tục
```typescript
// ❌ SAI - Setup listeners trong cùng useEffect với data fetching
useEffect(() => {
  fetchData();
  if (isConnected) {
    setupSocketListeners();
  }
}, [... many dependencies ...]);
```

## ✅ Giải pháp

### 1. Tách riêng Data Fetching và Socket Setup

#### Fetch initial data chỉ 1 lần:
```typescript
useEffect(() => {
  const initializeData = async () => {
    if (user) {
      console.log('🔄 Fetching initial data...');
      await Promise.all([
        getFriendRequests(),
        getSentRequests(),
        getFriendsList()
      ]);
      console.log('✅ Initial data loaded');
    }
  };

  initializeData();
  
  return () => {
    removeSocketListeners();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ⚠️ Empty array - chỉ chạy 1 lần khi mount
```

#### Socket listeners setup riêng:
```typescript
useEffect(() => {
  if (isConnected && user) {
    console.log('🔧 Setting up socket listeners...');
    setupSocketListeners();
  }

  return () => {
    if (isConnected) {
      removeSocketListeners();
    }
  };
}, [isConnected, user, setupSocketListeners, removeSocketListeners]);
```

### 2. Files đã sửa

#### A. FriendsPanel.tsx
**Before:**
```typescript
useEffect(() => {
  const initializeData = async () => {
    if (user) {
      await Promise.all([...]);
    }
  };
  
  initializeData();
  
  if (user && isConnected) {
    setupSocketListeners();
  }
  
  return () => {
    removeSocketListeners();
  };
}, [user, isConnected, setupSocketListeners, removeSocketListeners, getFriendRequests, getSentRequests, getFriendsList]);
// ❌ 7 dependencies - chạy lại quá nhiều!
```

**After:**
```typescript
// useEffect 1: Fetch data 1 lần
useEffect(() => {
  const initializeData = async () => {
    if (user) {
      await Promise.all([...]);
    }
  };
  initializeData();
  return () => {
    removeSocketListeners();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Chỉ 1 lần

// useEffect 2: Socket listeners
useEffect(() => {
  if (isConnected && user) {
    setupSocketListeners();
  }
  return () => {
    if (isConnected) {
      removeSocketListeners();
    }
  };
}, [isConnected, user, setupSocketListeners, removeSocketListeners]);
// ✅ Chỉ chạy khi connection status thay đổi
```

#### B. FriendRequestManager.tsx
Áp dụng cùng logic như trên.

---

## 📊 So sánh Before/After

### Before (API Polling):
```
Component Mount
    ↓
Fetch data (1)
    ↓
State updates
    ↓
Functions recreated
    ↓
useEffect triggered (2)
    ↓
Fetch data again
    ↓
State updates
    ↓
Loop continues... (3, 4, 5...)
```

**Result:** API called every 5 seconds or whenever state changes

### After (Socket Only):
```
Component Mount
    ↓
Fetch data ONCE (initial load)
    ↓
Setup Socket listeners
    ↓
Wait for Socket events
    ↓
Socket event received
    ↓
Store updates automatically
    ↓
UI re-renders
    ↓
NO API calls
```

**Result:** API called once on mount, then real-time via Socket

---

## 🧪 Cách Test

### 1. Kiểm tra Network Tab

#### Before Fix:
```
GET /api/friends/requests    - 200 OK (0)
GET /api/friends/sent        - 200 OK (0)
GET /api/friends             - 200 OK (0)

... wait 5s ...

GET /api/friends/requests    - 200 OK (5s)
GET /api/friends/sent        - 200 OK (5s)
GET /api/friends             - 200 OK (5s)

... loop continues ...
```

#### After Fix:
```
GET /api/friends/requests    - 200 OK (initial)
GET /api/friends/sent        - 200 OK (initial)
GET /api/friends             - 200 OK (initial)

... no more calls ...
Socket events handle updates
```

### 2. Kiểm tra Console Logs

#### Before Fix:
```
🔄 Fetching initial data...
✅ Initial data loaded
🔄 Fetching initial data...  // ❌ Duplicate!
✅ Initial data loaded
🔄 Fetching initial data...  // ❌ Duplicate!
✅ Initial data loaded
...
```

#### After Fix:
```
🔄 Fetching initial data...
✅ Initial data loaded
🔧 Setting up socket listeners...
... no more fetching ...
```

### 3. Test Scenarios

#### Scenario 1: Component Mount
- [ ] API called exactly ONCE
- [ ] Socket listeners setup
- [ ] No repeated API calls

#### Scenario 2: Socket Connected
- [ ] Listeners setup
- [ ] NO data fetching
- [ ] Socket handles updates

#### Scenario 3: Friend Request Received
- [ ] Socket event triggers update
- [ ] Store updates
- [ ] UI re-renders
- [ ] NO API call

#### Scenario 4: Navigate away and back
- [ ] Cleanup listeners
- [ ] On return: fetch once
- [ ] Setup listeners again
- [ ] No polling

---

## ⚡ Performance Improvements

### Network:
- **Before:** ~180 API calls/minute (3 endpoints × 60 seconds / 5 seconds)
- **After:** 3 API calls on mount, then 0

### Bandwidth:
- **Before:** Continuous polling waste
- **After:** Minimal initial load

### Server Load:
- **Before:** Constant requests
- **After:** One-time load

### Battery (Mobile):
- **Before:** Background polling drains battery
- **After:** Event-driven, no polling

---

## 🎯 Best Practices Applied

1. ✅ **Separate Concerns**: Data fetching vs Socket setup
2. ✅ **Empty Dependencies**: For one-time initialization
3. ✅ **ESLint Disable**: Documented why ignoring exhaustive-deps
4. ✅ **Console Logs**: Added for debugging
5. ✅ **Cleanup**: Proper listener removal
6. ✅ **Socket-First**: Real-time updates, no polling
7. ✅ **Manual Refresh**: User can trigger if needed

---

## 🚨 Potential Issues & Solutions

### Issue 1: Data not updating
**Symptom:** UI doesn't update when friend request received
**Solution:** 
- Check Socket connection: `isConnected === true`
- Check listeners setup: Console log "🔧 Setting up socket listeners..."
- Check Socket events: DevTools → Network → WS

### Issue 2: Stale data on mount
**Symptom:** Old data shown when component mounts
**Solution:**
- Initial fetch still happens once
- If needed, add manual refresh button
- Socket will update any changes after mount

### Issue 3: ESLint warning
**Symptom:** React Hook useEffect has missing dependencies
**Solution:**
- Already handled with `eslint-disable-next-line react-hooks/exhaustive-deps`
- This is intentional - we want to run ONCE
- Alternative: Use useRef for stable function references

---

## 📝 Files Changed

1. ✅ `frontend/src/components/friends/FriendsPanel.tsx`
   - Split useEffect into 2 separate effects
   - Empty dependency for initial fetch
   - Connection-dependent for Socket setup

2. ✅ `frontend/src/components/friends/FriendRequestManager.tsx`
   - Same pattern as FriendsPanel
   - Added debug logs
   - Removed function dependencies

---

## 🔄 Migration Checklist

- [x] Identify polling source
- [x] Separate data fetching from Socket setup
- [x] Add empty dependency array for one-time fetch
- [x] Add Socket-dependent useEffect
- [x] Add debug console logs
- [x] Test in development
- [ ] Monitor in production
- [ ] Remove debug logs after verification

---

## 🎉 Expected Results

After this fix, you should see:

1. ✅ **Network tab**: Only 3 API calls on mount
2. ✅ **Console**: "🔄 Fetching..." appears once
3. ✅ **Socket**: Real-time updates working
4. ✅ **UI**: Responsive and up-to-date
5. ✅ **Performance**: No unnecessary requests

---

## 💡 Additional Notes

### Why not use polling as backup?
- Socket has built-in reconnection
- Polling wastes resources
- If Socket fails, show connection status
- User can manually refresh

### When to use polling?
- Legacy systems without WebSocket
- Unreliable network (rare)
- Simple dashboards (with long intervals like 30s+)

### Why empty dependency array is OK here?
- Initial data fetch should happen once
- Socket events handle subsequent updates
- Re-fetching on every state change is wasteful
- This is a common pattern for initialization

---

## 🔧 Debugging Commands

### Check API calls:
```javascript
// In DevTools Console
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/api/friends'))
  .map(r => ({ url: r.name, time: r.startTime }))
```

### Monitor Socket events:
```javascript
// In useSocketStore
onOnlineUsersList: (data) => {
  console.log('📊 Socket event received:', data);
}
```

### Count re-renders:
```typescript
// Add to component
const renderCount = useRef(0);
renderCount.current++;
console.log('🔄 Render count:', renderCount.current);
```
