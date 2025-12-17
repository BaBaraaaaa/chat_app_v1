# Cloudinary Setup Guide

## 1. Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard to get your credentials

## 2. Add Environment Variables
Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 3. Features Implemented

### Backend Features:
- ✅ **Image Upload** - POST /api/user/avatar
- ✅ **Image Delete** - DELETE /api/user/avatar  
- ✅ **Auto Image Optimization** - Resize to 400x400, face detection
- ✅ **File Validation** - Size limit 5MB, image types only
- ✅ **Old Avatar Cleanup** - Auto delete previous avatar

### Frontend Features:
- ✅ **Avatar Click Menu** - Upload/Delete options
- ✅ **Drag & Drop Upload** - File input with validation
- ✅ **Loading States** - Progress indicators
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Real-time Updates** - Avatar shows immediately after upload

## 4. File Structure
```
backend/
├── src/
│   ├── services/
│   │   └── cloudinaryService.ts     # Cloudinary operations
│   ├── middleware/
│   │   └── uploadMiddleware.ts      # Multer config
│   └── controllers/
│       └── userController.ts       # Upload/delete endpoints

frontend/
├── src/
│   ├── services/
│   │   └── userApiService.ts       # API calls
│   └── components/
│       └── settings/
│           └── ProfileSection.tsx  # UI component
```

## 5. Usage
1. Click on avatar or camera icon
2. Select "Thay đổi avatar" to upload
3. Choose image file (JPG, PNG, GIF, WebP)
4. Image will be auto-resized and optimized
5. Select "Xóa avatar" to remove current avatar

## 6. Technical Details
- **Auto Optimization**: 400x400px, face-centered crop
- **Format Conversion**: Auto WebP for better compression  
- **Quality**: Auto-optimized for web
- **Storage**: Organized in `chat_app/avatars/` folder
- **Validation**: Client + server-side validation