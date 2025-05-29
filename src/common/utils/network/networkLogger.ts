/**
 * Network Logger Utility
 *
 * Provides enhanced logging functionality for API communications and
 * network operations with configurable log levels and log storage.
 */

// Log levels
type LogLevel = "debug" | "info" | "warn" | "error";

// Maximum number of logs to keep in memory
const MAX_LOGS = 100;

// Keep logs in memory for debugging
const logs: {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}[] = [];

// Enable debug logs in development
const isDebugEnabled = __DEV__;

/**
 * Log a message with the specified level
 */
const log = (level: LogLevel, message: string, details?: any) => {
  // Skip debug logs in production unless explicitly enabled
  if (level === "debug" && !isDebugEnabled) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, details };

  // Add to memory log
  logs.unshift(logEntry);

  // Trim logs if they exceed the maximum
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }

  // Log to console in development
  if (__DEV__) {
    switch (level) {
      case "debug":
        console.debug(`[NETWORK] ${message}`, details || "");
        break;
      case "info":
        console.info(`[NETWORK] ${message}`, details || "");
        break;
      case "warn":
        console.warn(`[NETWORK] ${message}`, details || "");
        break;
      case "error":
        console.error(`[NETWORK] ${message}`, details || "");
        break;
    }
  }
};

/**
 * Export logger functions
 */
export const logger = {
  debug: (message: string, details?: any) => log("debug", message, details),
  info: (message: string, details?: any) => log("info", message, details),
  warn: (message: string, details?: any) => log("warn", message, details),
  error: (message: string, details?: any) => log("error", message, details),

  /**
   * Get all logs for debugging
   */
  getLogs: () => [...logs],

  /**
   * Clear all logs
   */
  clearLogs: () => {
    logs.length = 0;
  },
};

// Legacy functions for backward compatibility
export const logRequest = (method: string, url: string, data?: any) => {
  logger.info(`REQUEST: ${method.toUpperCase()} ${url}`, data);
};

export const logResponse = (url: string, status: number, data?: any) => {
  logger.info(`RESPONSE: ${url} - Status: ${status}`, data);
};

export const logError = (url: string, error: any) => {
  let details = {};

  if (error.response) {
    details = {
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    details = { request: error.request };
  } else {
    details = { message: error.message };
  }

  logger.error(`ERROR: ${url}`, details);
};
