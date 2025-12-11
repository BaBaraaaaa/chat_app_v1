import { io, Socket } from 'socket.io-client';
import type {
    FriendRequestData,
    FriendRequestResponse,
    RespondFriendRequestData,
    ReceiveFriendRequestData,
    FriendRequestResponseData,
    FriendRequestProcessedData,
    RespondFriendRequestSuccessData,
    RespondFriendRequestErrorData,
    FriendRequestCancelledData,
    CancelFriendRequestSuccessData,
    FriendRequestsListData,
    FriendsListData,
    OnlineUsersListData,
    RemoveFriendData,
    FriendRemovedData,
    RemoveFriendSuccessData,
    RemoveFriendErrorData,
    SocketEventCallback
} from '@/types/socket';

class SocketService {
    private socket: Socket | null = null;
    private readonly SERVER_URL: string;
    private isConnecting: boolean = false;

    constructor() {
        this.SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    }

    connect(token?: string): Promise<Socket> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve(this.socket);
                return;
            }

            if (this.isConnecting) {
                // Nếu đang kết nối, đợi kết nối hoàn thành
                const checkConnection = () => {
                    if (this.socket?.connected) {
                        resolve(this.socket);
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
                return;
            }

            this.isConnecting = true;

            this.socket = io(this.SERVER_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                auth: {
                    token: token || ''
                },
                timeout: 20000,
                autoConnect: true
            });

            this.setupEventListeners();

            this.socket.on('connect', () => {
                console.log('🔌 Đã kết nối tới server:', this.socket?.id);
                this.isConnecting = false;
                resolve(this.socket!);
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Lỗi kết nối:', error);
                this.isConnecting = false;
                reject(error);
            });

            // Timeout fallback
            setTimeout(() => {
                if (this.isConnecting) {
                    this.isConnecting = false;
                    reject(new Error('Hết thời gian chờ kết nối'));
                }
            }, 20000);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnecting = false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Đã ngắt kết nối khỏi server:', reason);
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Đã kết nối lại server, lần thử:', attemptNumber);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('❌ Lỗi kết nối lại:', error);
        });
    }

    // === USER ONLINE METHODS ===
    registerUserOnline(userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('user:online', userId);
            console.log('👤 Đã đăng ký người dùng online:', userId);
        }
    }

    // === FRIEND REQUEST METHODS ===
    sendFriendRequest(data: FriendRequestData): void {
        if (this.socket?.connected) {
            this.socket.emit('SEND_FRIEND_REQUEST', data);
            console.log('📤 Đang gửi lời mời kết bạn:', data);
        }
    }

    respondToFriendRequest(data: RespondFriendRequestData): void {
        if (this.socket?.connected) {
            this.socket.emit('RESPOND_FRIEND_REQUEST', data);
            console.log('📤 Đang phản hồi lời mời kết bạn:', data);
        }
    }

    cancelFriendRequest(requestId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('CANCEL_FRIEND_REQUEST', { requestId });
            console.log('📤 Đang hủy lời mời kết bạn:', requestId);
        }
    }

    removeFriend(data: RemoveFriendData): void {
        if (this.socket?.connected) {
            this.socket.emit('REMOVE_FRIEND', data);
            console.log('📤 Đang xóa bạn bè:', data);
        }
    }

    getFriendRequests(): void {
        if (this.socket?.connected) {
            this.socket.emit('GET_FRIEND_REQUESTS');
        }
    }

    getFriendsList(): void {
        if (this.socket?.connected) {
            this.socket.emit('GET_FRIENDS_LIST');
        }
    }

    getOnlineUsers(): void {
        if (this.socket?.connected) {
            this.socket.emit('GET_ONLINE_USERS');
        }
    }

    // === EVENT LISTENERS ===
    onFriendRequestReceived(callback: SocketEventCallback<ReceiveFriendRequestData>): void {
        this.socket?.on('RECEIVE_FRIEND_REQUEST', callback);
    }

    onFriendRequestSent(callback: SocketEventCallback<FriendRequestResponse>): void {
        this.socket?.on('FRIEND_REQUEST_SENT', callback);
    }

    onFriendRequestError(callback: SocketEventCallback<FriendRequestResponse>): void {
        this.socket?.on('FRIEND_REQUEST_ERROR', callback);
    }

    onFriendRequestResponse(callback: SocketEventCallback<FriendRequestResponseData>): void {
        this.socket?.on('FRIEND_REQUEST_RESPONSE', callback);
    }

    onFriendRequestProcessed(callback: SocketEventCallback<FriendRequestProcessedData>): void {
        this.socket?.on('FRIEND_REQUEST_PROCESSED', callback);
    }

    onRespondFriendRequestSuccess(callback: SocketEventCallback<RespondFriendRequestSuccessData>): void {
        this.socket?.on('RESPOND_FRIEND_REQUEST_SUCCESS', callback);
    }

    onRespondFriendRequestError(callback: SocketEventCallback<RespondFriendRequestErrorData>): void {
        this.socket?.on('RESPOND_FRIEND_REQUEST_ERROR', callback);
    }

    onFriendRequestCancelled(callback: SocketEventCallback<FriendRequestCancelledData>): void {
        this.socket?.on('FRIEND_REQUEST_CANCELLED', callback);
    }

    onCancelFriendRequestSuccess(callback: SocketEventCallback<CancelFriendRequestSuccessData>): void {
        this.socket?.on('CANCEL_FRIEND_REQUEST_SUCCESS', callback);
    }

    onFriendRequestsList(callback: SocketEventCallback<FriendRequestsListData>): void {
        this.socket?.on('FRIEND_REQUESTS_LIST', callback);
    }

    onFriendsList(callback: SocketEventCallback<FriendsListData>): void {
        this.socket?.on('FRIENDS_LIST', callback);
    }

    onOnlineUsersList(callback: SocketEventCallback<OnlineUsersListData>): void {
        this.socket?.on('ONLINE_USERS_LIST', callback);
    }

    // === EVENT LISTENERS - Friend Removal ===
    onFriendRemoved(callback: SocketEventCallback<FriendRemovedData>): void {
        this.socket?.on('FRIEND_REMOVED', callback);
    }

    onRemoveFriendSuccess(callback: SocketEventCallback<RemoveFriendSuccessData>): void {
        this.socket?.on('REMOVE_FRIEND_SUCCESS', callback);
    }

    onRemoveFriendError(callback: SocketEventCallback<RemoveFriendErrorData>): void {
        this.socket?.on('REMOVE_FRIEND_ERROR', callback);
    }

    // === CLEANUP METHODS ===
    removeAllListeners(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }

    removeListener(event: string, callback?: (...args: unknown[]) => void): void {
        this.socket?.off(event, callback);
    }

    // === GENERIC METHODS ===
    emit(event: string, data?: unknown): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket chưa kết nối, không thể emit:', event);
        }
    }

    on(event: string, callback: (...args: unknown[]) => void): void {
        this.socket?.on(event, (...args) => {
            callback(...args);
        });
    }

    off(event: string, callback?: (...args: unknown[]) => void): void {
        this.socket?.off(event, callback);
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
