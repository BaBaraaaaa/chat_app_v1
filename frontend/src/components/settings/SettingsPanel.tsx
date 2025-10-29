import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  HelpCircle,
  Info,
  Camera,
  Edit3,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Key,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeSettings } from "@/components/theme/ThemeSettings";
import Logout from "@/components/auth/Logout";

const SettingsPanel = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnlineStatusVisible, setIsOnlineStatusVisible] = useState(true);

  const settingSections = [
    {
      id: "profile",
      icon: User,
      label: "Hồ sơ cá nhân",
      description: "Thông tin và avatar của bạn",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Thông báo",
      description: "Cài đặt thông báo và âm thanh",
    },
    {
      id: "privacy",
      icon: Shield,
      label: "Quyền riêng tư",
      description: "Bảo mật và quyền riêng tư",
    },
    {
      id: "appearance",
      icon: Palette,
      label: "Giao diện",
      description: "Chủ đề và tùy chỉnh hiển thị",
    },
    {
      id: "language",
      icon: Globe,
      label: "Ngôn ngữ",
      description: "Ngôn ngữ hiển thị",
    },
    {
      id: "data",
      icon: Download,
      label: "Dữ liệu",
      description: "Quản lý dữ liệu và bộ nhớ",
    },
    {
      id: "help",
      icon: HelpCircle,
      label: "Trợ giúp",
      description: "Hỗ trợ và phản hồi",
    },
    {
      id: "about",
      icon: Info,
      label: "Về ứng dụng",
      description: "Thông tin phiên bản",
    },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Avatar and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user?.displayName}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1">
                Hoạt động
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <div className="flex gap-2">
                <Input
                  id="displayName"
                  defaultValue={user?.displayName}
                  className="flex-1"
                />
                <Button size="icon" variant="outline">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Input
                id="status"
                placeholder="Đang làm việc..."
                defaultValue="Đang làm việc"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Giới thiệu</Label>
              <Input
                id="bio"
                placeholder="Viết vài dòng về bản thân..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email}
              disabled
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+84 xxx xxx xxx"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Cài đặt thông báo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Thông báo push</h4>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo khi có tin nhắn mới
              </p>
            </div>
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? "Bật" : "Tắt"}
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Âm thanh thông báo</h4>
              <p className="text-sm text-muted-foreground">
                Phát âm thanh khi có thông báo
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Thông báo cho</h4>
            <div className="space-y-2">
              {[
                "Tin nhắn mới",
                "Yêu cầu kết bạn",
                "Lời mời nhóm",
                "Cuộc gọi đến",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>
                  <Button variant="outline" size="sm">
                    Bật
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quyền riêng tư và bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Hiển thị trạng thái online</h4>
              <p className="text-sm text-muted-foreground">
                Cho phép bạn bè thấy khi bạn đang online
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOnlineStatusVisible(!isOnlineStatusVisible)}
            >
              {isOnlineStatusVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Bảo mật tài khoản</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Key className="w-4 h-4 mr-2" />
                Đổi mật khẩu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="w-4 h-4 mr-2" />
                Xác thực 2 bước
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Phiên đăng nhập
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Quyền riêng tư</h4>
            <div className="space-y-2">
              {[
                "Ai có thể gửi tin nhắn cho bạn",
                "Ai có thể thấy thông tin của bạn",
                "Ai có thể thêm bạn vào nhóm",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>
                  <Button variant="outline" size="sm">
                    Tất cả
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Giao diện và chủ đề
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeSettings />
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium">Kích thước chữ</h4>
            <div className="flex gap-2">
              {["Nhỏ", "Vừa", "Lớn"].map((size) => (
                <Button
                  key={size}
                  variant={size === "Vừa" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Màu chủ đề</h4>
            <div className="grid grid-cols-6 gap-2">
              {[
                "bg-blue-500",
                "bg-green-500",
                "bg-purple-500",
                "bg-red-500",
                "bg-orange-500",
                "bg-pink-500",
              ].map((color, index) => (
                <Button
                  key={index}
                  size="icon"
                  variant="outline"
                  className={`w-8 h-8 p-0 ${color} border-2 ${
                    index === 0 ? "border-primary" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "privacy":
        return renderPrivacySection();
      case "appearance":
        return renderAppearanceSection();
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chọn một mục cài đặt để bắt đầu</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex">
      {/* Settings Menu */}
      <div className="w-80 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Cài đặt</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto mb-1"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
            
            <Separator className="my-4" />
            
            <div className="p-2">
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
                <LogOut className="w-5 h-5 mr-3" />
                <Logout />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        <ScrollArea className="h-full">
          <div className="p-6">
            {renderSection()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SettingsPanel;