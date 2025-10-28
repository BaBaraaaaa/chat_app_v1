import type { User } from "./user";


export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  hasLoggedOut: boolean;

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
}
