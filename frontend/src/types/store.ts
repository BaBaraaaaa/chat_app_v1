import type { User } from "./user";
import type { FriendRequest } from "./socket";


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
  initializeAuth: () => Promise<boolean>;
  clearState: () => void;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<string | null>;
  toggleDarkMode: () => void;
  updateUser: (userData: User) => void;
  updateAvatar: (avatarUrl: string | null | undefined) => void;
  handleTokenRefresh: (newAccessToken: string) => Promise<void>;
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


