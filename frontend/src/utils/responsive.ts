/**
 * Responsive utilities and breakpoints for the chat application
 */

export const breakpoints = {
  mobile: 600,
  tablet: 900,
  desktop: 1200,
  wide: 1536,
} as const;

export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.tablet}px)`,
  wide: `@media (min-width: ${breakpoints.desktop}px)`,
} as const;

export const isMobile = (width: number): boolean => width < breakpoints.mobile;
export const isTablet = (width: number): boolean => 
  width >= breakpoints.mobile && width < breakpoints.tablet;
export const isDesktop = (width: number): boolean => width >= breakpoints.tablet;

// Responsive values helper
export const responsive = {
  // Spacing
  spacing: {
    xs: { xs: 1, sm: 2, md: 3 },
    sm: { xs: 2, sm: 3, md: 4 },
    md: { xs: 3, sm: 4, md: 6 },
    lg: { xs: 4, sm: 6, md: 8 },
  },
  
  // Font sizes
  fontSize: {
    xs: { xs: '0.75rem', sm: '0.8rem' },
    sm: { xs: '0.875rem', sm: '0.9rem' },
    md: { xs: '1rem', sm: '1rem' },
    lg: { xs: '1.125rem', sm: '1.25rem' },
    xl: { xs: '1.25rem', sm: '1.5rem' },
  },
  
  // Component sizes
  avatar: {
    small: { xs: 32, sm: 36, md: 40 },
    medium: { xs: 40, sm: 44, md: 48 },
    large: { xs: 48, sm: 56, md: 64 },
  },
  
  // Layout
  sidebar: {
    width: { xs: 0, md: 320, lg: 400 },
  },
  
  // Touch targets (minimum 44px for accessibility)
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
  },
} as const;

// Responsive text ellipsis
export const textEllipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

// Responsive flex utilities
export const flexResponsive = {
  mobileColumn: {
    flexDirection: { xs: 'column', md: 'row' },
  },
  mobileHidden: {
    display: { xs: 'none', md: 'flex' },
  },
  desktopHidden: {
    display: { xs: 'flex', md: 'none' },
  },
} as const;