/**
 * Error Reporting Service
 * 
 * Comprehensive error reporting and analytics service that tracks,
 * categorizes, and reports errors for debugging and improvement.
 * 
 * Features:
 * - Error tracking and categorization
 * - Error rate monitoring
 * - Crash analytics integration
 * - Development debugging tools
 * - Error pattern detection
 * - Performance impact analysis
 * 
 * @module @core/error/error-reporting.service
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from '@core/utils/sys/log';
import { eventEmitter } from '@core/utils/sys/event-emitter';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface ErrorReport {
  id: string;
  timestamp: number;
  type: ErrorType;
  level: ErrorLevel;
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  userAgent?: string;
  appVersion?: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  tags?: string[];
  fingerprint?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsByLevel: Record<ErrorLevel, number>;
  errorRate: number;
  crashRate: number;
  topErrors: {
    fingerprint: string;
    count: number;
    lastSeen: number;
    message: string;
  }[];
  sessionErrors: number;
}

export enum ErrorType {
  JAVASCRIPT = 'javascript',
  NETWORK = 'network',
  RENDER = 'render',
  PERMISSION = 'permission',
  MEMORY = 'memory',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

export enum ErrorLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

interface ErrorPattern {
  fingerprint: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  message: string;
  type: ErrorType;
  level: ErrorLevel;
}

// ========================================
// ERROR REPORTING SERVICE
// ========================================

class ErrorReportingService {
  private sessionId: string;
  private errorQueue: ErrorReport[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private sessionStartTime: number;
  private isInitialized: boolean = false;
  
  // Configuration
  private readonly maxQueueSize = 100;
  private readonly maxStoredErrors = 500;
  private readonly reportingInterval = 30000; // 30 seconds
  private readonly storageKey = '@hoy_error_reports';
  private readonly patternsKey = '@hoy_error_patterns';
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeService();
  }

  /**
   * Initialize the error reporting service
   */
  private async initializeService(): Promise<void> {
    try {
      // Load stored error patterns
      await this.loadErrorPatterns();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start periodic reporting
      this.startPeriodicReporting();
      
      this.isInitialized = true;
      logger.info('[ErrorReportingService] Service initialized', {
        sessionId: this.sessionId,
        module: 'ErrorReportingService',
      });
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to initialize service:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up event listeners for error tracking
   */
  private setupEventListeners(): void {
    // Listen for error boundary events
    eventEmitter.on('error:boundary', (data) => {
      this.reportError({
        error: data.error,
        level: ErrorLevel.ERROR,
        context: {
          errorBoundary: `${data.level}:${data.name}`,
          errorInfo: data.errorInfo,
        },
        tags: ['error-boundary', data.level],
      });
    });

    // Listen for component errors
    eventEmitter.on('error:component', (data) => {
      this.reportError({
        error: data.error,
        level: ErrorLevel.WARNING,
        context: {
          component: data.context,
        },
        tags: ['component-error'],
      });
    });

    // Listen for network errors
    eventEmitter.on('error:network', (data) => {
      this.reportError({
        error: data.error,
        level: ErrorLevel.ERROR,
        context: {
          url: data.url,
          method: data.method,
          status: data.status,
        },
        tags: ['network-error'],
      });
    });

    // Listen for app restart requests
    eventEmitter.on('app:restart_requested', (data) => {
      this.reportError({
        error: new Error('App restart requested'),
        level: ErrorLevel.FATAL,
        context: {
          reason: data.reason,
          errorId: data.errorId,
        },
        tags: ['app-restart'],
      });
    });
  }

  /**
   * Report an error to the service
   */
  public reportError(options: {
    error: Error | string;
    level?: ErrorLevel;
    context?: Record<string, any>;
    tags?: string[];
    userId?: string;
  }): string {
    try {
      const errorReport = this.createErrorReport(options);
      
      // Add to queue
      this.addToQueue(errorReport);
      
      // Update error patterns
      this.updateErrorPatterns(errorReport);
      
      // Log error
      this.logError(errorReport);
      
      // Emit event for real-time monitoring
      eventEmitter.emit('error:reported', errorReport);
      
      return errorReport.id;
    } catch (reportingError) {
      logger.error('[ErrorReportingService] Failed to report error:', reportingError);
      return '';
    }
  }

  /**
   * Create error report from options
   */
  private createErrorReport(options: {
    error: Error | string;
    level?: ErrorLevel;
    context?: Record<string, any>;
    tags?: string[];
    userId?: string;
  }): ErrorReport {
    const error = typeof options.error === 'string' 
      ? new Error(options.error) 
      : options.error;
    
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fingerprint = this.generateFingerprint(error);
    
    return {
      id: errorId,
      timestamp: Date.now(),
      type: this.classifyError(error),
      level: options.level || ErrorLevel.ERROR,
      message: error.message,
      stack: error.stack,
      componentStack: (error as any).componentStack,
      errorBoundary: options.context?.errorBoundary,
      userAgent: navigator.userAgent || 'Unknown',
      appVersion: '1.0.0', // Should be dynamic
      userId: options.userId,
      sessionId: this.sessionId,
      context: options.context,
      tags: options.tags || [],
      fingerprint,
    };
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('text strings must be rendered within a <text> component')) {
      return ErrorType.RENDER;
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ErrorType.PERMISSION;
    }
    
    if (message.includes('memory') || message.includes('heap')) {
      return ErrorType.MEMORY;
    }
    
    if (message.includes('storage') || message.includes('asyncstorage')) {
      return ErrorType.STORAGE;
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return ErrorType.JAVASCRIPT;
    }
    
    return ErrorType.UNKNOWN;
  }

  /**
   * Generate error fingerprint for pattern detection
   */
  private generateFingerprint(error: Error): string {
    // Create a unique fingerprint based on error message and stack
    const message = error.message.replace(/\d+/g, 'X'); // Replace numbers with X
    const stack = error.stack?.split('\n')[0] || '';
    
    return btoa(`${error.name}:${message}:${stack}`).substr(0, 16);
  }

  /**
   * Add error to queue
   */
  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Update error patterns for pattern detection
   */
  private updateErrorPatterns(errorReport: ErrorReport): void {
    const { fingerprint, type, level, message } = errorReport;
    
    // Ensure fingerprint exists before using it
    if (!fingerprint) {
      logger.warn('[ErrorReportingService] Error report missing fingerprint, skipping pattern update');
      return;
    }
    
    if (this.errorPatterns.has(fingerprint)) {
      const pattern = this.errorPatterns.get(fingerprint)!;
      pattern.count += 1;
      pattern.lastSeen = Date.now();
    } else {
      this.errorPatterns.set(fingerprint, {
        fingerprint,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        message,
        type,
        level,
      });
    }
    
    // Persist patterns periodically
    this.saveErrorPatterns();
  }

  /**
   * Log error with appropriate level
   */
  private logError(errorReport: ErrorReport): void {
    const logData = {
      errorId: errorReport.id,
      type: errorReport.type,
      level: errorReport.level,
      message: errorReport.message,
      fingerprint: errorReport.fingerprint,
      tags: errorReport.tags,
      module: 'ErrorReportingService',
    };

    switch (errorReport.level) {
      case ErrorLevel.FATAL:
        logger.error(`[ErrorReportingService] FATAL ERROR:`, logData);
        break;
      case ErrorLevel.ERROR:
        logger.error(`[ErrorReportingService] ERROR:`, logData);
        break;
      case ErrorLevel.WARNING:
        logger.warn(`[ErrorReportingService] WARNING:`, logData);
        break;
      case ErrorLevel.INFO:
        logger.info(`[ErrorReportingService] INFO:`, logData);
        break;
    }
  }

  /**
   * Start periodic error reporting
   */
  private startPeriodicReporting(): void {
    setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flushErrorQueue();
      }
    }, this.reportingInterval);
  }

  /**
   * Flush error queue to storage/analytics
   */
  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;
    
    try {
      const errorsToFlush = [...this.errorQueue];
      this.errorQueue = [];
      
      // Save to local storage
      await this.saveErrorsToStorage(errorsToFlush);
      
      // Send to analytics in production
      if (!__DEV__) {
        await this.sendToAnalytics(errorsToFlush);
      }
      
      logger.info(`[ErrorReportingService] Flushed ${errorsToFlush.length} errors`, {
        module: 'ErrorReportingService',
      });
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to flush error queue:', error);
    }
  }

  /**
   * Save errors to local storage
   */
  private async saveErrorsToStorage(errors: ErrorReport[]): Promise<void> {
    try {
      const existingErrors = await this.loadErrorsFromStorage();
      const allErrors = [...existingErrors, ...errors];
      
      // Limit stored errors
      const limitedErrors = allErrors.slice(-this.maxStoredErrors);
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(limitedErrors));
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to save errors to storage:', error);
    }
  }

  /**
   * Load errors from local storage
   */
  private async loadErrorsFromStorage(): Promise<ErrorReport[]> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to load errors from storage:', error);
      return [];
    }
  }

  /**
   * Save error patterns to storage
   */
  private async saveErrorPatterns(): Promise<void> {
    try {
      const patternsArray = Array.from(this.errorPatterns.values());
      await AsyncStorage.setItem(this.patternsKey, JSON.stringify(patternsArray));
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to save error patterns:', error);
    }
  }

  /**
   * Load error patterns from storage
   */
  private async loadErrorPatterns(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.patternsKey);
      if (stored) {
        const patterns: ErrorPattern[] = JSON.parse(stored);
        patterns.forEach(pattern => {
          this.errorPatterns.set(pattern.fingerprint, pattern);
        });
      }
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to load error patterns:', error);
    }
  }

  /**
   * Send errors to analytics service
   */
  private async sendToAnalytics(errors: ErrorReport[]): Promise<void> {
    try {
      // In a real app, this would send to services like:
      // - Firebase Crashlytics
      // - Sentry
      // - Bugsnag
      // - Custom analytics endpoint
      
      logger.info(`[ErrorReportingService] Would send ${errors.length} errors to analytics`, {
        module: 'ErrorReportingService',
      });
      
      // Example: await analytics.recordErrors(errors);
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to send errors to analytics:', error);
    }
  }

  /**
   * Get error metrics for monitoring
   */
  public async getErrorMetrics(): Promise<ErrorMetrics> {
    try {
      const allErrors = await this.loadErrorsFromStorage();
      const sessionErrors = allErrors.filter(e => e.sessionId === this.sessionId);
      const sessionDuration = Date.now() - this.sessionStartTime;
      
      // Calculate error rates
      const errorRate = (allErrors.length / (sessionDuration / 1000 / 60)) || 0; // errors per minute
      const crashRate = allErrors.filter(e => e.level === ErrorLevel.FATAL).length / allErrors.length || 0;
      
      // Group errors by type and level
      const errorsByType = allErrors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<ErrorType, number>);
      
      const errorsByLevel = allErrors.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      }, {} as Record<ErrorLevel, number>);
      
      // Get top errors by pattern
      const topErrors = Array.from(this.errorPatterns.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(pattern => ({
          fingerprint: pattern.fingerprint,
          count: pattern.count,
          lastSeen: pattern.lastSeen,
          message: pattern.message,
        }));
      
      return {
        totalErrors: allErrors.length,
        errorsByType,
        errorsByLevel,
        errorRate,
        crashRate,
        topErrors,
        sessionErrors: sessionErrors.length,
      };
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to get error metrics:', error);
      return {
        totalErrors: 0,
        errorsByType: {} as Record<ErrorType, number>,
        errorsByLevel: {} as Record<ErrorLevel, number>,
        errorRate: 0,
        crashRate: 0,
        topErrors: [],
        sessionErrors: 0,
      };
    }
  }

  /**
   * Clear all stored errors (for debugging)
   */
  public async clearErrors(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.patternsKey);
      this.errorQueue = [];
      this.errorPatterns.clear();
      
      logger.info('[ErrorReportingService] All errors cleared', {
        module: 'ErrorReportingService',
      });
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to clear errors:', error);
    }
  }

  /**
   * Export errors for debugging
   */
  public async exportErrors(): Promise<ErrorReport[]> {
    try {
      return await this.loadErrorsFromStorage();
    } catch (error) {
      logger.error('[ErrorReportingService] Failed to export errors:', error);
      return [];
    }
  }

  /**
   * Get service status
   */
  public getStatus(): {
    isInitialized: boolean;
    sessionId: string;
    queueSize: number;
    patternsCount: number;
    sessionStartTime: number;
  } {
    return {
      isInitialized: this.isInitialized,
      sessionId: this.sessionId,
      queueSize: this.errorQueue.length,
      patternsCount: this.errorPatterns.size,
      sessionStartTime: this.sessionStartTime,
    };
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

export const errorReportingService = new ErrorReportingService();

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Report an error quickly
 */
export const reportError = (
  error: Error | string,
  level?: ErrorLevel,
  context?: Record<string, any>
) => {
  return errorReportingService.reportError({
    error,
    level,
    context,
  });
};

/**
 * Report a fatal error
 */
export const reportFatalError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  return errorReportingService.reportError({
    error,
    level: ErrorLevel.FATAL,
    context,
    tags: ['fatal'],
  });
};

/**
 * Report a warning
 */
export const reportWarning = (
  error: Error | string,
  context?: Record<string, any>
) => {
  return errorReportingService.reportError({
    error,
    level: ErrorLevel.WARNING,
    context,
    tags: ['warning'],
  });
};

// ========================================
// EXPORTS
// ========================================

export default errorReportingService;