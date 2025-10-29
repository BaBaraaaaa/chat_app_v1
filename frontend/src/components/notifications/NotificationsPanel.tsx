import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger,  } from "@/components/ui/tabs";
import {
  Bell,
  MessageCircle,
  UserPlus,
  Users,
  Heart,
  Share,
  Settings,
  Check,
  X,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  type: 'message' | 'friend_request' | 'group_invite' | 'like' | 'share' | 'system';
  title: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  senderName?: string;
  actionRequired?: boolean;
}

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "message",
      title: "Tin nhắn mới",
      content: "Nguyễn Văn A đã gửi cho bạn một tin nhắn",
      timestamp: "2 phút trước",
      isRead: false,
      senderName: "Nguyễn Văn A",
    },
    {
      id: "2",
      type: "friend_request",
      title: "Yêu cầu kết bạn",
      content: "Trần Thị B muốn kết bạn với bạn",
      timestamp: "10 phút trước",
      isRead: false,
      senderName: "Trần Thị B",
      actionRequired: true,
    },
    {
      id: "3",
      type: "group_invite",
      title: "Lời mời nhóm",
      content: "Bạn được mời tham gia nhóm 'Công việc'",
      timestamp: "1 giờ trước",
      isRead: false,
      actionRequired: true,
    },
    {
      id: "4",
      type: "system",
      title: "Cập nhật ứng dụng",
      content: "ChatApp đã được cập nhật lên phiên bản mới",
      timestamp: "2 giờ trước",
      isRead: true,
    },
    {
      id: "5",
      type: "message",
      title: "Tin nhắn nhóm",
      content: "Lê Văn C đã gửi tin nhắn trong nhóm 'Bạn bè'",
      timestamp: "3 giờ trước",
      isRead: true,
      senderName: "Lê Văn C",
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter(n => !n.isRead);
      case "action":
        return notifications.filter(n => n.actionRequired && !n.isRead);
      default:
        return notifications;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    console.log(`${action} notification:`, id);
    markAsRead(id);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4" />;
      case 'group_invite':
        return <Users className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'share':
        return <Share className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-500 bg-blue-500/10';
      case 'friend_request':
        return 'text-green-500 bg-green-500/10';
      case 'group_invite':
        return 'text-purple-500 bg-purple-500/10';
      case 'like':
        return 'text-red-500 bg-red-500/10';
      case 'share':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="w-full md:w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Thông báo</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs"
            >
              Đánh dấu đã đọc
            </Button>
            <Button size="icon" variant="ghost" className="w-8 h-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs relative">
              Chưa đọc
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action" className="text-xs relative">
              Hành động
              {actionRequiredCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  {actionRequiredCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {getFilteredNotifications().map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              onAction={handleAction}
            />
          ))}
          {getFilteredNotifications().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không có thông báo nào</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, action: 'accept' | 'decline') => void;
}

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: NotificationCardProps) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4" />;
      case 'group_invite':
        return <Users className="w-4 h-4" />;
      case 'like':
        return <Heart className="w-4 h-4" />;
      case 'share':
        return <Share className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-500 bg-blue-500/10';
      case 'friend_request':
        return 'text-green-500 bg-green-500/10';
      case 'group_invite':
        return 'text-purple-500 bg-purple-500/10';
      case 'like':
        return 'text-red-500 bg-red-500/10';
      case 'share':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className={`p-3 rounded-lg border transition-colors group ${
      notification.isRead 
        ? 'border-border hover:bg-accent/50' 
        : 'border-primary/20 bg-primary/5 hover:bg-primary/10'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-primary' : ''}`}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-6 h-6"
                  onClick={() => onMarkAsRead(notification.id)}
                  title="Đánh dấu đã đọc"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="w-6 h-6 text-destructive hover:text-destructive"
                onClick={() => onDelete(notification.id)}
                title="Xóa thông báo"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {notification.content}
          </p>
          
          <p className="text-xs text-muted-foreground mt-2">
            {notification.timestamp}
          </p>

          {notification.actionRequired && !notification.isRead && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-8"
                onClick={() => onAction(notification.id, 'accept')}
              >
                <Check className="w-3 h-3 mr-1" />
                Chấp nhận
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8"
                onClick={() => onAction(notification.id, 'decline')}
              >
                <X className="w-3 h-3 mr-1" />
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;