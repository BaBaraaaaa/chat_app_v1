import Router from 'express';
import { 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest, 
    getFriendRequests, 
    cancelFriendRequest,
    getSentFriendRequests 
} from '../controllers/friendsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// Gửi lời mời kết bạn
router.post('/send', sendFriendRequest);

// Chấp nhận lời mời kết bạn (dùng requestId trong params)
router.patch('/accept/:requestId', acceptFriendRequest);

// Từ chối lời mời kết bạn (dùng requestId trong params)
router.patch('/decline/:requestId', declineFriendRequest);

// Hủy lời mời đã gửi (dùng requestId trong params)
router.patch('/cancel/:requestId', cancelFriendRequest);

// Lấy danh sách lời mời nhận được
router.get('/received', getFriendRequests);

// Lấy danh sách lời mời đã gửi
router.get('/sent', getSentFriendRequests);

export default router;