import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThemeTransitionProps {
  children: ReactNode;
  className?: string;
}

export function ThemeTransition({ children, className }: ThemeTransitionProps) {
  return (
    <div className={cn('theme-transition', className)}>
      {children}
    </div>
  );
}