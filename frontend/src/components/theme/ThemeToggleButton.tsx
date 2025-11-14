import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/theme/useTheme';

export function ThemeToggleButton() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'} placement="right">
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}
