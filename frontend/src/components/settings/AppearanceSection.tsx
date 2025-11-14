import { Card, CardContent, Typography, Divider, ToggleButtonGroup, ToggleButton, IconButton, Box } from "@mui/material";
import { ThemeToggleButton } from "../theme/ThemeToggleButton";
import { useEffect, useState } from "react";
import { Palette } from "@mui/icons-material";
import { toast } from "sonner";

const AppearanceSection = () => {
    const [fontSize, setFontSize] = useState<string>("medium");
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
};

export default AppearanceSection;
