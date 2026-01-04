import type { FriendRequest } from "./socket";
import type { Friend } from "./store";

export interface FriendState {
    friends: Friend[];
    receivedRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    loading: boolean;

    // Internal flags
    _listenersSetup: boolean;

    // REST API methods
    getFriendsList: () => Promise<void>;
    getFriendRequests: () => Promise<void>;
    getSentRequests: () => Promise<void>;
    sendFriendRequest: (userId: string, message?: string) => Promise<void>;
    sendFriendRequestByUsername: (username: string, message?: string) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    declineFriendRequest: (requestId: string) => Promise<void>;
    cancelFriendRequest: (requestId: string) => Promise<void>;
    removeFriend: (friendId: string) => Promise<void>;

    // Socket.IO methods
    sendFriendRequestSocket: (toUserId: string, fromUserId: string, message?: string) => Promise<void>;
    acceptFriendRequestSocket: (requestId: string, userId: string) => Promise<void>;
    declineFriendRequestSocket: (requestId: string, userId: string) => Promise<void>;
    cancelFriendRequestSocket: (requestId: string, userId: string) => Promise<void>;
    setupSocketListeners: () => void;
    removeSocketListeners: () => void;
}