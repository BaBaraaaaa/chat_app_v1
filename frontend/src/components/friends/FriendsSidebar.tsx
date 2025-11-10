import { useState } from 'react';
import { Search, Users, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useFriendStore } from '@/stores/useFriendStore';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';

const FriendsSidebar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, receivedRequests, sentRequests } = useFriendStore();
  const { isUserOnline } = useSocket();

  // Filter friends dựa trên search query
  const filteredFriends = friends.filter(friend => 
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính số bạn bè đang online
  const onlineFriendsCount = friends.filter(friend => isUserOnline(friend._id)).length;

  // Debug log
  console.log('🔍 FriendsSidebar Debug:', {
    totalFriends: friends.length,
    onlineFriendsCount,
    sampleCheck: friends.slice(0, 3).map(f => ({ 
      id: f._id, 
      name: f.displayName,
      online: isUserOnline(f._id) 
    }))
  });

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bạn bè
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {friends.length}
            </Badge>
            {onlineFriendsCount > 0 && (
              <Badge variant="outline" className="text-sm text-green-600 border-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
                {onlineFriendsCount} online
              </Badge>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Notifications */}
      {(receivedRequests.length > 0 || sentRequests.length > 0) && (
        <div className="p-3 border-b bg-blue-50 dark:bg-blue-950/20">
          <div className="space-y-2 text-sm">
            {receivedRequests.length > 0 && (
              <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Lời mời nhận được
                </span>
                <Badge variant="default" className="bg-blue-600">
                  {receivedRequests.length}
                </Badge>
              </div>
            )}
            {sentRequests.length > 0 && (
              <div className="flex items-center justify-between text-orange-700 dark:text-orange-400">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Lời mời đã gửi
                </span>
                <Badge variant="secondary">
                  {sentRequests.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <p>Không tìm thấy bạn bè nào</p>
              ) : (
                <div className="space-y-2">
                  <Users className="h-12 w-12 mx-auto opacity-50" />
                  <p>Chưa có bạn bè nào</p>
                  <p className="text-sm">Hãy thêm bạn để bắt đầu trò chuyện</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map((friend) => {
                const isOnline = isUserOnline(friend._id);
                
                return (
                  <div
                    key={friend._id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                      "hover:bg-accent transition-colors"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {friend.displayName?.charAt(0).toUpperCase() || friend.email.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      {/* Online status indicator - Real-time */}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FriendsSidebar;
