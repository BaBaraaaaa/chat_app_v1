import { useEffect } from "react";
import { useSocketStore } from "@/stores/useSocketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

export const SocketDebugPanel = () => {
  const { isConnected, isConnecting, connectionError } = useSocketStore();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    console.log("🔍 Socket Debug:", {
      isConnected,
      isConnecting,
      connectionError,
      hasUser: !!user,
      hasToken: !!accessToken,
    });
  }, [isConnected, isConnecting, connectionError, user, accessToken]);

  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        title: "Đang kết nối...",
        description: "Socket đang thiết lập kết nối với server",
        variant: "default" as const,
        color: "bg-blue-500",
      };
    }

    if (isConnected) {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        title: "Đã kết nối",
        description: "Socket đã kết nối thành công với server",
        variant: "default" as const,
        color: "bg-green-500",
      };
    }

    if (connectionError) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        title: "Lỗi kết nối",
        description: connectionError,
        variant: "destructive" as const,
        color: "bg-red-500",
      };
    }

    return {
      icon: <XCircle className="h-4 w-4" />,
      title: "Chưa kết nối",
      description: "Socket chưa được kết nối với server",
      variant: "destructive" as const,
      color: "bg-gray-500",
    };
  };

  const status = getStatusInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className={`border-2 ${status.variant === 'destructive' ? 'border-destructive' : 'border-border'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={`${status.color} text-white rounded-full p-1.5`}>
              {status.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {status.title}
                <Badge variant="outline" className="text-xs">
                  Socket.IO
                </Badge>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-3">
            {status.description}
          </CardDescription>
          
          {/* Debug Info */}
          <div className="space-y-1 text-xs opacity-70 border-t pt-3">
            <div>User: {user ? `✅ ${user.username}` : "❌ Not logged in"}</div>
            <div>Token: {accessToken ? "✅ Present" : "❌ Missing"}</div>
            <div>Server: {import.meta.env.VITE_SERVER_URL || "http://localhost:5000"}</div>
          </div>

          {/* Retry Button */}
          {!isConnected && !isConnecting && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tải lại trang
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
