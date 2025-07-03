/**
 * Enhanced Circuit Breaker Pattern Implementation
 * 
 * Implements a three-state circuit breaker with:
 * - CLOSED: Normal operation
 * - OPEN: Failing fast, blocking requests  
 * - HALF_OPEN: Gradual recovery testing
 * 
 * Features:
 * - Configurable thresholds per endpoint
 * - Metrics reporting and alerting
 * - Gradual recovery with test requests
 * - Exponential backoff
 * - Health monitoring
 * 
 * @module @core/api/circuit-breaker
 * @author Hoy Development Team
 * @version 2.0.0 - Enhanced Three-State Implementation
 */

import { logger } from '@core/utils/sys/log';
import { eventEmitter, AppEvents } from '@core/utils/sys/event-emitter';

// ========================================
// CIRCUIT BREAKER TYPES & ENUMS
// ========================================

/**
 * Circuit breaker states
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

/**
 * Circuit breaker configuration for an endpoint
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;        // Failures needed to open circuit
  recoveryTimeout: number;         // Time before attempting recovery (ms)
  successThreshold: number;        // Successes needed in half-open to close
  testRequestInterval: number;     // Interval between test requests in half-open (ms)
  maxConsecutiveFailures: number;  // Max failures before permanent circuit open
  alertThreshold: number;          // Failures before sending alerts
}

/**
 * Circuit breaker metrics for an endpoint
 */
export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  lastStateChange: number;
  totalRequests: number;
  blockedRequests: number;
  testRequests: number;
  recoveryAttempts: number;
  alertsSent: number;
}

/**
 * Circuit breaker instance for an endpoint
 */
class CircuitBreakerInstance {
  private config: CircuitBreakerConfig;
  private metrics: CircuitBreakerMetrics;
  private endpoint: string;
  private lastTestRequest: number = 0;

  constructor(endpoint: string, config: CircuitBreakerConfig) {
    this.endpoint = endpoint;
    this.config = config;
    this.metrics = {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
      successCount: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      lastStateChange: Date.now(),
      totalRequests: 0,
      blockedRequests: 0,
      testRequests: 0,
      recoveryAttempts: 0,
      alertsSent: 0,
    };
  }

  /**
   * Check if request should be allowed through circuit breaker
   */
  public shouldAllowRequest(): boolean {
    const now = Date.now();
    this.metrics.totalRequests++;

    switch (this.metrics.state) {
      case CircuitBreakerState.CLOSED:
        return true;

      case CircuitBreakerState.OPEN:
        // Check if recovery timeout has passed
        if (now - this.metrics.lastStateChange >= this.config.recoveryTimeout) {
          this.transitionToHalfOpen();
          return this.shouldAllowTestRequest(now);
        }
        this.metrics.blockedRequests++;
        return false;

      case CircuitBreakerState.HALF_OPEN:
        return this.shouldAllowTestRequest(now);

      default:
        return false;
    }
  }

  /**
   * Record successful request
   */
  public recordSuccess(): void {
    const now = Date.now();
    this.metrics.successCount++;
    this.metrics.consecutiveSuccesses++;
    this.metrics.consecutiveFailures = 0;
    this.metrics.lastSuccessTime = now;

    switch (this.metrics.state) {
      case CircuitBreakerState.HALF_OPEN:
        if (this.metrics.consecutiveSuccesses >= this.config.successThreshold) {
          this.transitionToClosed();
        }
        break;

      case CircuitBreakerState.CLOSED:
        // Already closed, just update metrics
        break;
    }

    this.logMetrics('success');
  }

  /**
   * Record failed request
   */
  public recordFailure(): void {
    const now = Date.now();
    this.metrics.failureCount++;
    this.metrics.consecutiveFailures++;
    this.metrics.consecutiveSuccesses = 0;
    this.metrics.lastFailureTime = now;

    // Send alert if threshold reached
    if (this.metrics.consecutiveFailures === this.config.alertThreshold) {
      this.sendAlert('failure_threshold_reached');
    }

    switch (this.metrics.state) {
      case CircuitBreakerState.CLOSED:
        if (this.metrics.consecutiveFailures >= this.config.failureThreshold) {
          this.transitionToOpen();
        }
        break;

      case CircuitBreakerState.HALF_OPEN:
        this.transitionToOpen();
        break;
    }

    this.logMetrics('failure');
  }

  /**
   * Get current metrics
   */
  public getMetrics(): CircuitBreakerMetrics & { endpoint: string } {
    return {
      ...this.metrics,
      endpoint: this.endpoint,
    };
  }

  /**
   * Reset circuit breaker state
   */
  public reset(): void {
    logger.warn(`Circuit breaker reset for ${this.endpoint}`, undefined, {
      module: 'CircuitBreaker'
    });

    this.metrics = {
      ...this.metrics,
      state: CircuitBreakerState.CLOSED,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastStateChange: Date.now(),
    };
  }

  /**
   * Check if test request should be allowed in half-open state
   */
  private shouldAllowTestRequest(now: number): boolean {
    if (now - this.lastTestRequest >= this.config.testRequestInterval) {
      this.lastTestRequest = now;
      this.metrics.testRequests++;
      return true;
    }
    this.metrics.blockedRequests++;
    return false;
  }

  /**
   * Transition to CLOSED state
   */
  private transitionToClosed(): void {
    logger.info(`Circuit breaker CLOSED for ${this.endpoint} after successful recovery`, {
      consecutiveSuccesses: this.metrics.consecutiveSuccesses,
      recoveryAttempts: this.metrics.recoveryAttempts,
    }, {
      module: 'CircuitBreaker'
    });

    this.metrics.state = CircuitBreakerState.CLOSED;
    this.metrics.lastStateChange = Date.now();
    this.metrics.consecutiveFailures = 0;
    
    this.sendAlert('circuit_closed');
    eventEmitter.emit(AppEvents.CIRCUIT_BREAKER_CLOSED, {
      endpoint: this.endpoint,
      metrics: this.getMetrics(),
    });
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(): void {
    logger.error(`Circuit breaker OPEN for ${this.endpoint}`, {
      consecutiveFailures: this.metrics.consecutiveFailures,
      failureThreshold: this.config.failureThreshold,
    }, {
      module: 'CircuitBreaker'
    });

    this.metrics.state = CircuitBreakerState.OPEN;
    this.metrics.lastStateChange = Date.now();
    
    this.sendAlert('circuit_opened');
    eventEmitter.emit(AppEvents.CIRCUIT_BREAKER_OPENED, {
      endpoint: this.endpoint,
      metrics: this.getMetrics(),
    });
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    logger.warn(`Circuit breaker HALF_OPEN for ${this.endpoint} - testing recovery`, {
      recoveryTimeout: this.config.recoveryTimeout,
      recoveryAttempts: this.metrics.recoveryAttempts + 1,
    }, {
      module: 'CircuitBreaker'
    });

    this.metrics.state = CircuitBreakerState.HALF_OPEN;
    this.metrics.lastStateChange = Date.now();
    this.metrics.recoveryAttempts++;
    this.metrics.consecutiveSuccesses = 0;
    
    eventEmitter.emit(AppEvents.CIRCUIT_BREAKER_HALF_OPEN, {
      endpoint: this.endpoint,
      metrics: this.getMetrics(),
    });
  }

  /**
   * Send alert for circuit breaker events
   */
  private sendAlert(type: 'failure_threshold_reached' | 'circuit_opened' | 'circuit_closed'): void {
    this.metrics.alertsSent++;
    
    const alertData = {
      type,
      endpoint: this.endpoint,
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString(),
    };

    logger.error(`🚨 Circuit Breaker Alert: ${type}`, alertData, {
      module: 'CircuitBreaker'
    });

    // Emit event for external alerting systems
    eventEmitter.emit(AppEvents.CIRCUIT_BREAKER_ALERT, alertData);
  }

  /**
   * Log metrics for monitoring
   */
  private logMetrics(event: 'success' | 'failure'): void {
    if (__DEV__) {
      logger.debug(`Circuit breaker ${event} for ${this.endpoint}`, {
        state: this.metrics.state,
        consecutiveFailures: this.metrics.consecutiveFailures,
        consecutiveSuccesses: this.metrics.consecutiveSuccesses,
        totalRequests: this.metrics.totalRequests,
        blockedRequests: this.metrics.blockedRequests,
      }, {
        module: 'CircuitBreaker'
      });
    }
  }
}

// ========================================
// CIRCUIT BREAKER CONFIGURATIONS
// ========================================

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,        // 1 minute
  successThreshold: 3,
  testRequestInterval: 10000,    // 10 seconds
  maxConsecutiveFailures: 20,
  alertThreshold: 3,
};

/**
 * Endpoint-specific configurations
 */
const ENDPOINT_CONFIGS: Record<string, Partial<CircuitBreakerConfig>> = {
  // Authentication endpoints - more lenient
  '/auth/login': {
    failureThreshold: 8,
    recoveryTimeout: 30000,      // 30 seconds
    alertThreshold: 5,
  },
  '/auth/register': {
    failureThreshold: 8,
    recoveryTimeout: 30000,
    alertThreshold: 5,
  },
  '/auth/refresh-token': {
    failureThreshold: 10,
    recoveryTimeout: 15000,      // 15 seconds
    alertThreshold: 6,
  },
  
  // User endpoints - very lenient for auth-related failures
  '/users/me': {
    failureThreshold: 15,        // Allow many failures before opening
    recoveryTimeout: 15000,      // Quick recovery - 15 seconds
    alertThreshold: 10,
    successThreshold: 2,         // Only need 2 successes to close
  },
  
  // Critical endpoints - stricter
  '/payments': {
    failureThreshold: 3,
    recoveryTimeout: 120000,     // 2 minutes
    successThreshold: 5,
    alertThreshold: 2,
  },
  '/bookings': {
    failureThreshold: 4,
    recoveryTimeout: 90000,      // 1.5 minutes
    alertThreshold: 2,
  },
  
  // Search endpoints - more tolerant
  '/search': {
    failureThreshold: 10,
    recoveryTimeout: 45000,      // 45 seconds
    testRequestInterval: 5000,   // 5 seconds
    alertThreshold: 8,
  },
  
  // Upload endpoints - very tolerant
  '/upload': {
    failureThreshold: 15,
    recoveryTimeout: 30000,
    testRequestInterval: 5000,
    alertThreshold: 10,
  },

  // Host property management - allow more retries and faster recovery
  '/host/properties': {
    failureThreshold: 12,        // Allow up to 12 failures before opening
    recoveryTimeout: 20000,      // 20 s before attempting recovery
    successThreshold: 2,         // Only need 2 consecutive successes to close
    testRequestInterval: 4000,   // 4 s between test requests while half-open
    alertThreshold: 8,           // Send alert after 8 failures
  },
};

// ========================================
// CIRCUIT BREAKER MANAGER
// ========================================

/**
 * Global circuit breaker instances
 */
const circuitBreakers = new Map<string, CircuitBreakerInstance>();

/**
 * Get or create circuit breaker for endpoint
 */
function getCircuitBreaker(endpoint: string): CircuitBreakerInstance {
  if (!circuitBreakers.has(endpoint)) {
    const endpointConfig = ENDPOINT_CONFIGS[endpoint] || {};
    const config = { ...DEFAULT_CONFIG, ...endpointConfig };
    circuitBreakers.set(endpoint, new CircuitBreakerInstance(endpoint, config));
  }
  return circuitBreakers.get(endpoint)!;
}

/**
 * Extract endpoint path from URL for configuration matching
 */
function extractEndpointPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    // If not a full URL, assume it's already a path
    return url.split('?')[0]; // Remove query parameters
  }
}

// ========================================
// PUBLIC API
// ========================================

/**
 * Check if circuit breaker should allow request
 */
export const shouldAllowRequest = (url: string): boolean => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = getCircuitBreaker(endpoint);
  return circuitBreaker.shouldAllowRequest();
};

/**
 * Record successful request
 */
export const recordSuccess = (url: string): void => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = getCircuitBreaker(endpoint);
  circuitBreaker.recordSuccess();
};

/**
 * Record failed request
 */
export const recordFailure = (url: string): void => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = getCircuitBreaker(endpoint);
  circuitBreaker.recordFailure();
};

/**
 * Get circuit breaker state for endpoint
 */
export const getCircuitBreakerState = (url: string): CircuitBreakerState => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = getCircuitBreaker(endpoint);
  return circuitBreaker.getMetrics().state;
};

/**
 * Get comprehensive metrics for all circuit breakers
 */
export const getAllCircuitBreakerMetrics = (): Array<CircuitBreakerMetrics & { endpoint: string }> => {
  const metrics: Array<CircuitBreakerMetrics & { endpoint: string }> = [];
  
  circuitBreakers.forEach((circuitBreaker) => {
    metrics.push(circuitBreaker.getMetrics());
  });
  
  return metrics;
};

/**
 * Get metrics for specific endpoint
 */
export const getCircuitBreakerMetrics = (url: string): (CircuitBreakerMetrics & { endpoint: string }) | null => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = circuitBreakers.get(endpoint);
  return circuitBreaker ? circuitBreaker.getMetrics() : null;
};

/**
 * Reset circuit breaker for endpoint
 */
export const resetCircuitBreaker = (url: string): void => {
  const endpoint = extractEndpointPath(url);
  const circuitBreaker = circuitBreakers.get(endpoint);
  if (circuitBreaker) {
    circuitBreaker.reset();
  }
};

/**
 * Reset all circuit breakers
 */
export const resetAllCircuitBreakers = (): void => {
  logger.warn('Resetting all circuit breakers', undefined, {
    module: 'CircuitBreaker'
  });
  
  circuitBreakers.forEach((circuitBreaker) => {
    circuitBreaker.reset();
  });
};

/**
 * Clear circuit breaker state for authentication endpoints
 */
export const clearAuthEndpointFailures = (): void => {
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/forgot-password', '/auth/reset-password'];
  
  authEndpoints.forEach((endpoint) => {
    const circuitBreaker = circuitBreakers.get(endpoint);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  });
  
  logger.info('Cleared circuit breaker state for auth endpoints', undefined, {
    module: 'CircuitBreaker'
  });
};

/**
 * Get circuit breaker health summary
 */
export const getCircuitBreakerHealth = (): {
  healthy: number;
  degraded: number;
  failed: number;
  total: number;
  healthScore: number;
} => {
  let healthy = 0;
  let degraded = 0;
  let failed = 0;
  
  circuitBreakers.forEach((circuitBreaker) => {
    const metrics = circuitBreaker.getMetrics();
    switch (metrics.state) {
      case CircuitBreakerState.CLOSED:
        healthy++;
        break;
      case CircuitBreakerState.HALF_OPEN:
        degraded++;
        break;
      case CircuitBreakerState.OPEN:
        failed++;
        break;
    }
  });
  
  const total = circuitBreakers.size;
  const healthScore = total > 0 ? (healthy / total) * 100 : 100;
  
  return {
    healthy,
    degraded,
    failed,
    total,
    healthScore: Math.round(healthScore * 100) / 100,
  };
};

// ========================================
// LEGACY COMPATIBILITY
// ========================================

/**
 * @deprecated Use shouldAllowRequest instead
 */
export const isCircuitBreakerOpen = (url: string): boolean => {
  logger.warn('isCircuitBreakerOpen is deprecated. Use shouldAllowRequest instead', undefined, {
    module: 'CircuitBreaker'
  });
  return !shouldAllowRequest(url);
};

/**
 * @deprecated Use recordFailure instead
 */
export const recordEndpointFailure = (url: string): void => {
  logger.warn('recordEndpointFailure is deprecated. Use recordFailure instead', undefined, {
    module: 'CircuitBreaker'
  });
  recordFailure(url);
};

/**
 * @deprecated Use recordSuccess instead
 */
export const recordEndpointSuccess = (url: string): void => {
  logger.warn('recordEndpointSuccess is deprecated. Use recordSuccess instead', undefined, {
    module: 'CircuitBreaker'
  });
  recordSuccess(url);
};

/**
 * @deprecated Use getAllCircuitBreakerMetrics instead
 */
export const getCircuitBreakerStats = (): Record<string, any> => {
  logger.warn('getCircuitBreakerStats is deprecated. Use getAllCircuitBreakerMetrics instead', undefined, {
    module: 'CircuitBreaker'
  });
  
  const stats: Record<string, any> = {};
  const metrics = getAllCircuitBreakerMetrics();
  
  metrics.forEach((metric) => {
    stats[metric.endpoint] = {
      count: metric.failureCount,
      lastFailure: metric.lastFailureTime,
    };
  });
  
  return stats;
}; 