import type { User, UpdateProfilePayload } from '@/type/user'
import { Person, CameraAlt, Edit, Close, Save, Delete } from '@mui/icons-material'
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  IconButton, 
  Chip, 
  TextField, 
  Box, 
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { useState, useRef } from 'react'
import { userApiService } from '@/services/userApiService'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import AvatarCropper from './AvatarCropper'

interface ProfileProps {
  user: User | null
}

const ProfileSection = ({user}: ProfileProps) => {
  const { updateUser, updateAvatar } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });

  const handleInputChange = (field: keyof UpdateProfilePayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!userApiService.validateDisplayName(formData.displayName)) {
      setError('Tên hiển thị không được để trống và không quá 50 ký tự');
      return false;
    }
    
    if (formData.bio && !userApiService.validateBio(formData.bio)) {
      setError('Bio không được quá 160 ký tự');
      return false;
    }
    
    if (formData.phone && !userApiService.validatePhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const payload: UpdateProfilePayload = {
        displayName: formData.displayName.trim(),
        bio: formData.bio.trim(),
        phone: formData.phone.trim() || undefined
      };
      
      const response = await userApiService.updateProfile(payload);
      
      // Cập nhật user trong auth store
      updateUser(response.data.user);
      
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.log('Cập nhật thất bại', error);
      toast.error('Cập nhật thông tin thất bại! Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarMenuAnchor(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchor(null);
  };

  const handleUploadAvatar = () => {
    handleAvatarMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = userApiService.validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Create image URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropperOpen(true);
  };

  const handleDeleteAvatar = async () => {
    handleAvatarMenuClose();
    setIsUploadingAvatar(true);
    try {
       await userApiService.deleteAvatar();
      updateAvatar(null);
      toast.success('Xóa avatar thành công!');
    } catch (error: unknown) {
      let errorMessage = 'Có lỗi xảy ra khi xóa avatar';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingAvatar(true);
    setCropperOpen(false);
    
    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      const response = await userApiService.uploadAvatar(croppedFile);
      if (!response.data.user.avatarUrl)
      {
        console.log(response.data);
        toast.error('Không nhận được URL avatar từ server');
        return;
      }
      updateAvatar(response.data.user.avatarUrl);
      toast.success('Cập nhật avatar thành công!');
    } catch (error: unknown) {
      let errorMessage = 'Có lỗi xảy ra khi upload avatar';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
      // Cleanup
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
       <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Avatar and Basic Info */}
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <Person />
            Thông tin cá nhân
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user?.avatarUrl}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                  cursor: "pointer"
                }}
                onClick={handleAvatarClick}
              >
                {!user?.avatarUrl && (user?.displayName?.charAt(0) || "U")}
              </Avatar>
              <IconButton
                size="small"
                disabled={isUploadingAvatar}
                onClick={handleAvatarClick}
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                {isUploadingAvatar ? (
                  <CircularProgress size={16} />
                ) : (
                  <CameraAlt fontSize="small" />
                )}
              </IconButton>
              
              {/* Avatar Menu */}
              <Menu
                anchorEl={avatarMenuAnchor}
                open={Boolean(avatarMenuAnchor)}
                onClose={handleAvatarMenuClose}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleUploadAvatar}>
                  <ListItemIcon>
                    <CameraAlt fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Thay đổi avatar</ListItemText>
                </MenuItem>
                {user?.avatarUrl && (
                  <MenuItem onClick={handleDeleteAvatar}>
                    <ListItemIcon>
                      <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Xóa avatar</ListItemText>
                  </MenuItem>
                )}
              </Menu>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6">{user?.displayName}</Typography>
                {!isEditing && (
                  <IconButton size="small" onClick={handleEdit}>
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.bio || 'Chưa có giới thiệu'}
              </Typography>
              <Chip
                label="Hoạt động"
                size="small"
                color="success"
                sx={{ mt: 1, display: 'block', width: 'fit-content' }}
              />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tên hiển thị *
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                disabled={!isEditing || isLoading}
                placeholder="Nhập tên hiển thị"
                error={isEditing && formData.displayName.trim().length === 0}
                helperText={isEditing && formData.displayName.trim().length === 0 ? 'Tên hiển thị không được để trống' : ''}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Giới thiệu
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing || isLoading}
                placeholder="Viết vài dòng về bản thân..."
                helperText={`${formData.bio.length}/160 ký tự`}
                error={formData.bio.length > 160}
              />
            </Box>
          </Box>

          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Hủy
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin liên hệ
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                defaultValue={user?.email}
                disabled
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Số điện thoại
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing || isLoading}
                placeholder="+84 xxx xxx xxx"
                error={isEditing && formData.phone.length > 0 && !userApiService.validatePhone(formData.phone)}
                helperText={isEditing && formData.phone.length > 0 && !userApiService.validatePhone(formData.phone) ? 'Số điện thoại không hợp lệ' : ''}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Avatar Cropper Dialog */}
      {selectedImage && (
        <AvatarCropper
          open={cropperOpen}
          onClose={handleCropperClose}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          isUploading={isUploadingAvatar}
        />
      )}
    </Box>
  )
}

export default ProfileSection