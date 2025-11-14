import { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
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
} from "@mui/icons-material";
import { useAuthStore } from "@/stores/useAuthStore";
import ProfileSection from "./ProfileSection";
import NotificationsSection from "./NotificationsSection";
import PrivacySection from "./PrivacySection";
import AppearanceSection from "./AppearanceSection";

export default function SettingsPanelMui() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const renderProfileSection = () => <ProfileSection user={user} />;

  const renderNotificationsSection = () => (
    <NotificationsSection
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      notificationsEnabled={notificationsEnabled}
      setNotificationsEnabled={setNotificationsEnabled}
    />
  );

  const renderPrivacySection = () => (
    <PrivacySection/>
  );

  const renderAppearanceSection = () => (
   <AppearanceSection/>
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
