import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function ViewHeaderMui({ title, subtitle, actions }: ViewHeaderProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="h5" component="h1" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}
