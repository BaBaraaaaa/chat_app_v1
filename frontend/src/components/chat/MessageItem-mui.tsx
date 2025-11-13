import { Box, Typography, Paper } from '@mui/material';
import type { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
}

export default function MessageItemMui({ message }: MessageItemProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          maxWidth: '70%',
          px: 2,
          py: 1.5,
          borderRadius: message.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          bgcolor: message.isOwn ? 'primary.main' : 'background.paper',
          color: message.isOwn ? 'primary.contrastText' : 'text.primary',
        }}
      >
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.7,
            textAlign: 'right',
          }}
        >
          {message.timestamp}
        </Typography>
      </Paper>
    </Box>
  );
}
