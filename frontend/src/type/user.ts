export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  avatarId?: string;
  phone?: string;
  friends?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  message: string;
  data: {user: User};
}
export interface updateAvatarPayload {
  avatarUrl?: string | null;
}
export interface UpdateAvatarResponse {
  message: string;
  data: {
    url: string | null;
    publicId: string | null;
    width: number | null;
    height: number | null;
  };
}
