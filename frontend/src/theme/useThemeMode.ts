export function useThemeMode() {
  // Hook này có thể được import và sử dụng trong các component
  // để toggle theme mode
  const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    window.location.reload(); // Reload để áp dụng theme mới
  };

  const currentMode = localStorage.getItem('theme') as 'light' | 'dark' || 'light';

  return { mode: currentMode, toggleTheme };
}
