import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Reply, Edit, Trash2, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessageBubbleProps {
  message: Message;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble = ({ message, onReply, onEdit, onDelete }: MessageBubbleProps) => {
  const { user } = useAuthStore();
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = user?._id === message.senderId._id;
  const senderName = message.senderId.displayName || message.senderId.username;
  const senderInitial = senderName.charAt(0).toUpperCase();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 group mb-4",
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.senderId.avatar} alt={senderName} />
          <AvatarFallback>{senderInitial}</AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn("flex flex-col max-w-[70%]", isOwnMessage ? "items-end" : "items-start")}>
        {/* Sender Name (only for received messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 px-1">{senderName}</span>
        )}

        {/* Reply Reference */}
        {message.replyTo && (
          <div className="bg-muted/50 border-l-2 border-primary px-3 py-2 mb-1 rounded text-xs max-w-full">
            <p className="font-medium text-muted-foreground">
              {typeof message.replyTo === 'object' && message.replyTo.senderId
                ? message.replyTo.senderId.displayName || message.replyTo.senderId.username
                : 'Unknown'}
            </p>
            <p className="truncate text-muted-foreground">
              {typeof message.replyTo === 'object' ? message.replyTo.content : ''}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "px-4 py-2 rounded-2xl relative",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {/* Deleted Message */}
          {message.isDeleted ? (
            <p className="italic text-muted-foreground text-sm">Tin nhắn đã bị xóa</p>
          ) : (
            <>
              {/* Message Text */}
              <p className="break-words whitespace-pre-wrap">{message.content}</p>

              {/* Edited Label */}
              {message.isEdited && (
                <span className="text-xs opacity-70 ml-2">(đã chỉnh sửa)</span>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80"
                      >
                        {attachment.filename}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Time & Status */}
              <div className="flex items-center gap-1 mt-1 justify-end">
                <span className="text-[10px] opacity-70">{formatTime(message.createdAt)}</span>
                {isOwnMessage && <span className="opacity-70">{getStatusIcon()}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {showActions && !message.isDeleted && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
            {onReply && (
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="w-4 h-4 mr-2" />
                Trả lời
              </DropdownMenuItem>
            )}
            {isOwnMessage && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(message)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
            )}
            {isOwnMessage && onDelete && (
              <DropdownMenuItem onClick={() => onDelete(message._id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
