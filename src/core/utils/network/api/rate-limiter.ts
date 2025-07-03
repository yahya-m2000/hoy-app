/**
 * Comprehensive Rate Limiting Utilities
 * 
 * Provides advanced rate limiting, throttling, and backoff mechanisms
 * for API requests with caching and adaptive error handling.
 * 
 * @module @core/utils/api/rate-limiting
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { logger } from "@core/utils/sys/log";
import Constants from "expo-constants";

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

/** Default rate limiting parameters */
export const RATE_LIMITS = {
  "/chat": 15000, // 15 seconds for conversations
  "/chat/unread/count": 30000, // 30 seconds for unread count
  default: 5000, // 5 seconds default for other endpoints
} as Record<string, number>;

/** Rate limiting configuration constants */
export const RATE_LIMIT_CONFIG = {
  MIN_INTERVAL: 10000, // 10 seconds between identical requests
  MAX_REQUESTS_PER_MINUTE: 10, // Maximum number of requests per minute
  BACKOFF_INITIAL: 5000, // Initial backoff time after rate limit hit
  BACKOFF_MAX: 60000, // Maximum backoff time (1 minute)
  CACHE_MAX_AGE: 86400000, // 24 hours
};

// ========================================
// INTERNAL STATE TRACKING
// ========================================

/** Track the last time each endpoint was called */
const lastApiCallTime: Record<string, number> = {};

/** Cache for API responses by endpoint */
const apiCache: Record<string, { data: any; timestamp: number }> = {};

/** Success and error counts for adaptive rate limiting */
const apiCallStats: Record<string, {
  successes: number;
  errors: number;
  consecutiveErrors: number;
  lastErrorTime: number;
}> = {};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get minimum API call interval from configuration
 */
const getMinApiCallInterval = (): number => {
  const config = Constants.expoConfig?.extra || {};
  return config.minApiCallInterval || RATE_LIMIT_CONFIG.MIN_INTERVAL;
};

/**
 * Calculate exponential backoff interval when errors occur
 */
const getBackoffInterval = (consecutiveErrors: number, baseInterval: number): number => {
  if (consecutiveErrors <= 1) return baseInterval;

  // Apply exponential backoff with maximum limit
  const backoff = baseInterval * Math.pow(1.5, consecutiveErrors - 1);
  return Math.min(backoff, RATE_LIMIT_CONFIG.BACKOFF_MAX);
};

/**
 * Implements exponential backoff strategy with jitter
 */
export const calculateBackoff = (
  currentBackoff: number = RATE_LIMIT_CONFIG.BACKOFF_INITIAL,
  maxBackoff: number = RATE_LIMIT_CONFIG.BACKOFF_MAX
): number => {
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
  return Math.min(currentBackoff * 2 * jitter, maxBackoff);
};

/**
 * Check if a request should be throttled based on time since last request
 */
export const shouldThrottleRequest = (
  lastRequestTime: number,
  minInterval: number = RATE_LIMIT_CONFIG.MIN_INTERVAL
): boolean => {
  const now = Date.now();
  return now - lastRequestTime < minInterval;
};

// ========================================
// RATE LIMIT COUNTER CLASS
// ========================================

/**
 * Manages a rate limit counter for a specific time window
 */
export class RateLimitCounter {
  count: number;
  resetTime: number;
  windowDuration: number;

  constructor(windowDuration: number = 60000) {
    this.count = 0;
    this.resetTime = Date.now() + windowDuration;
    this.windowDuration = windowDuration;
  }

  /**
   * Increments the counter if within window, or resets if window expired
   */
  increment(): number {
    const now = Date.now();

    // Reset counter if window has expired
    if (now > this.resetTime) {
      this.count = 0;
      this.resetTime = now + this.windowDuration;
    }

    this.count += 1;
    return this.count;
  }

  /**
   * Checks if rate limit is exceeded for current window
   */
  isLimitExceeded(maxRequests: number = RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_MINUTE): boolean {
    const now = Date.now();
    
    // Reset if window expired
    if (now > this.resetTime) {
      this.count = 0;
      this.resetTime = now + this.windowDuration;
      return false;
    }

    return this.count >= maxRequests;
  }
}

// ========================================
// MAIN RATE LIMITING FUNCTIONS
// ========================================

/**
 * Check if an API endpoint call should be allowed (not rate limited)
 */
export const shouldAllowApiCall = (endpoint: string): boolean => {
  const now = Date.now();
  const lastCallTime = lastApiCallTime[endpoint] || 0;

  // Get appropriate rate limit for this endpoint
  let rateLimit = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  
  // Apply minimum interval as lower bound
  const minInterval = getMinApiCallInterval();
  rateLimit = Math.max(rateLimit, minInterval);

  // Apply backoff if there are consecutive errors
  if (apiCallStats[endpoint]?.consecutiveErrors > 0) {
    rateLimit = getBackoffInterval(
      apiCallStats[endpoint].consecutiveErrors,
      rateLimit
    );
  }

  // Allow call if enough time has passed
  if (now - lastCallTime >= rateLimit) {
    lastApiCallTime[endpoint] = now;
    return true;
  }

  // Rate limit this call
  logger.warn(
    `Rate limiting API call to ${endpoint} - next allowed in ${Math.ceil(
      (rateLimit - (now - lastCallTime)) / 1000
    )}s`
  );
  return false;
};

/**
 * Cache API response data for an endpoint
 */
export const cacheApiResponse = (endpoint: string, data: any): void => {
  apiCache[endpoint] = {
    data,
    timestamp: Date.now(),
  };

  // Track successful API call
  if (!apiCallStats[endpoint]) {
    apiCallStats[endpoint] = {
      successes: 0,
      errors: 0,
      consecutiveErrors: 0,
      lastErrorTime: 0,
    };
  }

  apiCallStats[endpoint].successes++;
  // Reset consecutive errors on successful calls
  apiCallStats[endpoint].consecutiveErrors = 0;

  logger.debug(`Cached API response for ${endpoint}`);
};

/**
 * Track API call error and update statistics
 */
export const trackApiError = (endpoint: string, error: any): void => {
  if (!apiCallStats[endpoint]) {
    apiCallStats[endpoint] = {
      successes: 0,
      errors: 0,
      consecutiveErrors: 0,
      lastErrorTime: Date.now(),
    };
  }

  const stats = apiCallStats[endpoint];
  stats.errors++;
  stats.consecutiveErrors++;
  stats.lastErrorTime = Date.now();

  // Increase rate limit for endpoints with many errors
  if (stats.consecutiveErrors > 2 && endpoint in RATE_LIMITS) {
    RATE_LIMITS[endpoint] = Math.min(RATE_LIMITS[endpoint] * 1.5, 120000);
    logger.warn(
      `Increased rate limit for ${endpoint} to ${RATE_LIMITS[endpoint] / 1000}s due to errors`
    );
  }

  logger.error(
    `API call to ${endpoint} failed (attempt ${stats.consecutiveErrors}):`,
    error?.message || error
  );
};

/**
 * Get cached data for an endpoint if available and not expired
 */
export const getCachedApiResponse = (endpoint: string): any => {
  const cache = apiCache[endpoint];
  if (!cache) return null;

  // Calculate cache expiration
  const config = Constants.expoConfig?.extra || {};
  const cacheMaxAge = config.offlineCacheMaxAge || RATE_LIMIT_CONFIG.CACHE_MAX_AGE;
  const expiry = Math.min(
    RATE_LIMITS[endpoint] ? RATE_LIMITS[endpoint] * 10 : 300000,
    cacheMaxAge
  );

  // Return null if cache is expired
  if (Date.now() - cache.timestamp > expiry) {
    logger.debug(`Cache expired for ${endpoint}`);
    return null;
  }

  logger.info(`Using cached data for ${endpoint}`);
  return cache.data;
};

/**
 * Reset rate limits to default values
 */
export const resetRateLimits = (): void => {
  RATE_LIMITS["/chat"] = 15000;
  RATE_LIMITS["/chat/unread/count"] = 30000;
  RATE_LIMITS["default"] = 5000;
  logger.info("Rate limits reset to default values");
};

/**
 * Clean up expired cache entries to free memory
 */
export const cleanupExpiredCache = (): void => {
  const now = Date.now();
  const maxAge = RATE_LIMIT_CONFIG.CACHE_MAX_AGE;

  Object.keys(apiCache).forEach(endpoint => {
    if (now - apiCache[endpoint].timestamp > maxAge) {
      delete apiCache[endpoint];
      logger.debug(`Cleaned up expired cache for ${endpoint}`);
    }
  });
};

// ========================================
// GLOBAL RATE LIMITERS
// ========================================

/** Global singleton rate limit counter for property searches */
let propertySearchCounter: RateLimitCounter | null = null;

/**
 * Get a global rate limit counter for property searches
 */
export const getPropertySearchRateLimiter = (): RateLimitCounter => {
  if (!propertySearchCounter) {
    propertySearchCounter = new RateLimitCounter();
  }
  return propertySearchCounter;
};

// ========================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ========================================

/** @deprecated Use shouldAllowApiCall instead */
export const shouldAllowRequest = shouldAllowApiCall;

/** @deprecated Use RATE_LIMIT_CONFIG instead */
export const RATE_LIMIT = RATE_LIMIT_CONFIG; 