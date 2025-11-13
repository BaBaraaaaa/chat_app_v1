import { Box, Container, Typography, Button, Paper, Stack } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/theme/useTheme';

export default function ThemeTestPage() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
              MUI Dark Mode Test
            </Typography>

            <Typography variant="h6" color="text.secondary">
              Chế độ hiện tại: <strong>{mode === 'dark' ? 'Tối' : 'Sáng'}</strong>
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                onClick={toggleTheme}
                sx={{ px: 4, py: 1.5 }}
              >
                Toggle Dark Mode
              </Button>

              <Button variant="outlined" size="large" color="secondary">
                Secondary Button
              </Button>

              <Button variant="text" size="large" color="error">
                Text Button
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" gutterBottom>
                Đây là một Paper component với background tự động thay đổi theo theme.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Text secondary color cũng tự động điều chỉnh để dễ đọc.
              </Typography>
            </Paper>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
              }}
            >
              {['primary', 'secondary', 'success', 'error', 'warning', 'info'].map((color) => (
                <Paper
                  key={color}
                  sx={{
                    p: 2,
                    bgcolor: `${color}.main`,
                    color: `${color}.contrastText`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="button">{color}</Typography>
                </Paper>
              ))}
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
