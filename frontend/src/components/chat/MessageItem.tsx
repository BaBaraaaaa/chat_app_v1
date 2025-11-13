import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Reply, Check, CheckCheck } from "lucide-react";
import type { Message as MessageType } from "@/types/message";

interface MessageItemProps {
  message: MessageType;
  isOwn: boolean;
  senderName: string;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

const MessageItem = ({
  message,
  isOwn,
  senderName,
  onEdit,
  onDelete,
  onReply,
}: MessageItemProps) => {

  // Format timestamp
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If it's already in "HH:MM" format, return as is
      if (/^\d{1,2}:\d{2}$/.test(dateString)) {
        return dateString;
      }
      return '';
    }
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Render status icons cho message của user
  const renderStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case "sent":
        return <Check className="w-3 h-3 inline ml-1" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 inline ml-1" />;
      case "read":
        return <CheckCheck className="w-3 h-3 inline ml-1 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
    >
      <div className="flex items-start gap-2 max-w-xs lg:max-w-md relative">
        {!isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-muted text-xs">
              {senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex items-center gap-1">
          {/* Message bubble */}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            {/* Edited indicator */}
            {message.isEdited && (
              <p className={`text-xs italic mb-1 ${
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}>
                Đã chỉnh sửa
              </p>
            )}

            {/* Message content */}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

            {/* Timestamp and status */}
            <p
              className={`text-xs mt-1 flex items-center ${
                isOwn
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              {formatTime(message.createdAt)}
              {renderStatusIcon()}
            </p>
          </div>

          {/* Actions dropdown - chỉ hiện cho tin nhắn của mình */}
          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message._id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                )}
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message._id)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Trả lời
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message._id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
