import { Notifications, VolumeOff, VolumeUp } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import { useEffect } from "react";
import { toast } from "sonner";

interface NotificationsSectionProps {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationsEnabled?: boolean;
  setNotificationsEnabled?: (enabled: boolean) => void;
}

const NotificationsSection = ({
  soundEnabled,
  setSoundEnabled,
  notificationsEnabled,
  setNotificationsEnabled,
}: NotificationsSectionProps) => {
  useEffect(() => {
    toast.warning("Chức năng này đang được phát triển!", { duration: 4000 });
  }, []);
  return (
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
                onChange={(e) => setNotificationsEnabled && setNotificationsEnabled(e.target.checked)}
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
};

export default NotificationsSection;
