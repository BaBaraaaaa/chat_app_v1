import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useSystemTheme } from "./useSystemTheme";
import { useTheme } from "./useTheme";

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeSettingsProps {
  className?: string;
}

export function ThemeSettings({ className = "" }: ThemeSettingsProps) {
  const {  setTheme } = useTheme();
  const systemTheme = useSystemTheme();
  
  // Get current theme mode (including system)
  const getCurrentMode = (): ThemeOption => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeOption;
    return savedMode || 'system';
  };
  
  const currentMode = getCurrentMode();

  const handleThemeChange = (mode: ThemeOption) => {
    localStorage.setItem('theme-mode', mode);
    
    if (mode === 'system') {
      setTheme(systemTheme);
    } else {
      setTheme(mode);
    }
  };

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Sáng',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Tối',
      icon: Moon,
    },
    {
      value: 'system' as const,
      label: 'Hệ thống',
      icon: Monitor,
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-medium">Chế độ giao diện</h4>
      <div className="flex gap-2">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.value}
              variant={currentMode === option.value ? "default" : "outline"}
              size="sm"
              className="flex-1 flex items-center gap-2"
              onClick={() => handleThemeChange(option.value)}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {currentMode === 'system' 
          ? `Đang sử dụng: ${systemTheme === 'dark' ? 'Tối' : 'Sáng'} (theo hệ thống)`
          : `Đang sử dụng: ${currentMode === 'dark' ? 'Tối' : 'Sáng'}`
        }
      </p>
    </div>
  );
}