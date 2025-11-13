import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useFriendStore } from '@/stores/useFriendStore';
import FriendsSidebarMui from './FriendsSidebar-mui';
import FriendsMainContentMui from './FriendsMainContent-mui';
import { toast } from 'sonner';

export default function FriendsPanelMui() {
  const { 
    friends, 
    receivedRequests, 
    sentRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    sendFriendRequestByUsername
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success('Đã chấp nhận lời mời kết bạn');
    } catch (error: any) {
      toast.error(error.message || 'Không thể chấp nhận lời mời');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      toast.success('Đã từ chối lời mời kết bạn');
    } catch (error: any) {
      toast.error(error.message || 'Không thể từ chối lời mời');
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelFriendRequest(requestId);
      toast.success('Đã hủy lời mời kết bạn');
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy lời mời');
    }
  };

  const handleRemove = async (friendId: string) => {
    if (confirm('Bạn có chắc muốn xóa bạn bè này?')) {
      try {
        await removeFriend(friendId);
        toast.success('Đã xóa bạn bè');
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa bạn bè');
      }
    }
  };

  const handleSendRequest = async () => {
    if (!username.trim()) {
      toast.error('Vui lòng nhập username');
      return;
    }

    setLoading(true);
    try {
      await sendFriendRequestByUsername(username, message);
      toast.success('Đã gửi lời mời kết bạn');
      setAddDialogOpen(false);
      setUsername('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi lời mời');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
        {/* Sidebar */}
        <FriendsSidebarMui
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          receivedCount={receivedRequests.length}
          sentCount={sentRequests.length}
        />

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header with Add Button */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setAddDialogOpen(true)}
            >
              Thêm bạn
            </Button>
          </Box>

          {/* Content Area */}
          <FriendsMainContentMui
            activeTab={activeTab}
            friends={friends}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
            onRemove={handleRemove}
          />
        </Box>
      </Box>

      {/* Add Friend Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm bạn mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập username của người bạn muốn kết bạn"
          />
          <TextField
            margin="dense"
            label="Lời nhắn (tùy chọn)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Viết lời chào..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleSendRequest} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi lời mời'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
