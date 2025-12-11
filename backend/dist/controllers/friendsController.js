"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFriend = exports.getSentFriendRequests = exports.cancelFriendRequest = exports.getFriendRequests = exports.declineFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = exports.getFriendsList = void 0;
const friendService_1 = require("../services/friendService");
//lấy danh sách bạn bè
const getFriendsList = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
        }
        const result = await friendService_1.FriendService.getFriendsList(userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            res.status(404).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách bạn bè", error });
    }
};
exports.getFriendsList = getFriendsList;
// Xử lý gửi lời mời kết bạn
const sendFriendRequest = async (req, res) => {
    try {
        const fromUserId = req.user?._id;
        const { toUserId, toUsername, message } = req.body;
        // Kiểm tra người gửi
        if (!fromUserId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
        }
        const result = await friendService_1.FriendService.sendFriendRequest({
            fromUserId: fromUserId.toString(),
            toUserId,
            toUsername,
            message
        });
        if (result.success) {
            res.status(201).json({
                message: result.message,
                data: result.data
            });
        }
        else {
            const statusCode = result.hasReverseRequest ? 400 :
                result.message.includes("không tìm thấy") ? 404 : 400;
            res.status(statusCode).json({
                message: result.message,
                hasReverseRequest: result.hasReverseRequest
            });
        }
    }
    catch (error) {
        console.error("Lỗi Gửi lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi Gửi lời mời kết bạn", error });
    }
};
exports.sendFriendRequest = sendFriendRequest;
//Xử lý đồng ý lời mời kết bạn
const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?._id;
        if (!userId || !requestId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
        }
        const result = await friendService_1.FriendService.acceptFriendRequest(requestId, userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            const statusCode = result.message.includes("không tồn tại") ? 404 :
                result.message.includes("không có quyền") ? 403 : 400;
            res.status(statusCode).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi đồng ý lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi đồng ý lời mời kết bạn", error });
    }
};
exports.acceptFriendRequest = acceptFriendRequest;
// Xử lý từ chối lời mời kết bạn
const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?._id;
        if (!userId || !requestId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
        }
        const result = await friendService_1.FriendService.declineFriendRequest(requestId, userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            const statusCode = result.message.includes("không tồn tại") ? 404 :
                result.message.includes("không có quyền") ? 403 : 400;
            res.status(statusCode).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi từ chối lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi từ chối lời mời kết bạn", error });
    }
};
exports.declineFriendRequest = declineFriendRequest;
// Xử lý lấy danh sách lời mời kết bạn
const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
        }
        const result = await friendService_1.FriendService.getFriendRequests(userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            res.status(500).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi lấy danh sách lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách lời mời kết bạn", error });
    }
};
exports.getFriendRequests = getFriendRequests;
// Xử lý xóa lời mời kết bạn đã gửi
const cancelFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?._id;
        if (!userId || !requestId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu requestId." });
        }
        const result = await friendService_1.FriendService.cancelFriendRequest(requestId, userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            const statusCode = result.message.includes("không tồn tại") ? 404 :
                result.message.includes("không có quyền") ? 403 : 400;
            res.status(statusCode).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi hủy lời mời kết bạn:", error);
        res.status(500).json({ message: "Lỗi hủy lời mời kết bạn", error });
    }
};
exports.cancelFriendRequest = cancelFriendRequest;
// Xử lý lấy danh sách lời mời đã gửi
const getSentFriendRequests = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập." });
        }
        const result = await friendService_1.FriendService.getSentFriendRequests(userId.toString());
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            res.status(500).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi lấy danh sách lời mời đã gửi:", error);
        res.status(500).json({ message: "Lỗi lấy danh sách lời mời đã gửi", error });
    }
};
exports.getSentFriendRequests = getSentFriendRequests;
// Xử lý xóa bạn bè
const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user?._id;
        if (!userId || !friendId) {
            return res.status(401).json({ message: "Người dùng chưa đăng nhập hoặc thiếu friendId." });
        }
        const result = await friendService_1.FriendService.removeFriend(userId.toString(), friendId);
        if (result.success) {
            res.json({
                message: result.message,
                data: result.data
            });
        }
        else {
            const statusCode = result.message.includes("không tồn tại") ? 404 :
                result.message.includes("không phải bạn bè") ? 400 : 500;
            res.status(statusCode).json({ message: result.message });
        }
    }
    catch (error) {
        console.error("Lỗi xóa bạn bè:", error);
        res.status(500).json({ message: "Lỗi xóa bạn bè", error });
    }
};
exports.removeFriend = removeFriend;
//# sourceMappingURL=friendsController.js.map