import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, InputAdornment, Alert, Button } from '@mui/material';
import { Send, EmojiEmotions, AttachFile, Close } from '@mui/icons-material';
import { useMessageStore } from '@/stores/useMessageStore';
import { useConversationStore } from '@/stores/useConversationStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface MessageInputProps {
  initialValue?: string;
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  editingMessageId?: string | null;
  onCancelEdit?: () => void;
}

export default function MessageInputMui({ 
  initialValue = '',
  onSendMessage, 
  disabled = false,
  editingMessageId,
  onCancelEdit
}: MessageInputProps) {
  const { startTyping, stopTyping } = useMessageStore();
  const { currentConversation } = useConversationStore();
  const { user } = useAuthStore();

  const [localValue, setLocalValue] = useState(initialValue);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Sync khi initialValue thay đổi (chỉ khi edit)
  useEffect(() => {
    if (editingMessageId && initialValue) {
      setLocalValue(initialValue);
    } else if (!editingMessageId) {
      setLocalValue('');
    }
  }, [editingMessageId, initialValue]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setLocalValue(val);

      if (!currentConversation || !user) return;
      const receiver = currentConversation.participants.find(p => p._id !== user._id);
      if (!receiver) return;

      if (!isTypingRef.current) {
        startTyping(currentConversation._id, receiver._id);
        isTypingRef.current = true;
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentConversation._id, receiver._id);
        isTypingRef.current = false;
      }, 3000);
    },
    [currentConversation, user, startTyping, stopTyping]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && currentConversation && user) {
        const receiver = currentConversation.participants.find(p => p._id !== user._id);
        if (receiver) {
          stopTyping(currentConversation._id, receiver._id);
        }
      }
    };
  }, [currentConversation, user, stopTyping]);

  const handleSend = useCallback(() => {
    console.log("🔵 MessageInput handleSend called:", { localValue, disabled });
    if (localValue.trim() && !disabled) {
      console.log("✅ Conditions met, calling onSendMessage");
      
      // Stop typing khi gửi
      if (isTypingRef.current && currentConversation && user) {
        const receiver = currentConversation.participants.find(p => p._id !== user._id);
        if (receiver) {
          stopTyping(currentConversation._id, receiver._id);
          isTypingRef.current = false;
        }
      }
      onSendMessage(localValue.trim());
      setLocalValue('');
    } else {
      console.log("❌ Send blocked:", { hasContent: !!localValue.trim(), disabled });
    }
  }, [localValue, disabled, onSendMessage, currentConversation, user, stopTyping]);

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setLocalValue('');
  };

  return (
    <Box>
      {/* Edit Mode Banner */}
      {editingMessageId && (
        <Alert 
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleCancel} startIcon={<Close />}>
              Hủy
            </Button>
          }
          sx={{ borderRadius: 0 }}
        >
          Đang chỉnh sửa tin nhắn
        </Alert>
      )}

      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={6}
          placeholder={disabled ? "Không thể gửi tin nhắn" : "Nhập tin nhắn..."}
          value={localValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          sx={{
            
            '& .MuiInputBase-root': {
              alignItems: 'center',
            },
            '& .MuiInputBase-input': {
              maxHeight: '150px',
              overflowY: 'auto !important',
            }
          }}
          
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                <IconButton size="small" disabled={disabled}>
                  <EmojiEmotions />
                </IconButton>
                <IconButton size="small" disabled={disabled}>
                  <AttachFile />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                <IconButton 
                  color="primary" 
                  onClick={handleSend}
                  disabled={!localValue.trim() || disabled}
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
