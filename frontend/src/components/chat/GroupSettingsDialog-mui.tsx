
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    IconButton,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Chip,
} from '@mui/material';
import {
    Close,
    PersonRemove,
    PersonAdd,
    ExitToApp,
    Search,
    CameraAlt,
} from '@mui/icons-material';
import { useState, useMemo, useRef } from 'react';
import { useGroupInvitationStore } from '@/stores/useGroupInvitationStore';
import { useConversationStore } from '@/stores/useConversationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFriendStore } from '@/stores/useFriendStore';
import { toast } from 'sonner';
import type { Friend } from '@/types/store';
import { userApiService } from '@/services/userApiService';

interface GroupSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GroupSettingsDialogMui({ open, onOpenChange }: GroupSettingsDialogProps) {
    const { currentConversation, removeParticipant, leaveGroup, updateGroupAvatar } = useConversationStore();
    const { user } = useAuthStore();
    const { friends, getFriendsList } = useFriendStore();
    const { sendInvitation } = useGroupInvitationStore();

    const [activeTab, setActiveTab] = useState<'members' | 'add_members'>('members');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFriendsToAdd, setSelectedFriendsToAdd] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = useMemo(() => {
        return currentConversation?.adminId === user?._id;
    }, [currentConversation, user]);

    const participants = currentConversation?.participants || [];

    const handleClose = () => {
        onOpenChange(false);
        setActiveTab('members');
        setSearchQuery('');
        setSelectedFriendsToAdd([]);
    };

    const handleRemoveMember = async (participantId: string) => {
        if (!currentConversation) return;
        if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
            setProcessing(true);
            await removeParticipant(currentConversation._id, participantId);
            setProcessing(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!currentConversation) return;
        if (confirm("Bạn có chắc chắn muốn rời nhóm?")) {
            setProcessing(true);
            await leaveGroup(currentConversation._id);
            setProcessing(false);
            handleClose();
        }
    };

    const handleSendInvitations = async () => {
        if (!currentConversation) return;
        if (selectedFriendsToAdd.length === 0) return;

        setProcessing(true);
        try {
            await sendInvitation(currentConversation._id, selectedFriendsToAdd);
            // Reset selection and switch back to members list
            setSelectedFriendsToAdd([]);
            setActiveTab('members');
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
        } finally {
            setProcessing(false);
        }
    };

    const toggleFriendSelection = (friendId: string) => {
        setSelectedFriendsToAdd(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    // Load friends when switching to add_members tab
    const handleSwitchToAdd = () => {
        getFriendsList();
        setActiveTab('add_members');
    };

    // Filter friends not already in group
    const availableFriends = useMemo(() => {
        if (!friends) return [];

        const participantIds = participants.map(p => p._id);
        return (friends as Friend[]).filter(friend =>
            !participantIds.includes(friend._id) &&
            (friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [friends, participants, searchQuery]);

    const handleAvatarClick = () => {
        if (isAdmin && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentConversation) return;

        // Validate file
        const validation = userApiService.validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error || 'File không hợp lệ');
            return;
        }

        setProcessing(true);
        await updateGroupAvatar(currentConversation._id, file);
        setProcessing(false);
    };


    if (!currentConversation) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography fontWeight={600}>
                    {activeTab === 'members' ? 'Thông tin nhóm' : 'Thêm thành viên'}
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Header Group Info */}
                {activeTab === 'members' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={currentConversation.avatarUrl}
                                alt={currentConversation.name}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mb: 1,
                                    boxShadow: 1,
                                    cursor: isAdmin ? 'pointer' : 'default',
                                    '&:hover': isAdmin ? { opacity: 0.8 } : {}
                                }}
                                onClick={handleAvatarClick}
                            >
                                {currentConversation.name?.[0]?.toUpperCase()}
                            </Avatar>
                            {isAdmin && (
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: -8,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        width: 28,
                                        height: 28,
                                        '&:hover': {
                                            backgroundColor: 'primary.dark'
                                        }
                                    }}
                                    onClick={handleAvatarClick}
                                    disabled={processing}
                                >
                                    <CameraAlt sx={{ fontSize: 16 }} />
                                </IconButton>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                        </Box>
                        <Typography variant="h6">{currentConversation.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {participants.length} thành viên
                        </Typography>
                    </Box>
                )}

                {/* Action Buttons (Add Member) */}
                {activeTab === 'members' && isAdmin && (
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<PersonAdd />}
                            variant="outlined"
                            size="small"
                            onClick={handleSwitchToAdd}
                        >
                            Thêm thành viên
                        </Button>
                    </Box>
                )}

                {/* Member List */}
                {activeTab === 'members' && (
                    <List>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Danh sách thành viên
                        </Typography>
                        {participants.map((p) => (
                            <ListItem
                                key={p._id}
                                secondaryAction={
                                    isAdmin && p._id !== user?._id && (
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            color="error"
                                            onClick={() => handleRemoveMember(p._id)}
                                            disabled={processing}
                                        >
                                            <PersonRemove />
                                        </IconButton>
                                    )
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar src={p.avatarUrl} alt={p.displayName} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {p.displayName || p.username}
                                            {p._id === currentConversation.adminId && (
                                                <Chip label="Admin" size="small" color="primary" sx={{ height: 20, fontSize: '0.625rem' }} />
                                            )}
                                            {p._id === user?._id && (
                                                <Chip label="Bạn" size="small" sx={{ height: 20, fontSize: '0.625rem' }} />
                                            )}
                                        </Box>
                                    }
                                    secondary={p.email}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Add Members View */}
                {activeTab === 'add_members' && (
                    <Box>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm bạn bè..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                            {availableFriends.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                    Không tìm thấy bạn bè nào phù hợp.
                                </Typography>
                            ) : (
                                availableFriends.map(friend => {
                                    const isSelected = selectedFriendsToAdd.includes(friend._id);
                                    return (
                                        <ListItem key={friend._id} disablePadding>
                                            <ListItemButton
                                                onClick={() => toggleFriendSelection(friend._id)}
                                                sx={{
                                                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={friend.avatarUrl} alt={friend.displayName} />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={friend.displayName || friend.username}
                                                    secondary={friend.email}
                                                />
                                                {isSelected && <Typography variant="caption" color="primary" fontWeight="bold">Đã chọn</Typography>}
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })
                            )}
                        </List>
                    </Box>
                )}

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                {activeTab === 'members' ? (
                    <Button
                        color="error"
                        startIcon={<ExitToApp />}
                        onClick={handleLeaveGroup}
                        disabled={processing}
                    >
                        Rời nhóm
                    </Button>
                ) : (
                    <>
                        <Button onClick={() => setActiveTab('members')}>Hủy</Button>
                        <Button
                            variant="contained"
                            onClick={handleSendInvitations}
                            disabled={selectedFriendsToAdd.length === 0 || processing}
                        >
                            Mời
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
