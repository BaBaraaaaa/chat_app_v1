/**
 * Performance-optimized logger utility
 * Chỉ log trong development mode để tối ưu performance production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Socket-specific loggers
  socket: {
    connection: (...args: any[]) => {
      if (isDevelopment) {
        console.log('🔌', ...args);
      }
    },
    
    message: (...args: any[]) => {
      if (isDevelopment) {
        console.log('💬', ...args);
      }
    },
    
    friend: (...args: any[]) => {
      if (isDevelopment) {
        console.log('👥', ...args);
      }
    },
    
    conversation: (...args: any[]) => {
      if (isDevelopment) {
        console.log('📋', ...args);
      }
    }
  }
};

export default logger;