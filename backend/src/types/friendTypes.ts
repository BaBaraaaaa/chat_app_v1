// Socket events cho friend requests
export interface FriendSocketEvents {
  // Client to Server events
  SEND_FRIEND_REQUEST: (data: {
    toUserId?: string;
    toUsername?: string;
    fromUserId: string;
    message?: string;
  }) => void;

  RESPOND_FRIEND_REQUEST: (data: {
    requestId: string;
    response: "accepted" | "declined";
    userId: string;
  }) => void;

  CANCEL_FRIEND_REQUEST: (data: {
    requestId: string;
    userId: string;
  }) => void;

  GET_FRIEND_REQUESTS: (data: {
    userId: string;
  }) => void;

  GET_FRIENDS_LIST: (data: {
    userId: string;
  }) => void;

  // Server to Client events
  RECEIVE_FRIEND_REQUEST: (data: {
    request: any;
    message: string;
  }) => void;

  FRIEND_REQUEST_SENT: (data: {
    success: boolean;
    message: string;
    data?: any;
  }) => void;

  FRIEND_REQUEST_ERROR: (data: {
    success: boolean;
    message: string;
    hasReverseRequest?: boolean;
  }) => void;

  FRIEND_REQUEST_RESPONSE: (data: {
    requestId: string;
    response: "accepted" | "declined";
    responderId: string;
    message: string;
    data?: any;
  }) => void;

  RESPOND_FRIEND_REQUEST_SUCCESS: (data: {
    success: boolean;
    requestId: string;
    response: "accepted" | "declined";
    message: string;
    data?: any;
  }) => void;

  RESPOND_FRIEND_REQUEST_ERROR: (data: {
    success: boolean;
    message: string;
  }) => void;

  FRIEND_REQUEST_CANCELLED: (data: {
    requestId: string;
    fromUserId: string;
    message: string;
  }) => void;

  CANCEL_FRIEND_REQUEST_SUCCESS: (data: {
    success: boolean;
    message: string;
    data?: any;
  }) => void;

  CANCEL_FRIEND_REQUEST_ERROR: (data: {
    success: boolean;
    message: string;
  }) => void;

  FRIEND_REQUESTS_LIST: (data: {
    success: boolean;
    message: string;
    data?: any;
  }) => void;

  FRIENDS_LIST: (data: {
    success: boolean;
    message: string;
    data?: any;
  }) => void;
}

// Response types cho REST API và Socket
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  hasReverseRequest?: boolean;
}

// Friend request notification data
export interface FriendRequestNotification {
  type: "friend_request" | "friend_accepted" | "friend_declined" | "friend_cancelled";
  fromUserId: string;
  toUserId: string;
  requestId: string;
  message: string;
  timestamp: Date;
  data?: any;
}