import { useState } from "react";
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

interface Friend {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen?: string;
  avatar?: string;
  status?: string;
}

interface FriendRequest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  requestDate: string;
  mutualFriends: number;
}

const FriendsPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const friends: Friend[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "a@email.com",
      isOnline: true,
      status: "Đang làm việc",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "b@email.com",
      isOnline: false,
      lastSeen: "5 phút trước",
      status: "Busy",
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "c@email.com",
      isOnline: true,
      status: "Available",
    },
    {
      id: "4",
      name: "Phạm Thị D",
      email: "d@email.com",
      isOnline: false,
      lastSeen: "2 giờ trước",
    },
  ];

  const friendRequests: FriendRequest[] = [
    {
      id: "1",
      name: "Hoàng Văn E",
      email: "e@email.com",
      requestDate: "2 ngày trước",
      mutualFriends: 3,
    },
    {
      id: "2",
      name: "Đỗ Thị F",
      email: "f@email.com",
      requestDate: "1 tuần trước",
      mutualFriends: 1,
    },
  ];

  const onlineFriends = friends.filter((f) => f.isOnline);
  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFriendsToShow = () => {
    switch (activeTab) {
      case "online":
        return onlineFriends.filter(
          (f) =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return filteredFriends;
    }
  };

  const handleAcceptRequest = (id: string) => console.log("Accept:", id);
  const handleDeclineRequest = (id: string) => console.log("Decline:", id);

  return (
    <div className="w-full md:w-80 bg-card border-r border-border flex flex-col rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Bạn bè</h2>
          <Button size="sm" className="gap-2 rounded-full shadow-sm">
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
          <TabsList className="grid w-full grid-cols-3 gap-2 rounded-xl bg-muted/30 p-1">
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
              Hoạt động ({onlineFriends.length})
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className={cn(
                "text-xs font-medium relative rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-0"
              )}
            >
              Yêu cầu
              {friendRequests.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] rounded-full"
                >
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {getFriendsToShow().map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
              {getFriendsToShow().length === 0 && (
                <EmptyState message="Không tìm thấy bạn bè nào" />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="online" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 py-4">
              {getFriendsToShow().map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
              ))}
              {getFriendsToShow().length === 0 && (
                <EmptyState message="Không có bạn bè đang hoạt động" />
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 mt-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-3 py-4">
              {friendRequests.map((r) => (
                <div
                  key={r.id}
                  className="p-3 border border-border rounded-xl hover:bg-accent/50 transition-all duration-200 ease-in-out group"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {r.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{r.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {r.mutualFriends} bạn chung • {r.requestDate}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 h-8 rounded-full"
                          onClick={() => handleAcceptRequest(r.id)}
                        >
                          <UserCheck className="w-3 h-3 mr-1" /> Chấp nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 rounded-full"
                          onClick={() => handleDeclineRequest(r.id)}
                        >
                          <UserX className="w-3 h-3 mr-1" /> Từ chối
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {friendRequests.length === 0 && (
                <EmptyState message="Không có yêu cầu kết bạn nào" />
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ========== Sub Components ========== */

const FriendCard = ({ friend }: { friend: Friend }) => (
  <div className="p-3 rounded-xl border border-border flex items-center gap-3 hover:bg-accent/50 transition-all duration-200 ease-in-out group hover:shadow-sm">
    <div className="relative">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {friend.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {friend.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-medium truncate">{friend.name}</h4>
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
