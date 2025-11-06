import type { User } from "./user";


export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  hasLoggedOut: boolean;
  darkMode: boolean;
  setAccessToken: (accessToken: string | null) => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; error?: unknown }>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearState: () => void;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<string | null>;
    toggleDarkMode: () => void;
}
export interface Friend {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string;
    isOnline?: boolean;
    lastSeen?: string;
    status?: string;
}

export interface FriendRequest {
    _id: string;
    fromUserId: string;
    toUserId: {
        _id: string;
        displayName: string;
        avatarUrl?: string;
        lastName?: string;
        firstName?: string;
    };
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FriendState {
    friends: Friend[];
    receivedRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    loading: boolean;
    getFriendsList: () => Promise<void>;
    getFriendRequests: () => Promise<void>;
    getSentRequests: () => Promise<void>;
    sendFriendRequest: (userId: string, message?: string) => Promise<void>;
    sendFriendRequestByUsername: (username: string, message?: string) => Promise<void>;
    acceptFriendRequest: (requestId: string) => Promise<void>;
    declineFriendRequest: (requestId: string) => Promise<void>;
    cancelFriendRequest: (requestId: string) => Promise<void>;
}
