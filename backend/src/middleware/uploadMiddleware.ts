/**
 * Multer Configuration for File Uploads
 */

import multer from 'multer';
import { Request } from 'express';

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Accept image files
    cb(null, true);
  } else {
    // Reject non-image files
    cb(new Error('Chỉ chấp nhận file hình ảnh'));
  }
};

// Multer configuration for memory storage
export const uploadConfig = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for single avatar upload
export const uploadAvatar = uploadConfig.single('avatar');