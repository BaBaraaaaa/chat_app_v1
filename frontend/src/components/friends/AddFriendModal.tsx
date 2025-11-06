import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, UserPlus, Loader2, AtSign } from "lucide-react";
import { useFriendStore } from "@/stores/useFriendStore";
import { friendService } from "@/services/friendService";
import { toast } from "sonner";

interface AddFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  _id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

const AddFriendModal = ({ open, onOpenChange }: AddFriendModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendMode, setSendMode] = useState<'search' | 'username'>('search');
  const [directUsername, setDirectUsername] = useState("");

  const { sendFriendRequest, sendFriendRequestByUsername } = useFriendStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await friendService.searchUsers(searchQuery.trim());
      setSearchResults(response.data || []);
    } catch {
      toast.error("Không thể tìm kiếm người dùng");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;

    setIsSending(true);
    try {
      await sendFriendRequest(selectedUser._id, message);
      toast.success(`Đã gửi lời mời kết bạn tới ${selectedUser.displayName}`);
      handleClose();
    } catch {
      // Error handling is done in the store
    } finally {
      setIsSending(false);
    }
  };

  const handleSendByUsername = async () => {
    if (!directUsername.trim()) {
      toast.error("Vui lòng nhập username");
      return;
    }

    setIsSending(true);
    try {
      await sendFriendRequestByUsername(directUsername.trim(), message);
      toast.success(`Đã gửi lời mời kết bạn tới @${directUsername}`);
      handleClose();
    } catch {
      // Error handling is done in the store
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setMessage("");
    setDirectUsername("");
    setSendMode('search');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Thêm bạn bè
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và gửi lời mời kết bạn đến người dùng khác
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={sendMode} onValueChange={(value) => setSendMode(value as 'search' | 'username')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Tìm kiếm
              </TabsTrigger>
              <TabsTrigger value="username" className="flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 mt-4">
              {!selectedUser ? (
                <>
                  {/* Search Section */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Tìm kiếm người dùng</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Nhập tên, email hoặc username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        disabled={!searchQuery.trim() || isSearching}
                        className="shrink-0"
                      >
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <Label>Kết quả tìm kiếm</Label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {searchResults.map((result) => (
                          <div
                            key={result._id}
                            className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setSelectedUser(result)}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {result.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.displayName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                @{result.username}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && !isSearching && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Không tìm thấy người dùng nào
                    </p>
                  )}
                </>
              ) : (
                <>
                  {/* Selected User */}
                  <div className="space-y-2">
                    <Label>Gửi lời mời kết bạn tới</Label>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-accent/20">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {selectedUser.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{selectedUser.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          @{selectedUser.username}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(null)}
                      >
                        Thay đổi
                      </Button>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Tin nhắn (tùy chọn)</Label>
                    <Textarea
                      id="message"
                      placeholder="Viết tin nhắn kèm theo lời mời..."
                      value={message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="username" className="space-y-4 mt-4">
              {/* Direct Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Nhập username (không có @)"
                    value={directUsername}
                    onChange={(e) => setDirectUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Gửi lời mời trực tiếp bằng username mà không cần tìm kiếm
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message-username">Tin nhắn (tùy chọn)</Label>
                <Textarea
                  id="message-username"
                  placeholder="Viết tin nhắn kèm theo lời mời..."
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Hủy
          </Button>
          
          {sendMode === 'search' && selectedUser && (
            <Button
              onClick={handleSendRequest}
              disabled={isSending}
              className="gap-2"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Gửi lời mời
            </Button>
          )}

          {sendMode === 'username' && (
            <Button
              onClick={handleSendByUsername}
              disabled={isSending || !directUsername.trim()}
              className="gap-2"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Gửi lời mời
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;