import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, MessageCircle, Loader2 } from "lucide-react";
import { friendService } from "@/services/friendService";
import { conversationService } from "@/services/conversationService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/type/user";

interface SearchUsersProps {
  onStartConversation?: (userId: string) => void;
}

const SearchUsers = ({ onStartConversation }: SearchUsersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const { user: currentUser } = useAuthStore();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await friendService.searchUsers(searchQuery);
        if (response.success) {
          // Filter out current user
          const filtered = response.data.filter((u: User) => u._id !== currentUser?._id);
          setSearchResults(filtered);
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        console.error("Search error:", error);
        toast.error(err.response?.data?.message || "Lỗi tìm kiếm người dùng");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  // Send friend request
  const handleSendFriendRequest = async (userId: string, username: string) => {
    setSendingRequest(userId);
    try {
      const response = await friendService.sendFriendRequest(userId);
      if (response.success) {
        toast.success(`Đã gửi lời mời kết bạn đến ${username}`);
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Send friend request error:", error);
      toast.error(err.response?.data?.message || "Lỗi gửi lời mời kết bạn");
    } finally {
      setSendingRequest(null);
    }
  };

  // Start conversation
  const handleStartConversation = (userId: string) => {
    conversationService.getOrCreateConversation({ otherUserId: userId });
    if (onStartConversation) {
      onStartConversation(userId);
    }
    toast.success("Đang tạo cuộc trò chuyện...");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendFriendRequest(user._id, user.displayName)}
                  disabled={sendingRequest === user._id}
                >
                  {sendingRequest === user._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kết bạn
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStartConversation(user._id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nhập tên hoặc username để tìm kiếm người dùng</p>
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
