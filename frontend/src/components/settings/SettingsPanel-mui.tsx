import { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Button,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Settings,
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  HelpOutline,
  Info,
  CameraAlt,
  Edit,
  VolumeUp,
  VolumeOff,
  Visibility,
  VisibilityOff,
  Smartphone,
  Lock,
  VpnKey,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuthStore } from "@/stores/useAuthStore";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import Logout from "@/components/auth/Logout";

export default function SettingsPanelMui() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOnlineStatusVisible, setIsOnlineStatusVisible] = useState(true);
  const [fontSize, setFontSize] = useState<string>("medium");

  const settingSections = [
    {
      id: "profile",
      icon: Person,
      label: "Hồ sơ cá nhân",
      description: "Thông tin và avatar của bạn",
    },
    {
      id: "notifications",
      icon: Notifications,
      label: "Thông báo",
      description: "Cài đặt thông báo và âm thanh",
    },
    {
      id: "privacy",
      icon: Security,
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
      icon: Language,
      label: "Ngôn ngữ",
      description: "Ngôn ngữ hiển thị",
    },
    {
      id: "data",
      icon: Storage,
      label: "Dữ liệu",
      description: "Quản lý dữ liệu và bộ nhớ",
    },
    {
      id: "help",
      icon: HelpOutline,
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Avatar and Basic Info */}
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <Person />
            Thông tin cá nhân
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  fontSize: "2rem",
                }}
              >
                {user?.displayName?.charAt(0) || "U"}
              </Avatar>
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{user?.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Chip
                label="Hoạt động"
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tên hiển thị
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  defaultValue={user?.displayName}
                />
                <IconButton>
                  <Edit />
                </IconButton>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Trạng thái
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Đang làm việc..."
                defaultValue="Đang làm việc"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Giới thiệu
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Viết vài dòng về bản thân..."
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin liên hệ
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Email
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="email"
                defaultValue={user?.email}
                disabled
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Số điện thoại
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="tel"
                placeholder="+84 xxx xxx xxx"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderNotificationsSection = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <Notifications />
            Cài đặt thông báo
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2">Thông báo push</Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhận thông báo khi có tin nhắn mới
                </Typography>
              </Box>
              <Switch
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2">Âm thanh thông báo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Phát âm thanh khi có thông báo
                </Typography>
              </Box>
              <IconButton onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <VolumeUp /> : <VolumeOff />}
              </IconButton>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Thông báo cho
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  "Tin nhắn mới",
                  "Yêu cầu kết bạn",
                  "Lời mời nhóm",
                  "Cuộc gọi đến",
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2">{item}</Typography>
                    <Switch defaultChecked size="small" />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderPrivacySection = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <Security />
            Quyền riêng tư và bảo mật
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2">
                  Hiển thị trạng thái online
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cho phép bạn bè thấy khi bạn đang online
                </Typography>
              </Box>
              <IconButton
                onClick={() => setIsOnlineStatusVisible(!isOnlineStatusVisible)}
              >
                {isOnlineStatusVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Bảo mật tài khoản
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<VpnKey />}
                  fullWidth
                  sx={{ justifyContent: "flex-start" }}
                >
                  Đổi mật khẩu
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Smartphone />}
                  fullWidth
                  sx={{ justifyContent: "flex-start" }}
                >
                  Xác thực 2 bước
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  fullWidth
                  sx={{ justifyContent: "flex-start" }}
                >
                  Phiên đăng nhập
                </Button>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Quyền riêng tư
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  "Ai có thể gửi tin nhắn cho bạn",
                  "Ai có thể thấy thông tin của bạn",
                  "Ai có thể thêm bạn vào nhóm",
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2">{item}</Typography>
                    <Button variant="outlined" size="small">
                      Tất cả
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderAppearanceSection = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
          >
            <Palette />
            Giao diện và chủ đề
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Chế độ hiển thị
              </Typography>
              <ThemeToggleButton />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Kích thước chữ
              </Typography>
              <ToggleButtonGroup
                value={fontSize}
                exclusive
                onChange={(_, value) => value && setFontSize(value)}
                fullWidth
                size="small"
              >
                <ToggleButton value="small">Nhỏ</ToggleButton>
                <ToggleButton value="medium">Vừa</ToggleButton>
                <ToggleButton value="large">Lớn</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Màu chủ đề
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 1,
                }}
              >
                {[
                  "#2196F3",
                  "#4CAF50",
                  "#9C27B0",
                  "#F44336",
                  "#FF9800",
                  "#E91E63",
                ].map((color, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      bgcolor: color,
                      width: 40,
                      height: 40,
                      border: index === 0 ? 2 : 0,
                      borderColor: "primary.main",
                      "&:hover": {
                        bgcolor: color,
                        opacity: 0.8,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
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
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <Settings sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography>Chọn một mục cài đặt để bắt đầu</Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
      {/* Settings Menu */}
      <Box
        sx={{
          width: 320,
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={600}>
            Cài đặt
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <List>
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <ListItemButton
                  key={section.id}
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={section.label}
                    secondary={section.description}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItemButton>
              );
            })}

          </List>
        </Box>
      </Box>

      {/* Settings Content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Box sx={{ p: 3 }}>{renderSection()}</Box>
      </Box>
    </Box>
  );
}
