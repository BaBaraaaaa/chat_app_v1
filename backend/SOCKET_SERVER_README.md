# Socket.IO Server Configuration

## 🚀 Khởi động Server

### Development
```bash
cd backend
npm run dev
```

### Production  
```bash
cd backend
npm run build
npm start
```

### Debug Mode
```bash
npm run dev:debug
```

## 🔌 Socket.IO Endpoints

### Server URLs
- **Development**: `http://localhost:5000`
- **Socket.IO**: Tự động available tại `/socket.io/`
- **Health Check**: `GET /health`
- **Socket Info**: `GET /socket-info` (dev only)
- **Test Client**: `GET /test` (dev only)

## 🧪 Testing Socket.IO

### Option 1: Built-in Test Client
1. Khởi động server: `npm run dev`
2. Mở browser: `http://localhost:5000/test`
3. Test các chức năng friend request

### Option 2: Frontend Integration
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 20000
});

// Đăng ký user online
socket.emit('user:online', currentUserId);

// Lắng nghe events
socket.on('RECEIVE_FRIEND_REQUEST', handleNewFriendRequest);
socket.on('FRIEND_REQUEST_RESPONSE', handleFriendResponse);
```

## 📡 Available Socket Events

### Client → Server
- `user:online` - Đăng ký user online
- `SEND_FRIEND_REQUEST` - Gửi lời mời kết bạn
- `RESPOND_FRIEND_REQUEST` - Phản hồi lời mời
- `CANCEL_FRIEND_REQUEST` - Hủy lời mời
- `GET_FRIEND_REQUESTS` - Lấy danh sách lời mời
- `GET_FRIENDS_LIST` - Lấy danh sách bạn bè
- `GET_ONLINE_USERS` - Lấy users online

### Server → Client  
- `RECEIVE_FRIEND_REQUEST` - Nhận lời mời mới
- `FRIEND_REQUEST_SENT` - Xác nhận gửi lời mời
- `FRIEND_REQUEST_ERROR` - Lỗi gửi lời mời
- `FRIEND_REQUEST_RESPONSE` - Nhận phản hồi lời mời
- `RESPOND_FRIEND_REQUEST_SUCCESS` - Xác nhận phản hồi
- `FRIEND_REQUESTS_LIST` - Danh sách lời mời
- `FRIENDS_LIST` - Danh sách bạn bè
- `ONLINE_USERS_LIST` - Danh sách users online

## ⚙️ Configuration

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=development

# Database  
MONGODB_URI_STRING=mongodb://localhost:27017/chat_app

# Authentication
ACCESS_TOKEN_SECRET=your_secret_key

# CORS for Socket.IO
CLIENT_URL=http://localhost:3000
```

### Socket.IO Settings
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});
```

## 🔧 Development Tools

### 1. Socket.IO Inspector
- Install: Chrome extension "Socket.IO Inspector"
- Connect to: `http://localhost:5000`

### 2. Built-in Test Client
- URL: `http://localhost:5000/test`
- Features: Test all friend request functions

### 3. Debug Logs
Server logs include:
- Socket connections/disconnections
- Client count
- Friend request activities
- Error messages

### 4. Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is running", 
  "timestamp": "2025-11-08T10:30:00.000Z",
  "socketIO": "enabled"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error**
   - Check `CLIENT_URL` in `.env`
   - Ensure frontend URL matches

2. **Connection Failed**
   - Verify server is running on correct port
   - Check firewall settings
   - Try different transport: `{transports: ['polling']}`

3. **Socket Events Not Working**
   - Check user is registered online: `socket.emit('user:online', userId)`
   - Verify event names match exactly
   - Check server logs for errors

### Debug Commands
```bash
# Check if server is running
curl http://localhost:5000/health

# Check socket info  
curl http://localhost:5000/socket-info

# View server logs
npm run dev
```

## 📚 Integration Examples

### React Integration
```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function useFriendSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('user:online', currentUserId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return { socket, isConnected };
}
```

### Vue Integration
```javascript
// composables/useSocket.js
import { ref, onMounted, onUnmounted } from 'vue'
import io from 'socket.io-client'

export function useSocket() {
  const socket = ref(null)
  const isConnected = ref(false)

  onMounted(() => {
    socket.value = io('http://localhost:5000')
    
    socket.value.on('connect', () => {
      isConnected.value = true
    })
  })

  onUnmounted(() => {
    if (socket.value) {
      socket.value.disconnect()
    }
  })

  return { socket, isConnected }
}
```

## 🎯 Next Steps

1. **Frontend Integration**: Connect your React/Vue app
2. **Authentication**: Add JWT validation for socket connections  
3. **Rate Limiting**: Implement rate limiting for socket events
4. **Persistence**: Store offline messages
5. **Scaling**: Add Redis adapter for multiple server instances