/**
 * Message & Conversation Types - Frontend
 * Mirrors backend types for type safety
 */

// ==================== ENUMS AS CONST ====================

export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  SYSTEM: "system"
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageStatus = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read"
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export const ConversationType = {
  DIRECT: "direct",
  GROUP: "group"
} as const;

export type ConversationType = typeof ConversationType[keyof typeof ConversationType];

// ==================== MESSAGE TYPES ====================

export interface MessageAttachment {
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
  receiverId?: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    firstName?: string;
    lastName?: string;
  };
  content: string;
  type: MessageType;
  status: MessageStatus;
  attachments?: MessageAttachment[];
  replyTo?: Message;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  readAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CONVERSATION TYPES ====================

export interface ConversationParticipant {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ConversationLastMessage {
  content: string;
  senderId: string | ConversationParticipant;
  sentAt: string;
  type: string;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  lastMessage?: ConversationLastMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== SOCKET EVENT TYPES ====================

// Send Message
export interface SendMessagePayload {
  conversationId: string;
  receiverId: string;
  content: string;
  type?: MessageType;
  attachments?: MessageAttachment[];
  replyTo?: string;
}

export interface MessageSentResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface NewMessageResponse {
  message: Message;
  conversationId: string;
}

// Get Messages
export interface GetMessagesPayload {
  conversationId: string;
  limit?: number;
  skip?: number;
}

export interface MessagesListResponse {
  success: boolean;
  message: string;
  data: {
    messages: Message[];
    total: number;
    hasMore: boolean;
  };
}

// Mark as Read
export interface MarkMessageReadPayload {
  messageId: string;
}

export interface MarkReadSuccessResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface MessageReadResponse {
  messageId: string;
  readBy: string;
  readAt: string;
}

// Mark All as Read
export interface MarkAllReadPayload {
  conversationId: string;
}

export interface MarkAllReadSuccessResponse {
  success: boolean;
  message: string;
  data: { count: number };
}

// Delete Message
export interface DeleteMessagePayload {
  messageId: string;
}

export interface DeleteMessageSuccessResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface MessageDeletedResponse {
  messageId: string;
  conversationId: string;
}

// Edit Message
export interface EditMessagePayload {
  messageId: string;
  newContent: string;
}

export interface EditMessageSuccessResponse {
  success: boolean;
  message: string;
  data: Message;
}

export interface MessageEditedResponse {
  messageId: string;
  newContent: string;
  conversationId: string;
  editedAt: string;
}

// Typing Indicator
export interface TypingPayload {
  conversationId: string;
  receiverId: string;
}

export interface UserTypingResponse {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// Unread Count
export interface GetUnreadCountPayload {
  conversationId?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { count: number };
}

// Join/Leave Conversation
export interface JoinConversationPayload {
  conversationId: string;
}

export interface LeaveConversationPayload {
  conversationId: string;
}

// ==================== CONVERSATION SOCKET EVENT TYPES ====================

// Get or Create Conversation
export interface GetOrCreateConversationPayload {
  otherUserId: string;
}

export interface ConversationCreatedResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

// Get Conversations List
export interface ConversationsListResponse {
  success: boolean;
  message: string;
  data: Conversation[];
}

// Get Conversation Detail
export interface GetConversationDetailPayload {
  conversationId: string;
}

export interface ConversationDetailResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

// Search Conversations
export interface SearchConversationsPayload {
  query: string;
}

export interface SearchConversationsResultResponse {
  success: boolean;
  message: string;
  data: Conversation[];
}

// Delete Conversation
export interface DeleteConversationPayload {
  conversationId: string;
}

export interface DeleteConversationSuccessResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

// Total Unread Count
export interface TotalUnreadCountResponse {
  success: boolean;
  message: string;
  data: { totalUnread: number };
}

// Reset Unread Count
export interface ResetUnreadCountPayload {
  conversationId: string;
}

export interface ResetUnreadCountSuccessResponse {
  success: boolean;
  message: string;
  data: Conversation;
}

// Error Response
export interface MessageErrorResponse {
  success: false;
  message: string;
  error?: unknown;
}

export interface ConversationErrorResponse {
  success: false;
  message: string;
  error?: unknown;
}

// ==================== CALLBACK TYPES ====================

export type SocketEventCallback<T = unknown> = (data: T) => void;
