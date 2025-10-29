import React, {  useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeProviderContext } from './ThemeProviderContext';

type Theme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};


export function ThemeProvider({
  children,
  storageKey = 'chat-ui-theme',
  ...props
}: ThemeProviderProps) {
  const { darkMode, toggleDarkMode } = useAuthStore();
  
  // Determine current theme based on store state
  const theme: Theme = darkMode ? 'dark' : 'light';

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    // Set initial theme if different from current
    if ((initialTheme === 'dark') !== darkMode) {
      toggleDarkMode();
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    // Update the store based on the new theme
    if ((newTheme === 'dark') !== darkMode) {
      toggleDarkMode();
    }
    
    // Save to localStorage
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}