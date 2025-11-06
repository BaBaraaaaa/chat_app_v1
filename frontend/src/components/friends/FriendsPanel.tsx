import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  UserPlus,
  Clock,
  MessageCircle,
  Phone,
  Video,
  MoreHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/type/store";
import AddFriendModal from "./AddFriendModal";
import LoadingSpinner from "@/components/ui/loading-spinner";

const FriendsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const { 
    friends, 
    receivedRequests, 
    sentRequests,
    loading,
    getFriendsList, 
    getFriendRequests, 
    getSentRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest
  } = useFriendStore();
  useEffect(() => {
    getFriendsList();
    getFriendRequests();
    getSentRequests();
  }, [getFriendsList, getFriendRequests, getSentRequests]);
  console.log('sentRequests', sentRequests);
  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get online friends
  const onlineFriends = filteredFriends.filter(friend => friend.isOnline);

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
  };

  const handleCancelRequest = async (requestId: string) => {
    await cancelFriendRequest(requestId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return `${Math.ceil(diffDays / 30)} tháng trước`;
  };

  return (
    <div className="w-full md:w-80 bg-card border-r border-border flex flex-col rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Bạn bè</h2>
          <Button 
            size="sm" 
            className="gap-2 rounded-full shadow-sm"
            onClick={() => setShowAddFriendModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            Thêm
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col bg-background"
      >
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-4 gap-1 rounded-xl bg-muted/30 p-1">
            <TabsTrigger
              value="all"
              className={cn(
                "text-xs font-medium rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-0"
              )}
            >
              Tất cả ({friends.length})
            </TabsTrigger>

            <TabsTrigger
              value="online"
              className={cn(
                "text-xs font-medium rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-0"
              )}
            >
              Online ({onlineFriends.length})
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className={cn(
                "text-xs font-medium relative rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-0"
              )}
            >
              Nhận
              {receivedRequests.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] rounded-full"
                >
                  {receivedRequests.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="sent"
              className={cn(
                "text-xs font-medium relative rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-0"
              )}
            >
              Gửi
              {sentRequests.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] rounded-full"
                >
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {filteredFriends.map((friend) => (
                    <FriendCard key={friend._id} friend={friend} />
                  ))}
                  {filteredFriends.length === 0 && (
                    <EmptyState message="Không tìm thấy bạn bè nào" />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="online" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {onlineFriends.map((friend) => (
                    <FriendCard key={friend._id} friend={friend} />
                  ))}
                  {onlineFriends.length === 0 && (
                    <EmptyState message="Không có bạn bè đang hoạt động" />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 py-4">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {receivedRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-3 border border-border rounded-xl hover:bg-accent/50 transition-all duration-200 ease-in-out group"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.toUserId?.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {request.toUserId?.displayName}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.toUserId.firstName} {request.toUserId?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(request.createdAt)}
                          </p>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{request.message}"
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 h-8 rounded-full"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              <UserCheck className="w-3 h-3 mr-1" /> Chấp nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-8 rounded-full"
                              onClick={() => handleDeclineRequest(request._id)}
                            >
                              <UserX className="w-3 h-3 mr-1" /> Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {receivedRequests.length === 0 && (
                    <EmptyState message="Không có yêu cầu kết bạn nào" />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sent" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 py-4">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {sentRequests.length > 0 && sentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="p-3 border border-border rounded-xl hover:bg-accent/50 transition-all duration-200 ease-in-out group"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.toUserId?.displayName.charAt(0) || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {request.toUserId.displayName}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {request.toUserId.firstName} {request.toUserId.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(request.createdAt)}
                            </p>
                            <Badge 
                              variant={request.status === 'pending' ? 'secondary' : 
                                      request.status === 'declined' ? 'destructive' : 'default'}
                              className="text-[10px] px-2 py-0.5"
                            >
                              {request.status === 'pending' ? 'Đang chờ' :
                               request.status === 'declined' ? 'Từ chối' : 
                               request.status === 'accepted' ? 'Đã chấp nhận' : request.status}
                            </Badge>
                          </div>
                          {request.message && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              "{request.message}"
                            </p>
                          )}
                          {request.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 rounded-full"
                                onClick={() => handleCancelRequest(request._id)}
                              >
                                <UserX className="w-3 h-3 mr-1" /> Hủy
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {sentRequests.length === 0 && (
                    <EmptyState message="Chưa gửi yêu cầu kết bạn nào" />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Add Friend Modal */}
      <AddFriendModal 
        open={showAddFriendModal} 
        onOpenChange={setShowAddFriendModal} 
      />
    </div>
  );
};

/* ========== Sub Components ========== */

const FriendCard = ({ friend }: { friend: Friend }) => (
  <div className="p-3 rounded-xl border border-border flex items-center gap-3 hover:bg-accent/50 transition-all duration-200 ease-in-out group hover:shadow-sm">
    <div className="relative">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {friend.displayName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {friend.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium truncate">{friend.displayName}</h4>
      <p className="text-xs text-muted-foreground truncate">
        {friend.firstName} {friend.lastName}
      </p>
      {friend.isOnline ? (
        <p className="text-xs text-green-600 font-medium">Đang hoạt động</p>
      ) : (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {friend.lastSeen || "Không hoạt động"}
        </div>
      )}
      {friend.status && (
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {friend.status}
        </p>
      )}
    </div>

    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <IconButton icon={<MessageCircle className="w-4 h-4" />} />
      <IconButton icon={<Phone className="w-4 h-4" />} />
      <IconButton icon={<Video className="w-4 h-4" />} />
      <IconButton icon={<MoreHorizontal className="w-4 h-4" />} />
    </div>
  </div>
);

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
  <Button
    size="icon"
    variant="ghost"
    className="w-8 h-8 hover:bg-muted/70 rounded-full transition-all"
  >
    {icon}
  </Button>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8 text-sm text-muted-foreground select-none">
    {message}
  </div>
);

export default FriendsPanel;
