import { useState, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, InputAdornment } from '@mui/material';
import { Send, EmojiEmotions, AttachFile } from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInputMui({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={disabled ? "Không thể gửi tin nhắn" : "Nhập tin nhắn..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" disabled={disabled}>
                <EmojiEmotions />
              </IconButton>
              <IconButton size="small" disabled={disabled}>
                <AttachFile />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                color="primary" 
                onClick={handleSend}
                disabled={!message.trim() || disabled}
              >
                <Send />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
