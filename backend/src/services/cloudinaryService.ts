/**
 * Cloudinary Service - Handles image upload operations
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Validate environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary configuration. Please check your .env file.');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});


interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  };
  error?: unknown;
}

export class CloudinaryService {
  /**
   * Upload avatar image to Cloudinary
   */
  static async uploadAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return {
          success: false,
          message: 'Chỉ chấp nhận file hình ảnh (jpg, png, gif, webp)'
        };
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          message: 'Kích thước file không được vượt quá 5MB'
        };
      }

      // Upload to Cloudinary
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'chat_app/avatars',
            public_id: `avatar_${userId}_${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto:good' },
              { format: 'auto' }
            ],
            overwrite: true,
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result as CloudinaryUploadResult);
            } else {
              reject(new Error('Upload failed'));
            }
          }
        ).end(file.buffer);
      });

      return {
        success: true,
        message: 'Upload hình ảnh thành công',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        }
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        message: 'Lỗi upload hình ảnh',
        error
      };
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<UploadResponse> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        return {
          success: true,
          message: 'Xóa hình ảnh thành công'
        };
      } else {
        return {
          success: false,
          message: 'Không thể xóa hình ảnh'
        };
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        message: 'Lỗi xóa hình ảnh',
        error
      };
    }
  }

  /**
   * Get optimized avatar URL with transformations
   */
  static getAvatarUrl(publicId: string, size: number = 200): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width: size, height: size, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    });
  }

  /**
   * Validate Cloudinary configuration
   */
  static validateConfig(): boolean {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    const isValid = !!(cloud_name && api_key && api_secret);

    if (!isValid) {
      console.error('❌ Cloudinary configuration is invalid:');
    }

    return isValid;
  }

  /**
   * Test Cloudinary connection
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.validateConfig()) {
        return {
          success: false,
          message: 'Cloudinary configuration is invalid'
        };
      }

      // Test by getting account details
      const result = await cloudinary.api.ping();

      return {
        success: true,
        message: 'Cloudinary connection successful'
      };
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
      return {
        success: false,
        message: `Cloudinary connection failed: ${error}`
      };
    }
  }
}