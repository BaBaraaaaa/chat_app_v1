import { useState, memo, useCallback } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { MoreVert, Edit, Delete, Reply, Check, DoneAll } from '@mui/icons-material';
import type { Message as MessageType } from '@/types/message';

interface MessageItemProps {
  message: MessageType;
  isOwn: boolean;
  senderName: string;
  senderAvatar?: string;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

function MessageItemMui({
  message,
  isOwn,
  senderName,
  senderAvatar,
  onEdit,
  onDelete,
  onReply
}: MessageItemProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const formatTime = (dateString: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      if (/^\d{1,2}:\d{2}$/.test(dateString)) {
        return dateString;
      }
      return '';
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case "sent":
        return <Check sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />;
      case "delivered":
        return <DoneAll sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />;
      case "read":
        return <DoneAll sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle', color: 'info.main' }} />;
      default:
        return null;
    }
  };

  if (message.type === 'system') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          my: 2,
          width: '100%'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 0.5,
            bgcolor: 'action.hover',
            borderRadius: '16px',
            maxWidth: '90%'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              display: 'block'
            }}
          >
            {message.content}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        '&:hover .message-actions': {
          opacity: 1,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, maxWidth: { xs: '85%', sm: '70%' } }}>
        {!isOwn && (
          <Avatar
            src={senderAvatar}
            alt={senderName}
            sx={{ width: 32, height: 32, bgcolor: 'grey.400', fontSize: '0.875rem' }}
          >
            {senderName.charAt(0).toUpperCase()}
          </Avatar>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Paper
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: isOwn ? 'primary.main' : 'text.secondary',
              color: isOwn ? 'primary.contrastText' : 'text.primary',
              borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            }}
          >
            {message.isEdited && (
              <Typography
                variant="caption"
                sx={{
                  fontStyle: 'italic',
                  opacity: 0.7,
                  display: 'block',
                  mb: 0.5
                }}
              >
                Đã chỉnh sửa
              </Typography>
            )}

            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                mt: 0.5
              }}
            >
              {formatTime(message.createdAt)}
              {renderStatusIcon()}
            </Typography>
          </Paper>

          {isOwn && (
            <>
              <IconButton
                size="small"
                className="message-actions"
                onClick={handleMenuOpen}
                sx={{
                  opacity: { xs: 1, sm: 0 },
                  transition: 'opacity 0.2s'
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {onEdit && (
                  <MenuItem onClick={() => { onEdit?.(message._id); handleMenuClose(); }}>
                    <ListItemIcon>
                      <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                  </MenuItem>
                )}
                {onReply && (
                  <MenuItem onClick={() => { onReply?.(message._id); handleMenuClose(); }}>
                    <ListItemIcon>
                      <Reply fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Trả lời</ListItemText>
                  </MenuItem>
                )}
                {onDelete && (
                  <MenuItem onClick={() => { onDelete?.(message._id); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                      <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Xóa</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(MessageItemMui);
