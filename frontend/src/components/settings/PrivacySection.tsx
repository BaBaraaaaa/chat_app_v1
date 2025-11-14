import {
  Security,
  Smartphone,
  Visibility,
  VisibilityOff,
  VpnKey,
  Lock,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PrivacySection = () => {
  const [isOnlineStatusVisible, setIsOnlineStatusVisible] =
    useState<boolean>(true);
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
};

export default PrivacySection;
