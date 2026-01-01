/**
 * User API Service - REST API operations for user management
 * Handles user profile operations with backend via HTTP requests
 */

import api from "@/lib/axios";
import type { User, UpdateProfilePayload, UpdateProfileResponse, updateAvatarPayload,  } from "@/types/user";

interface UserResponse {
  message: string;
  data?: User;
  error?: unknown;
}

interface SearchUsersResponse {
  message: string;
  data: User[];
  count: number;
  error?: unknown;
}

export const userApiService = {
  /**
   * Lấy thông tin user hiện tại
   * Backend endpoint: GET /api/user/me
   */
  getMe: async (): Promise<UserResponse> => {
    const res = await api.get("/user/me", { withCredentials: true });
    return res.data;
  },

  /**
   * Cập nhật thông tin profile
   * Backend endpoint: PUT /api/user/profile
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<UpdateProfileResponse> => {
    const res = await api.put("/user/profile", payload, { withCredentials: true });
    return res.data;
  },

  /**
   * Upload avatar image
   * Backend endpoint: POST /api/user/avatar
   */
  uploadAvatar: async (file: File): Promise<UpdateProfileResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const res = await api.post("/user/avatar", formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  /**
   * Delete current avatar
   * Backend endpoint: DELETE /api/user/avatar
   */
  deleteAvatar: async (): Promise<updateAvatarPayload> => {
    const res = await api.delete("/user/avatar", { withCredentials: true });
    return res.data;
  },

  /**
   * Tìm kiếm người dùng
   * Backend endpoint: GET /api/user/search?q=query
   */
  searchUsers: async (query: string): Promise<SearchUsersResponse> => {
    const res = await api.get(
      `/user/search?q=${encodeURIComponent(query)}`,
      { withCredentials: true }
    );
    return res.data;
  },

  /**
   * Validate phone number format
   */
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[\\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate bio length
   */
  validateBio: (bio: string): boolean => {
    return bio.length <= 160;
  },

  /**
   * Validate display name
   */
  validateDisplayName: (displayName: string): boolean => {
    return displayName.trim().length > 0 && displayName.trim().length <= 50;
  },

  /**
   * Validate image file for avatar upload
   */
  validateImageFile: (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file hình ảnh (JPG, PNG, GIF, WebP)'
      };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Kích thước file không được vượt quá 5MB'
      };
    }

    return { valid: true };
  }
};