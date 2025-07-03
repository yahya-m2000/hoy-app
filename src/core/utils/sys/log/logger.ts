/**
 * Secure Logger
 * 
 * Production-safe logging system that:
 * - Only logs in development mode
 * - Sanitizes sensitive data
 * - Provides structured logging
 * - Prevents data leaks in production
 * - Consolidated logger with all console methods
 * 
 * @module @core/utils/sys/log/secure-logger
 */

import { getEnv, isProduction, isDevelopment } from '@core/config/environment';

// Use global __DEV__ variable available in React Native
declare const __DEV__: boolean;

// ========================================
// TYPES AND INTERFACES
// ========================================

interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

// ========================================
// LOG STORAGE
// ========================================

const MAX_LOGS = 100;
const logs: LogEntry[] = [];

// ========================================
// SENSITIVE DATA PATTERNS
// ========================================

const SENSITIVE_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /session/i,
  /bearer/i,
  /jwt/i,
];

const SENSITIVE_KEYS = [
  'accessToken',
  'refreshToken',
  'password',
  'token',
  'auth',
  'authorization',
  'bearer',
  'jwt',
  'secret',
  'key',
  'credential',
  'session',
];

// ========================================
// DATA SANITIZATION
// ========================================

/**
 * Sanitize sensitive data from objects
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    ) || SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize message strings for sensitive content
 */
function sanitizeMessage(message: string): string {
  if (isProduction()) {
    // In production, be extra careful with messages
    const hasSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(message));
    if (hasSensitive) {
      return '[SANITIZED LOG MESSAGE]';
    }
  }
  return message;
}

/**
 * Store log entry in memory
 */
function storeLogEntry(level: LogLevel, message: string, details?: any): void {
  // Only store logs if memory monitoring is enabled
  if (!getEnv('ENABLE_MEMORY_MONITORING')) {
    return;
  }

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details: details ? sanitizeData(details) : undefined,
  };

  logs.unshift(logEntry);

  // Trim logs if they exceed the maximum
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS;
  }
}

// ========================================
// LOGGER IMPLEMENTATION
// ========================================

class SecureLogger {
  private isDevelopment = isDevelopment();
  private isVerboseEnabled = getEnv('ENABLE_VERBOSE_LOGGING');
  private isDebugEnabled = getEnv('ENABLE_DEBUG_COMPONENTS');

  /**
   * Generic log method (alias for info)
   */
  log(message: string, data?: any, p0?: string, checkOutTime?: string | undefined, context?: LogContext): void {
    this.info(message, data, context);
  }

  /**
   * Log debug information (development only)
   */
  debug(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment || !this.isDebugEnabled) return;

    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedData = data ? sanitizeData(data) : undefined;
    
    storeLogEntry('debug', sanitizedMessage, sanitizedData);
    
    if (context?.module) {
      console.debug(`[${context.module}] ${sanitizedMessage}`, sanitizedData || '');
    } else {
      console.debug(sanitizedMessage, sanitizedData || '');
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment && !this.isVerboseEnabled) return;

    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedData = data ? sanitizeData(data) : undefined;
    
    storeLogEntry('info', sanitizedMessage, sanitizedData);
    
    if (context?.module) {
      console.info(`[${context.module}] ${sanitizedMessage}`, sanitizedData || '');
    } else {
      console.info(sanitizedMessage, sanitizedData || '');
    }
  }

  /**
   * Log warnings (always logged but sanitized)
   */
  warn(message: string, data?: any, context?: LogContext): void {
    // Warnings are always logged unless in production without verbose logging
    if (isProduction() && !this.isVerboseEnabled) return;

    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedData = data ? sanitizeData(data) : undefined;
    
    storeLogEntry('warn', sanitizedMessage, sanitizedData);
    
    if (context?.module) {
      console.warn(`[${context.module}] ${sanitizedMessage}`, sanitizedData || '');
    } else {
      console.warn(sanitizedMessage, sanitizedData || '');
    }
  }

  /**
   * Log errors (always logged but sanitized)
   */
  error(message: string, error?: any, context?: LogContext): void {
    const sanitizedMessage = sanitizeMessage(message);
    
    // Special handling for Error objects
    let sanitizedError = error;
    if (error instanceof Error) {
      sanitizedError = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : '[STACK_TRACE_HIDDEN]'
      };
    } else if (error) {
      sanitizedError = sanitizeData(error);
    }
    
    storeLogEntry('error', sanitizedMessage, sanitizedError);
    
    if (context?.module) {
      console.error(`[${context.module}] ${sanitizedMessage}`, sanitizedError || '');
    } else {
      console.error(sanitizedMessage, sanitizedError || '');
    }
  }

  /**
   * Log trace information (development only)
   */
  trace(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment || !this.isDebugEnabled) return;

    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedData = data ? sanitizeData(data) : undefined;
    
    storeLogEntry('trace', sanitizedMessage, sanitizedData);
    
    if (context?.module) {
      console.trace(`[${context.module}] ${sanitizedMessage}`, sanitizedData || '');
    } else {
      console.trace(sanitizedMessage, sanitizedData || '');
    }
  }

  /**
   * Log authentication events with extra security
   */
  auth(message: string, context?: Omit<LogContext, 'userId'> & { email?: string }): void {
    if (isProduction() && !this.isVerboseEnabled) {
      // In production, only log generic auth events
      console.info('[AUTH] Authentication event occurred');
      return;
    }

    const sanitizedMessage = sanitizeMessage(message);
    const logContext = context?.email ? 
      `[AUTH:${context.email.substring(0, 3)}***]` : 
      '[AUTH]';
    
    storeLogEntry('info', `${logContext} ${sanitizedMessage}`);
    console.info(`${logContext} ${sanitizedMessage}`);
  }

  /**
   * Log network requests (development only)
   */
  network(message: string, data?: any, context?: LogContext): void {
    if (!this.isDevelopment || !this.isVerboseEnabled) return;

    const sanitizedMessage = sanitizeMessage(message);
    const sanitizedData = data ? sanitizeData(data) : undefined;
    
    storeLogEntry('debug', `[NETWORK] ${sanitizedMessage}`, sanitizedData);
    console.debug(`[NETWORK] ${sanitizedMessage}`, sanitizedData || '');
  }

  /**
   * Get all stored logs for debugging
   */
  getLogs(): LogEntry[] {
    if (!getEnv('ENABLE_MEMORY_MONITORING')) {
      return [];
    }
    return [...logs];
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    logs.length = 0;
  }

  /**
   * Check if logging is enabled
   */
  get isEnabled(): boolean {
    return this.isDevelopment || this.isVerboseEnabled;
  }
}

// ========================================
// LEGACY NETWORK LOGGER COMPATIBILITY
// ========================================

export const logRequest = (method: string, url: string, data?: any): void => {
  logger.network(`REQUEST: ${method.toUpperCase()} ${url}`, data);
};

export const logResponse = (url: string, status: number, data?: any): void => {
  logger.network(`RESPONSE: ${url} - Status: ${status}`, data);
};

export const logError = (url: string, error: any): void => {
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

// ========================================
// EXPORTS
// ========================================

export const logger = new SecureLogger();
export { LogContext, LogLevel, LogEntry }; 