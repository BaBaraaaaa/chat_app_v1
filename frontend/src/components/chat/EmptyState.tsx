import { Button } from "@/components/ui/button";
import { MessageCircle, UserPlus, Users } from "lucide-react";

const EmptyState = () => {
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
};

export default EmptyState;