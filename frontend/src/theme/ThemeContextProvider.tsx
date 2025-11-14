import {  useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
type ThemeMode = 'light' | 'dark';




interface ThemeContextProviderProps {
  children: ReactNode;
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Kiểm tra theme đã lưu trong localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Nếu không có, sử dụng system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Sync with localStorage
    localStorage.setItem('theme', mode);
    
    // Update document attribute for potential CSS usage
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setModeState((prevMode) => prevMode === 'light' ? 'dark' : 'light');
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const value = useMemo(
    () => ({ mode, toggleTheme, setMode }),
    [mode, toggleTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

