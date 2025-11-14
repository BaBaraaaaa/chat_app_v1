import type { User } from '@/type/user'
import { Person, CameraAlt, Edit } from '@mui/icons-material'
import { Card, CardContent, Typography, Avatar, IconButton, Chip, TextField, Box } from '@mui/material'

interface ProfileProps {
  user: User | null
}

const ProfileSection = ({user}: ProfileProps) => {
  return (
       <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
  )
}

export default ProfileSection