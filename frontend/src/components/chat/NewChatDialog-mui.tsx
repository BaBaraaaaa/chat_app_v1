import { Dialog, DialogTitle, DialogContent, TextField, List, Box, InputAdornment, CircularProgress } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useState } from 'react';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (userId: string) => void;
}

export function NewChatDialogMui({ open, onOpenChange }: NewChatDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading] = useState(false);

  return (
    <Dialog 
      open={open} 
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Cuộc trò chuyện mới</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ mt: 2 }}>
              {/* User list would go here */}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
