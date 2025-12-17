/**
 * Avatar Cropper Component
 * Provides image cropping functionality for avatar uploads
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  CircularProgress
} from '@mui/material';
import Cropper from 'react-cropper';

// Add cropperjs CSS directly
const cropperCSS = `
/*!
 * Cropper.js v1.6.1
 * https://fengyuanchen.github.io/cropperjs
 */

.cropper-container {
  direction: ltr;
  font-size: 0;
  line-height: 0;
  position: relative;
  -ms-touch-action: none;
  touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.cropper-container img {
  display: block;
  height: 100%;
  image-orientation: 0deg;
  max-height: none;
  max-width: none;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.cropper-wrap-box,
.cropper-canvas,
.cropper-drag-box,
.cropper-crop-box,
.cropper-modal {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.cropper-wrap-box,
.cropper-canvas {
  overflow: hidden;
}

.cropper-drag-box {
  background-color: #fff;
  opacity: 0;
}

.cropper-modal {
  background-color: #000;
  opacity: 0.5;
}

.cropper-view-box {
  display: block;
  height: 100%;
  outline: 1px solid #39f;
  outline-color: rgba(51, 153, 255, 0.75);
  overflow: hidden;
  width: 100%;
}

.cropper-dashed {
  border: 0 dashed #eee;
  display: block;
  opacity: 0.5;
  position: absolute;
}

.cropper-dashed.dashed-h {
  border-bottom-width: 1px;
  border-top-width: 1px;
  height: calc(100% / 3);
  left: 0;
  top: calc(100% / 3);
  width: 100%;
}

.cropper-dashed.dashed-v {
  border-left-width: 1px;
  border-right-width: 1px;
  height: 100%;
  left: calc(100% / 3);
  top: 0;
  width: calc(100% / 3);
}

.cropper-center {
  display: block;
  height: 0;
  left: 50%;
  opacity: 0.75;
  position: absolute;
  top: 50%;
  width: 0;
}

.cropper-center::before,
.cropper-center::after {
  background-color: #eee;
  content: ' ';
  display: block;
  position: absolute;
}

.cropper-center::before {
  height: 1px;
  left: -3px;
  top: 0;
  width: 7px;
}

.cropper-center::after {
  height: 7px;
  left: 0;
  top: -3px;
  width: 1px;
}

.cropper-face,
.cropper-line,
.cropper-point {
  display: block;
  height: 100%;
  opacity: 0.1;
  position: absolute;
  width: 100%;
}

.cropper-face {
  background-color: #fff;
  left: 0;
  top: 0;
}

.cropper-line {
  background-color: #39f;
}

.cropper-line.line-e {
  cursor: ew-resize;
  right: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-n {
  cursor: ns-resize;
  height: 5px;
  left: 0;
  top: -3px;
}

.cropper-line.line-w {
  cursor: ew-resize;
  left: -3px;
  top: 0;
  width: 5px;
}

.cropper-line.line-s {
  bottom: -3px;
  cursor: ns-resize;
  height: 5px;
  left: 0;
}

.cropper-point {
  background-color: #39f;
  height: 5px;
  opacity: 0.75;
  width: 5px;
}

.cropper-point.point-e {
  cursor: ew-resize;
  margin-top: -3px;
  right: -3px;
  top: 50%;
}

.cropper-point.point-n {
  cursor: ns-resize;
  left: 50%;
  margin-left: -3px;
  top: -3px;
}

.cropper-point.point-w {
  cursor: ew-resize;
  left: -3px;
  margin-top: -3px;
  top: 50%;
}

.cropper-point.point-s {
  bottom: -3px;
  cursor: ns-resize;
  left: 50%;
  margin-left: -3px;
}

.cropper-point.point-ne {
  cursor: nesw-resize;
  right: -3px;
  top: -3px;
}

.cropper-point.point-nw {
  cursor: nwse-resize;
  left: -3px;
  top: -3px;
}

.cropper-point.point-sw {
  bottom: -3px;
  cursor: nesw-resize;
  left: -3px;
}

.cropper-point.point-se {
  bottom: -3px;
  cursor: nwse-resize;
  right: -3px;
}

.cropper-invisible {
  opacity: 0;
}

.cropper-bg {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}

.cropper-hide {
  display: block;
  height: 0;
  position: absolute;
  width: 0;
}

.cropper-hidden {
  display: none !important;
}

.cropper-move {
  cursor: move;
}

.cropper-crop {
  cursor: crosshair;
}

.cropper-disabled .cropper-drag-box,
.cropper-disabled .cropper-face,
.cropper-disabled .cropper-line,
.cropper-disabled .cropper-point {
  cursor: not-allowed;
}
`;

// Inject CSS into head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('cropper-css');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'cropper-css';
    style.textContent = cropperCSS;
    document.head.appendChild(style);
  }
}

interface CropperInstance {
  cropper: {
    getCroppedCanvas: (options: {
      width?: number;
      height?: number;
      imageSmoothingQuality?: string;
    }) => HTMLCanvasElement;
    zoomTo: (value: number) => void;
    rotate: (degree: number) => void;
    reset: () => void;
  };
}

interface AvatarCropperProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  isUploading?: boolean;
}

const AvatarCropper = ({ 
  open, 
  onClose, 
  imageSrc, 
  onCropComplete, 
  isUploading = false 
}: AvatarCropperProps) => {
  const cropperRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [cropperReady, setCropperReady] = useState(false);

  // Reset cropper state when dialog opens
  useEffect(() => {
    if (open) {
      setCropperReady(false);
      setZoom(1);
    }
  }, [open]);

  const getCropData = useCallback(() => {
    const cropperElement = cropperRef.current as unknown as CropperInstance;
    if (cropperElement?.cropper) {
      try {
        const canvas = cropperElement.cropper.getCroppedCanvas({
          width: 400,
          height: 400,
          imageSmoothingQuality: 'high'
        });
        
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            onCropComplete(blob);
          } else {
            console.error('Failed to create blob from canvas');
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        console.error('Error getting crop data:', error);
      }
    } else {
      console.error('Cropper instance not found');
    }
  }, [onCropComplete]);

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    const zoomValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setZoom(zoomValue);
    
    if (!cropperReady) return;
    
    const cropperElement = cropperRef.current as unknown as CropperInstance;
    if (cropperElement?.cropper) {
      try {
        cropperElement.cropper.zoomTo(zoomValue);
      } catch (error) {
        console.error('Error zooming:', error);
      }
    }
  };

  const handleRotateLeft = () => {
    const cropperElement = cropperRef.current as unknown as CropperInstance;
    if (cropperElement?.cropper) {
      cropperElement.cropper.rotate(-90);
    }
  };

  const handleRotateRight = () => {
    const cropperElement = cropperRef.current as unknown as CropperInstance;
    if (cropperElement?.cropper) {
      cropperElement.cropper.rotate(90);
    }
  };

  const handleReset = () => {
    const cropperElement = cropperRef.current as unknown as CropperInstance;
    if (cropperElement?.cropper) {
      cropperElement.cropper.reset();
      setZoom(1);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: 600 }
      }}
    >
      <DialogTitle>
        Chỉnh sửa ảnh đại diện
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Kéo để di chuyển, cuộn chuột hoặc dùng thanh trượt để phóng to/thu nhỏ
          </Typography>
          
          {/* Cropper */}
          <Box sx={{ 
            width: '100%', 
            height: 350,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2,
            '& .cropper-container': {
              width: '100% !important',
              height: '100% !important'
            }
          }}>
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: '100%', width: '100%' }}
              aspectRatio={1}
              guides={true}
              center={true}
              cropBoxMovable={true}
              cropBoxResizable={false}
              dragMode="move"
              toggleDragModeOnDblclick={false}
              viewMode={1}
              background={true}
              responsive={true}
              autoCropArea={0.8}
              checkOrientation={true}
              restore={false}
              modal={true}
              highlight={true}
              minCropBoxWidth={100}
              minCropBoxHeight={100}
              ready={() => {
                setCropperReady(true);
              }}
            />
          </Box>

          {!cropperReady && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Đang tải hình ảnh...</Typography>
            </Box>
          )}
          
          {/* Zoom Control */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Phóng to/Thu nhỏ
            </Typography>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              min={0.1}
              max={3}
              step={0.1}
              disabled={!cropperReady || isUploading}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Box>

          {/* Rotation Controls */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleRotateLeft}
              disabled={!cropperReady || isUploading}
            >
              ↺ Xoay trái
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleRotateRight}
              disabled={!cropperReady || isUploading}
            >
              ↻ Xoay phải
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleReset}
              disabled={!cropperReady || isUploading}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isUploading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={getCropData}
          disabled={!cropperReady || isUploading}
          startIcon={isUploading ? <CircularProgress size={16} /> : undefined}
        >
          {isUploading ? 'Đang upload...' : 'Áp dụng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarCropper;