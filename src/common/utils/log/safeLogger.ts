/**
 * Safe logger utility
 *
 * This is a wrapper around the network logger that provides
 * fallback to console logging if the logger is not available.
 * It helps prevent "Cannot read property of undefined" errors.
 */

// Import the logger with a try-catch to handle potential import errors
let logger: any;
try {
  const networkLogger = require("./networkLogger");
  logger = networkLogger.logger;
} catch (error) {
  console.warn("Failed to import logger, using console fallback");
}

/**
 * Safe debug log
 */
export const debug = (message: string, details?: any): void => {
  try {
    if (logger && logger.debug) {
      logger.debug(message, details);
    } else {
      console.debug(message, details);
    }
  } catch (error) {
    console.debug(message, details);
  }
};

/**
 * Safe info log
 */
export const info = (message: string, details?: any): void => {
  try {
    if (logger && logger.info) {
      logger.info(message, details);
    } else {
      console.info(message, details);
    }
  } catch (error) {
    console.info(message, details);
  }
};

/**
 * Safe warning log
 */
export const warn = (message: string, details?: any): void => {
  try {
    if (logger && logger.warn) {
      logger.warn(message, details);
    } else {
      console.warn(message, details);
    }
  } catch (error) {
    console.warn(message, details);
  }
};

/**
 * Safe error log
 */
export const error = (message: string, details?: any): void => {
  try {
    if (logger && logger.error) {
      logger.error(message, details);
    } else {
      console.error(message, details);
    }
  } catch (error) {
    console.error(message, details);
  }
};

/**
 * Get all logs (if available)
 */
export const getLogs = (): any[] => {
  try {
    if (logger && logger.getLogs) {
      return logger.getLogs();
    }
  } catch (error) {
    console.warn("Failed to get logs");
  }
  return [];
};
