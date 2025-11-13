import { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import type { Message } from '@/types/chat';
import MessageItemMui from './MessageItem-mui';

interface MessageListProps {
  messages: Message[];
}

export default function MessageListMui({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {messages.map((message) => (
        <MessageItemMui key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}
