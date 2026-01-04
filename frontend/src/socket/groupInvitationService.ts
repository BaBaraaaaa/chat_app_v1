import { socketService } from "./socketService";
import type {
    SendGroupInvitationPayload,
    GroupInvitationResponse,
    SocketEventCallback
} from "@/types/message";

class GroupInvitationSocketService {
    /**
     * Gửi lời mời vào nhóm
     */
    sendInvitation(payload: SendGroupInvitationPayload): void {
        if (socketService.isConnected()) {
            socketService.emit("SEND_GROUP_INVITATION", payload);
        }
    }

    /**
     * Chấp nhận lời mời
     */
    acceptInvitation(invitationId: string): void {
        if (socketService.isConnected()) {
            socketService.emit("ACCEPT_GROUP_INVITATION", { invitationId });
        }
    }

    /**
     * Từ chối lời mời
     */
    declineInvitation(invitationId: string): void {
        if (socketService.isConnected()) {
            socketService.emit("DECLINE_GROUP_INVITATION", { invitationId });
        }
    }

    /**
     * Hủy lời mời
     */
    cancelInvitation(invitationId: string): void {
        if (socketService.isConnected()) {
            socketService.emit("CANCEL_GROUP_INVITATION", { invitationId });
        }
    }

    // ==================== LISTENER METHODS ====================

    onInvitationSent(callback: SocketEventCallback<GroupInvitationResponse>): void {
        socketService.on("GROUP_INVITATION_SENT", callback as any);
    }

    onInvitationReceived(callback: SocketEventCallback<{ invitation: any }>): void {
        socketService.on("GROUP_INVITATION_RECEIVED", callback as any);
    }

    onInvitationAccepted(callback: SocketEventCallback<GroupInvitationResponse>): void {
        socketService.on("GROUP_INVITATION_ACCEPTED", callback as any);
    }

    onInvitationDeclined(callback: SocketEventCallback<GroupInvitationResponse>): void {
        socketService.on("GROUP_INVITATION_DECLINED", callback as any);
    }

    onInvitationCancelled(callback: SocketEventCallback<GroupInvitationResponse>): void {
        socketService.on("GROUP_INVITATION_CANCELLED", callback as any);
    }

    onInvitationStatusChanged(callback: SocketEventCallback<{ invitation: any, status: string }>): void {
        socketService.on("GROUP_INVITATION_STATUS_CHANGED", callback as any);
    }

    onGroupMemberJoined(callback: SocketEventCallback<{ conversation: any, newMember: any }>): void {
        socketService.on("GROUP_MEMBER_JOINED", callback as any);
    }

    onInvitationError(callback: SocketEventCallback<{ success: boolean, message: string }>): void {
        socketService.on("GROUP_INVITATION_ERROR", callback as any);
    }

    removeAllListeners(): void {
        socketService.removeListener("GROUP_INVITATION_SENT");
        socketService.removeListener("GROUP_INVITATION_RECEIVED");
        socketService.removeListener("GROUP_INVITATION_ACCEPTED");
        socketService.removeListener("GROUP_INVITATION_DECLINED");
        socketService.removeListener("GROUP_INVITATION_CANCELLED");
        socketService.removeListener("GROUP_INVITATION_STATUS_CHANGED");
        socketService.removeListener("GROUP_MEMBER_JOINED");
        socketService.removeListener("GROUP_INVITATION_ERROR");
    }
}

export const groupInvitationSocketService = new GroupInvitationSocketService();
