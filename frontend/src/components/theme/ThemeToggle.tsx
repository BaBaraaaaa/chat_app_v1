import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./useTheme";

interface ThemeToggleProps {
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ 
  size = "icon", 
  variant = "ghost", 
  className = "",
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={className}
      title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
        </span>
      )}
    </Button>
  );
}