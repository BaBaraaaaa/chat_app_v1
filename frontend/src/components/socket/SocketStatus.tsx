import React from 'react';
import { Bell, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useSocketStore } from '@/stores/useSocketStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SocketStatusProps {
  showNotifications?: boolean;
  showOnlineCount?: boolean;
  className?: string;
}

export const SocketStatus: React.FC<SocketStatusProps> = ({
  showNotifications = true,
  showOnlineCount = true,
  className = ''
}) => {
  const { 
    isConnected, 
    isConnecting, 
    connectionError,
    onlineCount,
    notifications,
    unreadCount 
  } = useSocket();
  
  const { markAsRead, removeNotification, clearNotifications } = useSocketStore();

  // Connection status icon và color
  const getConnectionIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    if (isConnected) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    }
    return <WifiOff className="h-4 w-4 text-red-500" />;
  };

  const getConnectionText = () => {
    if (isConnecting) return 'Đang kết nối...';
    if (isConnected) return 'Đã kết nối';
    if (connectionError) return `Lỗi: ${connectionError}`;
    return 'Không kết nối';
  };

  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1" title={getConnectionText()}>
        {getConnectionIcon()}
        {showOnlineCount && isConnected && (
          <span className="text-xs text-muted-foreground">
            {onlineCount} online
          </span>
        )}
      </div>

      {/* Notifications */}
      {showNotifications && (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative p-2"
              onClick={() => unreadCount > 0 && markAsRead()}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4">
              <h4 className="font-semibold">Thông báo</h4>
              {notifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearNotifications}
                  className="text-xs"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>
            
            <Separator />
            
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Không có thông báo mới
                </div>
              ) : (
                <div className="p-2">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className={`p-3 hover:bg-muted/50 rounded-lg cursor-pointer ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium text-sm">
                                {notification.title}
                              </h5>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator className="my-1" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SocketStatus;