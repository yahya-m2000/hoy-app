/**
 * Network logger utility
 *
 * Provides standardized logging for network requests and responses
 * with support for different log levels and transport methods.
 */

// Simple logger implementation
export const logger = {
  debug: (message: string, details?: any) => {
    if (__DEV__) {
      if (details) {
        console.debug(`[DEBUG] ${message}`, details);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  },

  info: (message: string, details?: any) => {
    if (details) {
      console.info(`[INFO] ${message}`, details);
    } else {
      console.info(`[INFO] ${message}`);
    }
  },

  warn: (message: string, details?: any) => {
    if (details) {
      console.warn(`[WARN] ${message}`, details);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  error: (message: string, details?: any) => {
    if (details) {
      console.error(`[ERROR] ${message}`, details);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
};
