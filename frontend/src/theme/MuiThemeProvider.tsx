import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { lightTheme, darkTheme } from './muiTheme';
import { ThemeContextProvider } from './ThemeContextProvider';
import { useTheme } from './useTheme';

interface MuiThemeProviderInnerProps {
  children: ReactNode;
}

function MuiThemeProviderInner({ children }: MuiThemeProviderInnerProps) {
  const { mode } = useTheme();
  
  const theme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);

  // Update document attributes for dark mode
  useEffect(() => {
    const root = document.documentElement;
    
    // Add/remove dark class for compatibility
    if (mode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-mui-color-scheme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-mui-color-scheme', 'light');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        mode === 'dark' ? darkTheme.palette.background.default : lightTheme.palette.background.default
      );
    }
  }, [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

interface CustomMuiThemeProviderProps {
  children: ReactNode;
}

export function CustomMuiThemeProvider({ children }: CustomMuiThemeProviderProps) {
  return (
    <ThemeContextProvider>
      <MuiThemeProviderInner>{children}</MuiThemeProviderInner>
    </ThemeContextProvider>
  );
}
