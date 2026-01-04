import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Button,
    Card,
    CardHeader,
    CardContent,
    Chip,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Check,
    Close,
    Groups,
    AccessTime,
    Person,
    Delete,
} from '@mui/icons-material';
import { useGroupInvitationStore } from '@/stores/useGroupInvitationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { GroupInvitation } from '@/types/message';
import { InvitationStatus } from '@/types/message';

const GroupInvitationsPanelMui = () => {
    const { user } = useAuthStore();
    const {
        receivedInvitations,
        sentInvitations,
        loading,
        getReceivedInvitations,
        getSentInvitations,
        acceptInvitation,
        declineInvitation,
        cancelInvitation,
    } = useGroupInvitationStore();

    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    useEffect(() => {
        if (user) {
            getReceivedInvitations();
            getSentInvitations();
        }
    }, [user, getReceivedInvitations, getSentInvitations]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        return 'Vừa xong';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: 'background.default', p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant={activeTab === 'received' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('received')}
                    startIcon={<Groups />}
                >
                    Lời mời nhận được ({receivedInvitations.length})
                </Button>
                <Button
                    variant={activeTab === 'sent' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('sent')}
                    startIcon={<AccessTime />}
                >
                    Lời mời đã gửi ({sentInvitations.length})
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Card>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={700}>
                                {activeTab === 'received' ? 'Lời mời tham gia nhóm' : 'Lời mời đã gửi'}
                            </Typography>
                        }
                    />
                    <Divider />
                    <CardContent sx={{ p: 0 }}>
                        {activeTab === 'received' ? (
                            receivedInvitations.length === 0 ? (
                                <Box sx={{ py: 8, textAlign: 'center' }}>
                                    <Groups sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography color="text.secondary">Bạn không có lời mời tham gia nhóm nào.</Typography>
                                </Box>
                            ) : (
                                <List>
                                    {receivedInvitations.map((invitation: GroupInvitation) => (
                                        <ListItem
                                            key={invitation._id}
                                            divider
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<Check />}
                                                        onClick={() => acceptInvitation(invitation._id)}
                                                    >
                                                        Chấp nhận
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<Close />}
                                                        onClick={() => declineInvitation(invitation._id)}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={(invitation.conversationId as any)?.avatarUrl}
                                                    sx={{ bgcolor: 'primary.light' }}
                                                >
                                                    {(invitation.conversationId as any)?.name?.[0]?.toUpperCase() || <Groups />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography fontWeight={600}>
                                                        {(invitation.conversationId as any)?.name || 'Nhóm không tên'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span">
                                                        <Typography variant="body2" component="span" color="text.primary">
                                                            Từ: {(invitation.inviterId as any)?.displayName || (invitation.inviterId as any)?.username}
                                                        </Typography>
                                                        {invitation.message && (
                                                            <Typography variant="body2" display="block">
                                                                Lời nhắn: {invitation.message}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            {formatTime(invitation.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )
                        ) : (
                            sentInvitations.length === 0 ? (
                                <Box sx={{ py: 8, textAlign: 'center' }}>
                                    <AccessTime sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography color="text.secondary">Bạn chưa gửi lời mời tham gia nhóm nào.</Typography>
                                </Box>
                            ) : (
                                <List>
                                    {sentInvitations.map((invitation: GroupInvitation) => (
                                        <ListItem
                                            key={invitation._id}
                                            divider
                                            secondaryAction={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Chip
                                                        label={
                                                            invitation.status === InvitationStatus.PENDING ? 'Đang chờ' :
                                                                invitation.status === InvitationStatus.ACCEPTED ? 'Đã chấp nhận' :
                                                                    invitation.status === InvitationStatus.DECLINED ? 'Đã từ chối' : 'Đã hủy'
                                                        }
                                                        size="small"
                                                        color={
                                                            invitation.status === InvitationStatus.PENDING ? 'warning' :
                                                                invitation.status === InvitationStatus.ACCEPTED ? 'success' : 'default'
                                                        }
                                                    />
                                                    {invitation.status === InvitationStatus.PENDING && (
                                                        <Tooltip title="Hủy lời mời">
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() => cancelInvitation(invitation._id)}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            }
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                                                    {(invitation.inviteeId as any)?.displayName?.[0]?.toUpperCase() || <Person />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography fontWeight={600}>
                                                        Mời {(invitation.inviteeId as any)?.displayName || (invitation.inviteeId as any)?.username} vào nhóm {(invitation.conversationId as any)?.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box component="span">
                                                        {invitation.message && (
                                                            <Typography variant="body2" display="block">
                                                                Lời nhắn: {invitation.message}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Gửi {formatTime(invitation.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default GroupInvitationsPanelMui;
