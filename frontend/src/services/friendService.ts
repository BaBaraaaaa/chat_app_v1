import api from "@/lib/axios";

export const friendService = {

    // Lấy danh sách bạn bè
    getFriendsList: async () => {
        const res = await api.get("/friends/list", { withCredentials: true });
        return res.data;
    },
  // Gửi lời mời kết bạn (hỗ trợ cả userId và username)
  sendFriendRequest: async (identifier: string, message?: string, isUsername = false) => {
    const payload = isUsername 
      ? { toUsername: identifier, message }
      : { toUserId: identifier, message };
      
    const res = await api.post(
      "/friends/send",
      payload,
      { withCredentials: true }
    );
    return res.data;
  },

  // Gửi lời mời kết bạn bằng username
  sendFriendRequestByUsername: async (username: string, message?: string) => {
    const res = await api.post(
      "/friends/send-by-username",
      { toUsername: username, message },
      { withCredentials: true }
    );
    return res.data;
  },

  // Đồng ý lời mời kết bạn
  acceptFriendRequest: async (requestId: string) => {
    const res = await api.patch(
      `/friends/accept/${requestId}`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  // Từ chối lời mời kết bạn
  declineFriendRequest: async (requestId: string) => {
    const res = await api.patch(
      `/friends/decline/${requestId}`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  // Hủy lời mời kết bạn đã gửi
  cancelFriendRequest: async (requestId: string) => {
    const res = await api.patch(
      `/friends/cancel/${requestId}`,
      {},
      { withCredentials: true }
    );
    return res.data;
  },

  // Lấy danh sách lời mời kết bạn đã nhận  
  getReceivedFriendRequests: async () => {
    const res = await api.get("/friends/received", { withCredentials: true });
    return res.data;
  },

  // Lấy danh sách lời mời kết bạn đã gửi
  getSentFriendRequests: async () => {
    const res = await api.get("/friends/sent", { withCredentials: true });
    return res.data;
  },

  // Tìm kiếm người dùng
  searchUsers: async (query: string) => {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`, { 
      withCredentials: true 
    });
    return res.data;
  },
};
