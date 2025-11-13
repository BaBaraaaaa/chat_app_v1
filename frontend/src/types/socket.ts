import type{ Friend } from '../type/store';
// Socket.IO Event Types
export interface FriendRequestData {
  fromUserId: string;
  toUserId?: string;
  toUsername?: string;
  message?: string;
}

export interface FriendRequestResponse {
  success: boolean;
  message: string;
  data?: FriendRequest;
  hasReverseRequest?: boolean;
}

export interface RespondFriendRequestData {
  requestId: string;
  response: "accepted" | "declined";
}

export interface FriendRequest {
  _id: string;
  fromUserId: {
    _id: string;
    username: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  toUserId: {
    _id: string;
    username: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  status: "pending" | "accepted" | "declined" | "cancelled";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface ReceiveFriendRequestData {
  type: string;
  request: FriendRequest;
  message: string;
  timestamp: string;
}

export interface FriendRequestResponseData {
  type: string;
  requestId: string;
  response: "accepted" | "declined";
  responderId: string;
  message: string;
  data?: FriendRequest;
  timestamp: string;
}

export interface FriendRequestProcessedData {
  requestId: string;
  response: "accepted" | "declined";
  message: string;
  data?: FriendRequest;
}

export interface RespondFriendRequestSuccessData {
  success: boolean;
  requestId: string;
  response: "accepted" | "declined";
  message: string;
  data?: FriendRequest;
}

export interface RespondFriendRequestErrorData {
  success: boolean;
  message: string;
}

export interface FriendRequestCancelledData {
  type: string;
  requestId: string;
  fromUserId: string;
  message: string;
  timestamp: string;
}

export interface CancelFriendRequestSuccessData {
  success: boolean;
  message: string;
  data?: FriendRequest;
}

export interface FriendRequestsListData {
  success: boolean;
  message: string;
  data?: FriendRequest[];
}

export interface FriendsListData {
  success: boolean;
  message: string;
  data?: {
    friends: Friend[];
  };
}

export interface OnlineUsersListData {
  success: boolean;
  data: string[];
  count: number;
}

export interface RemoveFriendData {
  friendId: string;
}

export interface FriendRemovedData {
  fromUserId: string;
  message: string;
  removedBy: {
    _id: string;
    displayName: string;
  };
}

export interface RemoveFriendSuccessData {
  success: boolean;
  message: string;
  data?: {
    removedFriend: {
      _id: string;
      username: string;
      displayName: string;
      email: string;
    };
  };
}

export interface RemoveFriendErrorData {
  success: boolean;
  message: string;
}

// Socket Event Callback Types
export type SocketEventCallback<T = unknown> = (data: T) => void;

export type FriendRequestReceivedHandler = SocketEventCallback<FriendRequestData>;
export type FriendRequestResponseHandler = SocketEventCallback<FriendRequestResponseData>;
export type FriendRequestProcessedHandler = SocketEventCallback<FriendRequestProcessedData>;
export type OnlineUsersListHandler = SocketEventCallback<OnlineUsersListData>;
export type FriendRemovedHandler = SocketEventCallback<FriendRemovedData>;
export type RemoveFriendSuccessHandler = SocketEventCallback<RemoveFriendSuccessData>;
export type RemoveFriendErrorHandler = SocketEventCallback<RemoveFriendErrorData>;

// Generic Socket Response
export interface SocketResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}