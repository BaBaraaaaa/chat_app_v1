// Toast utility để tránh duplicate notifications
import { toast } from 'sonner';

class ToastManager {
  private recentToasts = new Map<string, number>();
  private DEBOUNCE_TIME = 1000; // 1 second

  private getToastKey(type: string, message: string): string {
    return `${type}:${message}`;
  }

  private shouldShowToast(key: string): boolean {
    const now = Date.now();
    const lastShown = this.recentToasts.get(key);
    
    if (!lastShown || (now - lastShown) > this.DEBOUNCE_TIME) {
      this.recentToasts.set(key, now);
      return true;
    }
    
    return false;
  }

  success(message: string): void {
    const key = this.getToastKey('success', message);
    if (this.shouldShowToast(key)) {
      toast.success(message);
    }
  }

  error(message: string): void {
    const key = this.getToastKey('error', message);
    if (this.shouldShowToast(key)) {
      toast.error(message);
    }
  }

  info(message: string): void {
    const key = this.getToastKey('info', message);
    if (this.shouldShowToast(key)) {
      toast.info(message);
    }
  }

  // Cleanup old entries to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.recentToasts.entries()) {
      if (now - timestamp > this.DEBOUNCE_TIME * 5) {
        this.recentToasts.delete(key);
      }
    }
  }
}

export const debouncedToast = new ToastManager();

// Cleanup every 30 seconds
setInterval(() => {
  debouncedToast.cleanup();
}, 30000);