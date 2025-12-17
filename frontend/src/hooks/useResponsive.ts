import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

/**
 * Custom hook for responsive design state management
 */
export const useResponsive = () => {
  const theme = useTheme();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // MUI breakpoint helpers
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Orientation detection
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  
  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  
  // High DPI detection
  const isHighDPI = useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive values based on current breakpoint
  const getResponsiveValue = <T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }): T | undefined => {
    if (isLarge && values.lg) return values.lg;
    if (isDesktop && values.md) return values.md;
    if (isTablet && values.sm) return values.sm;
    if (isMobile && values.xs) return values.xs;
    
    // Fallback to largest available value
    return values.lg || values.md || values.sm || values.xs;
  };

  // Current breakpoint name
  const currentBreakpoint = (() => {
    if (isMobile) return 'xs';
    if (isTablet) return 'sm';
    if (isDesktop && !isLarge) return 'md';
    return 'lg';
  })();

  return {
    // Window dimensions
    windowSize,
    
    // Breakpoint booleans
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    
    // Current breakpoint
    currentBreakpoint,
    
    // Orientation
    isLandscape,
    isPortrait,
    
    // Device capabilities
    isTouchDevice,
    isHighDPI,
    
    // Utilities
    getResponsiveValue,
    
    // Responsive spacing helper
    spacing: (factor: number) => ({
      xs: theme.spacing(factor * 0.75),
      sm: theme.spacing(factor),
      md: theme.spacing(factor * 1.25),
    }),
    
    // Responsive typography helper
    typography: {
      responsive: (baseFontSize: number) => ({
        fontSize: {
          xs: `${baseFontSize * 0.875}rem`,
          sm: `${baseFontSize}rem`,
          md: `${baseFontSize * 1.125}rem`,
        }
      }),
    },
  };
};

/**
 * Hook to detect if component should use mobile layout
 */
export const useMobileLayout = () => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * Hook for responsive component sizing
 */
export const useResponsiveSize = () => {
  const { isMobile, getResponsiveValue } = useResponsive();
  
  return {
    avatarSize: getResponsiveValue({
      xs: 36,
      sm: 40,
      md: 44,
    }),
    
    iconButtonSize: isMobile ? 'small' : 'medium',
    
    textFieldSize: isMobile ? 'small' : 'medium',
    
    buttonSize: isMobile ? 'small' : 'medium',
    
    listItemPadding: getResponsiveValue({
      xs: 1,
      sm: 1.5,
      md: 2,
    }),
    
    containerPadding: getResponsiveValue({
      xs: 2,
      sm: 3,
      md: 4,
    }),
  };
};