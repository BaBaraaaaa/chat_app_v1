import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useMessageStore } from "@/stores/useMessageStore";
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
  AlertTriangle,
} from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Contact, Message } from "../../types/chat";
import { toast } from "sonner";

interface ChatAreaProps {
  selectedContact: Contact | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isFriend?: boolean;
  isActive?: boolean;
}

const ChatArea = ({
  selectedContact,
  messages,
  onSendMessage,
  isFriend = true,
  isActive = true,
}: ChatAreaProps) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const { editMessage } = useMessageStore();

  // Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  // Handle save edited message
  const handleSaveEdit = (content: string) => {
    if (editingMessageId && content.trim()) {
      editMessage(editingMessageId, content.trim());
      setEditingMessageId(null);
      setEditingContent("");
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  // Handle send or edit
  const handleSendOrEdit = (content: string) => {
    if (editingMessageId) {
      handleSaveEdit(content);
    } else {
      onSendMessage(content);
    }
  };
  //ToDo: 
  const handleCallPhone = () => {toast.warning("Chức năng gọi điện thoại đang được phát triển",)};
  const handleCallVideo = () => {toast.warning("Chức năng gọi video đang được phát triển",)};
  const handleViewProfile = () => {toast.warning("Chức năng xem hồ sơ đang được phát triển",)};
  const handleSearch = () => {toast.warning("Chức năng tìm kiếm tin nhắn đang được phát triển",)};
  const handleArchive = () => {toast.warning("Chức năng lưu trữ tin nhắn đang được phát triển",)};

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
            <Button variant="ghost" size="icon" onClick={handleCallPhone}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCallVideo}>
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 h-4 w-4"  />
                  <span>Xem hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4"  />
                  <span>Tìm tin nhắn</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4"  />
                  <span>Lưu trữ cuộc trò chuyện</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ✅ Warning Banner nếu không phải bạn bè hoặc conversation không active */}
      {(!isFriend || !isActive) && (
        <Alert
          variant="destructive"
          className="m-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Người này không còn trong danh sách bạn bè của bạn.</strong>
            <br />
            Bạn không thể gửi tin nhắn mới. Thêm lại bạn bè để tiếp tục trò
            chuyện.
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        selectedContact={selectedContact}
        onEditMessage={handleEditMessage}
      />

      {/* Message Input */}
      <MessageInput
        initialValue={editingContent}
        onSendMessage={handleSendOrEdit}
        disabled={!isFriend || !isActive}
        editingMessageId={editingMessageId}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default ChatArea;
