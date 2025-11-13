import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, Loader2 } from "lucide-react";
import { useFriendStore } from "@/stores/useFriendStore";
import { useConversationStore } from "@/stores/useConversationStore";
import type { User } from "@/type/user";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export const NewChatDialog = ({ open, onOpenChange, onConversationCreated }: NewChatDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  
  const { friends, loading: loadingFriends, getFriendsList } = useFriendStore();
  const { getOrCreateConversation } = useConversationStore();

  // Load friends khi mở dialog
  useEffect(() => {
    if (open) {
      getFriendsList();
      setSearchQuery("");
    }
  }, [open, getFriendsList]);

  // Filter friends by search query
  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    return (
      friend.displayName?.toLowerCase().includes(query) ||
      friend.username.toLowerCase().includes(query) ||
      friend.email?.toLowerCase().includes(query)
    );
  });

  const handleCreateChat = async (friend: User) => {
    try {
      setCreating(true);
      
      // Call store action để get/create conversation
      getOrCreateConversation(friend._id);
      
      // Wait a bit for socket response
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Close dialog
      onOpenChange(false);
      
      // Callback if provided
      if (onConversationCreated) {
        // We don't have conversationId immediately, but store will handle it
        onConversationCreated(friend._id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bắt đầu cuộc trò chuyện mới</DialogTitle>
          <DialogDescription>
            Chọn bạn bè để bắt đầu trò chuyện
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Friends List */}
        <ScrollArea className="h-[400px] pr-4">
          {loadingFriends ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{searchQuery ? "Không tìm thấy bạn bè" : "Chưa có bạn bè nào"}</p>
              <p className="text-sm mt-2">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Kết bạn để bắt đầu trò chuyện"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => handleCreateChat(friend)}
                  disabled={creating}
                  className="w-full p-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={friend.avatarUrl} alt={friend.displayName || friend.username} />
                    <AvatarFallback>
                      {(friend.displayName || friend.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {friend.displayName || friend.username}
                    </h4>
                    {friend.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {friend.email}
                      </p>
                    )}
                  </div>

                  <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
