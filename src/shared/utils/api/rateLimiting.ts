/**
 * Rate limiting mechanism for chat API calls
 * Tracks the last time each endpoint was called to prevent excessive polling
 */
import * as safeLogger from "../log/safeLogger";
import Constants from "expo-constants";

// Track the last time each endpoint was called
const lastApiCallTime: Record<string, number> = {};

// Cache for API responses by endpoint
const apiCache: Record<string, any> = {};

// Default rate limiting parameters - can be adjusted dynamically
const RATE_LIMITS: Record<string, number> = {
  "/chat": 15000, // 15 seconds for conversations
  "/chat/unread/count": 30000, // 30 seconds for unread count
  default: 5000, // 5 seconds default for other endpoints
};

// Success and error counts to implement adaptive rate limiting
const apiCallStats: Record<
  string,
  {
    successes: number;
    errors: number;
    consecutiveErrors: number;
    lastErrorTime: number;
  }
> = {};

// Get minimum API call interval from config
const getMinApiCallInterval = (): number => {
  const config = Constants.expoConfig?.extra || {};
  return config.minApiCallInterval || 10000; // Default: 10 seconds
};

// Exponential backoff when errors occur
const getBackoffInterval = (
  consecutiveErrors: number,
  baseInterval: number
): number => {
  if (consecutiveErrors <= 1) return baseInterval;

  // Apply exponential backoff with a maximum of 5 minutes
  const maxBackoff = 5 * 60 * 1000; // 5 minutes
  const backoff = baseInterval * Math.pow(1.5, consecutiveErrors - 1);
  return Math.min(backoff, maxBackoff);
};

/**
 * Checks if an API endpoint is being called too frequently
 * and should be rate limited
 *
 * @param endpoint The API endpoint path
 * @returns True if the call should be allowed, false if it should be rate limited
 */
export const shouldAllowApiCall = (endpoint: string): boolean => {
  const now = Date.now();
  const lastCallTime = lastApiCallTime[endpoint] || 0;

  // Get the appropriate rate limit for this endpoint
  let rateLimit = RATE_LIMITS[endpoint] || RATE_LIMITS.default;

  // Apply minimum API call interval as a lower bound
  const minInterval = getMinApiCallInterval();
  rateLimit = Math.max(rateLimit, minInterval);

  // Apply backoff if there are consecutive errors
  if (apiCallStats[endpoint]?.consecutiveErrors > 0) {
    rateLimit = getBackoffInterval(
      apiCallStats[endpoint].consecutiveErrors,
      rateLimit
    );
  }

  // Allow call if enough time has passed since the last call
  if (now - lastCallTime >= rateLimit) {
    lastApiCallTime[endpoint] = now;
    return true;
  }

  // Rate limit this call
  safeLogger.warn(
    `Rate limiting API call to ${endpoint} - next allowed in ${Math.ceil(
      (rateLimit - (now - lastCallTime)) / 1000
    )}s`
  );
  return false;
};

/**
 * Cache the response data for an endpoint
 *
 * @param endpoint The API endpoint path
 * @param data The data to cache
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

  safeLogger.debug(`Cached API response for ${endpoint}`);
};

/**
 * Track API call error
 *
 * @param endpoint The API endpoint path
 * @param error The error object
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

  // If we're getting a lot of errors, increase the rate limit
  if (stats.consecutiveErrors > 2 && endpoint in RATE_LIMITS) {
    // Increase rate limit by 50% but cap at 2 minutes
    RATE_LIMITS[endpoint] = Math.min(RATE_LIMITS[endpoint] * 1.5, 120000);
    safeLogger.warn(
      `Increased rate limit for ${endpoint} to ${
        RATE_LIMITS[endpoint] / 1000
      }s due to errors`
    );
  }

  // Log the error
  safeLogger.error(
    `API call to ${endpoint} failed (attempt ${stats.consecutiveErrors}):`,
    error?.message || error
  );
};

/**
 * Get cached data for an endpoint if available
 *
 * @param endpoint The API endpoint path
 * @returns The cached data or null if no cache exists
 */
export const getCachedApiResponse = (endpoint: string): any => {
  const cache = apiCache[endpoint];
  if (!cache) return null;

  // Get cache expiration from config or use default (10x the rate limit)
  const config = Constants.expoConfig?.extra || {};
  const cacheMaxAge = config.offlineCacheMaxAge || 86400000; // Default: 24 hours
  const expiry = Math.min(
    RATE_LIMITS[endpoint] ? RATE_LIMITS[endpoint] * 10 : 300000, // 10x rate limit or 5 minutes
    cacheMaxAge // But no more than configured max age
  );

  // Return null if cache is expired
  if (Date.now() - cache.timestamp > expiry) {
    safeLogger.debug(`Cache expired for ${endpoint}`);
    return null;
  }

  safeLogger.info(`Using cached data for ${endpoint}`);
  return cache.data;
};

/**
 * Reset rate limits to default values
 * Useful when network conditions improve
 */
export const resetRateLimits = (): void => {
  RATE_LIMITS["/chat"] = 15000;
  RATE_LIMITS["/chat/unread/count"] = 30000;
  RATE_LIMITS["default"] = 5000;
  safeLogger.info("Rate limits reset to default values");
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = (): void => {
  const config = Constants.expoConfig?.extra || {};
  const cacheMaxAge = config.offlineCacheMaxAge || 86400000; // Default: 24 hours

  const now = Date.now();
  let cleanedCount = 0;

  Object.keys(apiCache).forEach((endpoint) => {
    if (now - apiCache[endpoint].timestamp > cacheMaxAge) {
      delete apiCache[endpoint];
      cleanedCount++;
    }
  });

  if (cleanedCount > 0) {
    safeLogger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
  }
};

// Automatically clean up expired cache every hour
setInterval(cleanupExpiredCache, 3600000);
