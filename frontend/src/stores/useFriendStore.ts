import { friendService } from "@/services/friendApiService";
import { socketService } from "@/socket/socketService";
import { toast } from "sonner";
import { create } from "zustand";
import { useConversationStore } from "./useConversationStore";
import type { FriendState } from "@/types/friends";
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  receivedRequests: [],
  sentRequests: [],
  loading: false,

  // Internal flag để track listener setup
  _listenersSetup: false,

  getFriendsList: async () => {
    try {
      set({ loading: true });
      const response = await friendService.getFriendsList();
      set({ friends: response.data?.friends || [] });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      toast.error("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },

  getFriendRequests: async () => {
    try {
      set({ loading: true });
      const response = await friendService.getReceivedFriendRequests();
      set({ receivedRequests: response.data || [] });
    } catch (error) {
      console.error("Lỗi khi lấy lời mời kết bạn:", error);
      toast.error("Không thể tải lời mời kết bạn.");
    } finally {
      set({ loading: false });
    }
  },

  getSentRequests: async () => {
    try {
      set({ loading: true });
      const response = await friendService.getSentFriendRequests();
      set({ sentRequests: response.data || [] });
    } catch (error) {
      console.error("Lỗi khi lấy lời mời đã gửi:", error);
      toast.error("Không thể tải lời mời đã gửi.");
    } finally {
      set({ loading: false });
    }
  },

  sendFriendRequest: async (userId: string, message?: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.sendFriendRequest({
          fromUserId: "", // Backend sẽ lấy từ authentication token
          toUserId: userId,
          message,
        });
        // ❌ REMOVED: Socket listener sẽ xử lý toast
        return;
      }

      // Fallback REST API
      await friendService.sendFriendRequest(userId, message);
      toast.success("Đã gửi lời mời kết bạn!");

      // Refresh sent requests
      get().getSentRequests();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể gửi lời mời kết bạn.";
      toast.error(errorMessage);
    }
  },

  sendFriendRequestByUsername: async (username: string, message?: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.sendFriendRequest({
          fromUserId: "", // Backend sẽ lấy từ token
          toUsername: username,
          message,
        });
        // Socket listener sẽ xử lý response
        return;
      }

      // Fallback REST API
      await friendService.sendFriendRequestByUsername(username, message);
      toast.success("Đã gửi lời mời kết bạn!");

      // Refresh sent requests
      get().getSentRequests();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể gửi lời mời kết bạn.";
      toast.error(errorMessage);
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.removeFriend({ friendId });

        // Optimistic update - loại bỏ friend khỏi danh sách ngay
        const currentFriends = get().friends.filter(
          (friend) => friend._id !== friendId
        );
        set({ friends: currentFriends });
      } else {
        // Fallback to REST API
        await friendService.removeFriend(friendId);
        toast.success("Đã xóa bạn bè!");

        // Refresh friends list
        get().getFriendsList();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message || "Không thể xóa bạn bè.";
      toast.error(errorMessage);
    }
  },

  // Socket-enabled methods
  sendFriendRequestSocket: async (
    toUserId: string,
    fromUserId: string,
    message?: string
  ) => {
    try {
      // Gửi qua Socket.IO để có real-time feedback
      if (socketService.isConnected()) {
        socketService.sendFriendRequest({
          fromUserId,
          toUserId,
          message,
        });

        // Refresh sent requests after a short delay
        setTimeout(() => {
          get().getSentRequests();
        }, 1000);
      } else {
        // Fallback to REST API nếu socket không kết nối
        await get().sendFriendRequest(toUserId, message);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể gửi lời mời kết bạn.";
      toast.error(errorMessage);
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.respondToFriendRequest({
          requestId,
          response: "accepted",
        });

        // Optimistic update - cập nhật UI ngay lập tức
        // Loại bỏ request khỏi danh sách ngay
        const currentRequests = get().receivedRequests.filter(
          (req) => req._id !== requestId
        );
        set({ receivedRequests: currentRequests });

        // Refresh friends list sau delay ngắn để đảm bảo backend đã cập nhật
        setTimeout(() => {
          get().getFriendsList();
        }, 500);

        // ❌ REMOVED: toast.success("Đã chấp nhận lời mời kết bạn!");
        // Socket listener sẽ handle toast
        return;
      }

      // Fallback REST API
      await friendService.acceptFriendRequest(requestId);
      toast.success("Đã chấp nhận lời mời kết bạn!");

      // Refresh friends and requests
      get().getFriendsList();
      get().getFriendRequests();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể chấp nhận lời mời.";
      toast.error(errorMessage);
    }
  },

  acceptFriendRequestSocket: async (requestId: string) => {
    try {
      // Gửi qua Socket.IO để có real-time feedback
      if (socketService.isConnected()) {
        socketService.respondToFriendRequest({
          requestId,
          response: "accepted",
        });

        // Refresh data after a short delay
        setTimeout(() => {
          get().getFriendsList();
          get().getFriendRequests();
        }, 1000);
      } else {
        // Fallback to REST API
        await get().acceptFriendRequest(requestId);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể chấp nhận lời mời.";
      toast.error(errorMessage);
    }
  },

  declineFriendRequest: async (requestId: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.respondToFriendRequest({
          requestId,
          response: "declined",
        });

        // Optimistic update - loại bỏ request khỏi danh sách ngay
        const currentRequests = get().receivedRequests.filter(
          (req) => req._id !== requestId
        );
        set({ receivedRequests: currentRequests });
        return;
      }

      // Fallback REST API
      await friendService.declineFriendRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn!");

      // Refresh requests
      get().getFriendRequests();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể từ chối lời mời.";
      toast.error(errorMessage);
    }
  },

  declineFriendRequestSocket: async (requestId: string) => {
    try {
      // Gửi qua Socket.IO để có real-time feedback
      if (socketService.isConnected()) {
        socketService.respondToFriendRequest({
          requestId,
          response: "declined",
        });

        // Refresh requests after a short delay
        setTimeout(() => {
          get().getFriendRequests();
        }, 1000);
      } else {
        // Fallback to REST API
        await get().declineFriendRequest(requestId);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể từ chối lời mời.";
      toast.error(errorMessage);
    }
  },

  cancelFriendRequest: async (requestId: string) => {
    try {
      // Ưu tiên sử dụng Socket nếu có kết nối
      if (socketService.isConnected()) {
        socketService.cancelFriendRequest(requestId); // Backend sẽ lấy userId từ socket context
        // Socket listener sẽ xử lý response
        return;
      }

      // Fallback REST API
      await friendService.cancelFriendRequest(requestId);
      toast.success("Đã hủy lời mời kết bạn!");

      // Refresh sent requests
      get().getSentRequests();
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể hủy lời mời.";
      toast.error(errorMessage);
    }
  },

  cancelFriendRequestSocket: async (requestId: string) => {
    try {
      // Gửi qua Socket.IO để có real-time feedback
      if (socketService.isConnected()) {
        socketService.cancelFriendRequest(requestId);

        // Optimistic update - loại bỏ request khỏi sent list ngay
        const currentSentRequests = get().sentRequests.filter(
          (req) => req._id !== requestId
        );
        set({ sentRequests: currentSentRequests });

        // Refresh sent requests after a short delay để đảm bảo sync
        setTimeout(() => {
          get().getSentRequests();
        }, 1000);
      } else {
        // Fallback to REST API
        await get().cancelFriendRequest(requestId);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as ApiError)?.response?.data?.message ||
        "Không thể hủy lời mời.";
      toast.error(errorMessage);
    }
  },

  // Setup real-time listeners for friend data updates
  setupSocketListeners: () => {
    if (!socketService.isConnected()) return;

    // 🛡️ Tránh setup duplicate listeners
    if (get()._listenersSetup) {
      return;
    }


    // Lắng nghe friend request mới
    socketService.onFriendRequestReceived((data) => {
      // Refresh danh sách friend requests
      get().getFriendRequests();

      // Hiển thị thông báo
      toast.info(
        `Bạn nhận được lời mời kết bạn từ ${data.request.fromUserId.displayName || data.request.fromUserId.username}`
      );
    });

    // Lắng nghe phản hồi friend request (accept/decline)
    // ⚠️ Event này dành cho NGƯỜI GỬI lời mời, không phải người xử lý
    socketService.onFriendRequestResponse((data) => {

      // ✅ Nếu được accept, active lại conversation
      if (data.response === "accepted" && data.responderId) {
        const conversationStore = useConversationStore.getState();
        const conversations = conversationStore.conversations;
        const conversationToActivate = conversations.find((conv) =>
          conv.participants.some((p) => p._id === data.responderId)
        );

        if (conversationToActivate && !conversationToActivate.isActive) {
          conversationStore._updateConversation(conversationToActivate._id, {
            isActive: true,
          });
        }
      }

      // Refresh cả friends và requests
      get().getFriendsList();
      get().getFriendRequests();
      get().getSentRequests();

      // Hiển thị thông báo cho NGƯỜI GỬI
      if (data.response === "accepted") {
        toast.success("Lời mời kết bạn của bạn đã được chấp nhận!");
      } else {
        toast.info("Lời mời kết bạn của bạn đã bị từ chối");
      }
    });

    // Lắng nghe khi chính mình xử lý friend request (accept/decline)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketService.onFriendRequestProcessed((data: any) => {
      // ✅ Nếu accept, active lại conversation (dùng senderId từ friendRequest)
      if (
        data.friendRequest?.response === "accepted" &&
        data.friendRequest?.senderId
      ) {
        const conversationStore = useConversationStore.getState();
        const conversations = conversationStore.conversations;
        const senderId =
          typeof data.friendRequest.senderId === "string"
            ? data.friendRequest.senderId
            : data.friendRequest.senderId._id;

        const conversationToActivate = conversations.find((conv) =>
          conv.participants.some((p) => p._id === senderId)
        );

        if (conversationToActivate && !conversationToActivate.isActive) {

          conversationStore._updateConversation(conversationToActivate._id, {
            isActive: true,
          });
        }
      }

      // Refresh cả friends và requests ngay lập tức
      get().getFriendsList();
      get().getFriendRequests();

      // Hiển thị thông báo cho NGƯỜI XỬ LÝ
      toast.success(data.message);
    });

    // Lắng nghe khi friend request bị hủy
    socketService.onFriendRequestCancelled(() => {
      // Refresh danh sách requests
      get().getFriendRequests();

    });

    // Lắng nghe friend request được gửi thành công
    socketService.onFriendRequestSent((data) => {
      if (data.success) {
        // Refresh sent requests
        get().getSentRequests();
        toast.success("Đã gửi lời mời kết bạn!");
      } else {
        toast.error(data.message || "Không thể gửi lời mời");
      }
    });

    // Lắng nghe lỗi friend request
    socketService.onFriendRequestError((data) => {
      toast.error(data.message || "Có lỗi xảy ra");
    });

    // Lắng nghe khi hủy friend request thành công
    socketService.onCancelFriendRequestSuccess((data) => {
      if (data.success) {
        // Refresh danh sách sent requests
        get().getSentRequests();
        toast.success(data.message || "Đã hủy lời mời thành công!");
      }
    });

    // Lắng nghe khi friend bị xóa
    socketService.onFriendRemoved((data) => {

      // ✅ Đánh dấu conversation với user này là không active
      const conversationStore = useConversationStore.getState();
      const conversations = conversationStore.conversations;
      const conversationToDisable = conversations.find((conv) =>
        conv.participants.some((p) => p._id === data.fromUserId)
      );

      if (conversationToDisable) {

        conversationStore._updateConversation(conversationToDisable._id, {
          isActive: false,
        });
      }

      // Refresh danh sách friends
      get().getFriendsList();

      // Hiển thị thông báo
      toast.info(
        `${data.removedBy.displayName} đã xóa bạn khỏi danh sách bạn bè`
      );
    });

    // Lắng nghe khi xóa friend thành công
    socketService.onRemoveFriendSuccess((data) => {
      if (data.success) {
        // ✅ Đánh dấu conversation với user này là không active
        const conversationStore = useConversationStore.getState();
        const conversations = conversationStore.conversations;
        const removedFriendId = data.data?.removedFriend?._id;

        if (removedFriendId) {
          const conversationToDisable = conversations.find((conv) =>
            conv.participants.some((p) => p._id === removedFriendId)
          );

          if (conversationToDisable) {

            conversationStore._updateConversation(conversationToDisable._id, {
              isActive: false,
            });
          }
        }

        // Refresh danh sách friends
        get().getFriendsList();
        toast.success(data.message || "Đã xóa bạn bè thành công!");
      }
    });

    // Lắng nghe lỗi khi xóa friend
    socketService.onRemoveFriendError((data) => {
      toast.error(data.message || "Không thể xóa bạn bè");
      // Refresh để đồng bộ lại UI
      get().getFriendsList();
    });


    // 🏁 Đánh dấu listeners đã được setup
    set({ _listenersSetup: true });
  },

  removeSocketListeners: () => {
    // Chỉ xóa friend-related listeners, không xóa core connection listeners
    socketService.removeListener("RECEIVE_FRIEND_REQUEST");
    socketService.removeListener("FRIEND_REQUEST_RESPONSE");
    socketService.removeListener("FRIEND_REQUEST_PROCESSED");
    socketService.removeListener("FRIEND_REQUEST_CANCELLED");
    socketService.removeListener("FRIEND_REQUEST_SENT");
    socketService.removeListener("FRIEND_REQUEST_ERROR");
    socketService.removeListener("CANCEL_FRIEND_REQUEST_SUCCESS");
    socketService.removeListener("FRIEND_REMOVED");
    socketService.removeListener("REMOVE_FRIEND_SUCCESS");
    socketService.removeListener("REMOVE_FRIEND_ERROR");
    socketService.removeListener("RESPOND_FRIEND_REQUEST_SUCCESS");
    socketService.removeListener("RESPOND_FRIEND_REQUEST_ERROR");
    socketService.removeListener("FRIEND_REQUESTS_LIST");
    socketService.removeListener("FRIENDS_LIST");

    // 🔄 Reset setup flag
    set({ _listenersSetup: false });
  },
}));
