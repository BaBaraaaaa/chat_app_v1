import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Video,
  MoreVertical,
  User,
  Search,
  Archive,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Contact, Message } from "../../types/chat";

interface ChatAreaProps {
  selectedContact: Contact | null;
  messages: Message[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatArea = ({
  selectedContact,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onKeyPress,
}: ChatAreaProps) => {
  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">
              Chào mừng đến với ChatApp
            </h3>
            <p className="text-muted-foreground">
              Chọn một cuộc trò chuyện để bắt đầu nhắn tin
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm bạn bè
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Tạo nhóm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedContact.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedContact.name}</h3>
              <div className="flex items-center gap-1">
                {selectedContact.isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <p className="text-sm text-muted-foreground">
                  {selectedContact.isOnline
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Xem hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  <span>Tìm tin nhắn</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Lưu trữ cuộc trò chuyện</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} selectedContact={selectedContact} />

      {/* Message Input */}
      <MessageInput
        messageInput={messageInput}
        onMessageInputChange={onMessageInputChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
      />
    </div>
  );
};

export default ChatArea;
