"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const friendsController_1 = require("../controllers/friendsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.default)();
// Tất cả routes đều cần authentication
router.use(authMiddleware_1.authMiddleware);
//lấy danh sách bạn bè
router.get('/list', friendsController_1.getFriendsList);
// Gửi lời mời kết bạn
router.post('/send', friendsController_1.sendFriendRequest);
// Gửi lời mời kết bạn bằng username  
router.post('/send-by-username', friendsController_1.sendFriendRequest);
// Chấp nhận lời mời kết bạn (dùng requestId trong params)
router.patch('/accept/:requestId', friendsController_1.acceptFriendRequest);
// Từ chối lời mời kết bạn (dùng requestId trong params)
router.patch('/decline/:requestId', friendsController_1.declineFriendRequest);
// Hủy lời mời đã gửi (dùng requestId trong params)
router.patch('/cancel/:requestId', friendsController_1.cancelFriendRequest);
// Lấy danh sách lời mời nhận được
router.get('/received', friendsController_1.getFriendRequests);
// Lấy danh sách lời mời đã gửi
router.get('/sent', friendsController_1.getSentFriendRequests);
// Xóa bạn bè (dùng friendId trong params)
router.delete('/remove/:friendId', friendsController_1.removeFriend);
exports.default = router;
//# sourceMappingURL=friendsRoute.js.map