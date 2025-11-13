import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/message";
import { useConversationStore } from "@/stores/useConversationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat?: () => void;
}

export const ConversationList = ({ onSelectConversation, onNewChat }: ConversationListProps) => {
  const { user } = useAuthStore();
  const { isConnected } = useSocketStore();
  const {
    conversations,
    currentConversation,
    loading,
    searchResults,
    getConversations,
    searchConversations,
    clearSearchResults,
    setupSocketListeners,
    removeSocketListeners,
  } = useConversationStore();

  const [searchQuery, setSearchQuery] = useState("");

  // Setup listeners when connected
  useEffect(() => {
    if (isConnected && user) {
      console.log("🔗 Setting up conversation Socket listeners...");
      setupSocketListeners();
      getConversations();
    }

    return () => {
      if (isConnected) {
        removeSocketListeners();
      }
    };
  }, [isConnected, user, setupSocketListeners, getConversations, removeSocketListeners]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchConversations(query);
    } else {
      clearSearchResults();
    }
  };

  const displayedConversations = searchQuery ? searchResults : conversations;

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return date.toLocaleDateString("vi-VN");
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  return (
    <div className="w-full md:w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tin nhắn</h2>
          {onNewChat && (
            <Button variant="ghost" size="icon" onClick={onNewChat}>
              <MessageSquarePlus className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc hội thoại..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        {loading && displayedConversations.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayedConversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquarePlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery ? "Không tìm thấy cuộc hội thoại" : "Chưa có cuộc hội thoại nào"}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedConversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isActive = currentConversation?._id === conversation._id;
              const hasUnread = conversation.unreadCount > 0;

              if (!otherUser) return null;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left",
                    isActive && "bg-accent"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={otherUser.avatar} alt={otherUser.displayName} />
                    <AvatarFallback>
                      {(otherUser.displayName || otherUser.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={cn(
                          "font-medium truncate",
                          hasUnread && "font-semibold text-primary"
                        )}
                      >
                        {otherUser.displayName || otherUser.username}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatLastMessageTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}
                      </p>
                      {hasUnread && (
                        <Badge variant="destructive" className="flex-shrink-0 min-w-5 h-5 flex items-center justify-center text-[10px] px-1.5">
                          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
