import { Box, Paper, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Gradient Background Container
export const GradientBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #E3F2FD 0%, #E8EAF6 50%, #F3E5F5 100%)'
    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  position: 'relative',
  overflow: 'hidden',
}));

// Glassmorphism Card
export const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${
    theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(255, 255, 255, 0.1)'
  }`,
  boxShadow: theme.shadows[3],
}));

// Glassmorphism Paper
export const GlassPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(30, 41, 59, 0.7)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${
    theme.palette.mode === 'light'
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(255, 255, 255, 0.1)'
  }`,
}));

// Gradient Text
export const GradientText = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 700,
}));

// Gradient Button Background (for sx prop)
export const getGradientButtonStyles = (theme: Theme) => ({
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #2196F3 0%, #9C27B0 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  '&:hover': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #1976D2 0%, #7B1FA2 100%)'
      : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  },
});

// Sidebar Container
export const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

// Chat Container
export const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

// Message Bubble
export const MessageBubbleSent = styled(Box)(({ theme }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2, 2, 0.5, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginLeft: 'auto',
  wordWrap: 'break-word',
}));

export const MessageBubbleReceived = styled(Box)(({ theme }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2, 2, 2, 0.5),
  backgroundColor: theme.palette.mode === 'light'
    ? theme.palette.grey[100]
    : theme.palette.grey[800],
  color: theme.palette.text.primary,
  marginRight: 'auto',
  wordWrap: 'break-word',
}));

// Scrollable Container
export const ScrollableContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[900],
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.grey[400]
      : theme.palette.grey[600],
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light'
        ? theme.palette.grey[500]
        : theme.palette.grey[500],
    },
  },
}));

// Hover Card
export const HoverCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.grey[50]
      : theme.palette.grey[800],
  },
}));

// Active List Item
export const ActiveListItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: active
    ? theme.palette.mode === 'light'
      ? theme.palette.primary.light + '20'
      : theme.palette.primary.dark + '40'
    : 'transparent',
  borderLeft: active
    ? `3px solid ${theme.palette.primary.main}`
    : '3px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800],
  },
}));

// Badge Indicator
export const OnlineBadge = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 0,
  right: 0,
}));

export const OfflineBadge = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.grey[400],
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 0,
  right: 0,
}));
