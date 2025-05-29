/**
 * Utility functions for handling API rate limiting
 */

// Constants for rate limiting
export const RATE_LIMIT = {
  MIN_INTERVAL: 10000, // 10 seconds between identical requests
  MAX_REQUESTS_PER_MINUTE: 10, // Maximum number of requests per minute
  BACKOFF_INITIAL: 5000, // Initial backoff time after rate limit hit
  BACKOFF_MAX: 60000, // Maximum backoff time (1 minute)
};

/**
 * Checks if a request should be throttled based on time since last request
 * @param lastRequestTime Timestamp of the last request
 * @param minInterval Minimum interval between requests in ms
 * @returns Boolean indicating if the request should be throttled
 */
export const shouldThrottleRequest = (
  lastRequestTime: number,
  minInterval: number = RATE_LIMIT.MIN_INTERVAL
): boolean => {
  const now = Date.now();
  return now - lastRequestTime < minInterval;
};

/**
 * Implements exponential backoff strategy for failed API requests
 * @param currentBackoff Current backoff time in ms
 * @param maxBackoff Maximum backoff time in ms
 * @returns New backoff time in ms
 */
export const calculateBackoff = (
  currentBackoff: number = RATE_LIMIT.BACKOFF_INITIAL,
  maxBackoff: number = RATE_LIMIT.BACKOFF_MAX
): number => {
  // Implement exponential backoff with jitter
  const jitter = Math.random() * 0.3 + 0.85; // Random value between 0.85 and 1.15
  return Math.min(currentBackoff * 2 * jitter, maxBackoff);
};

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
   * @returns Updated count
   */
  increment(): number {
    const now = Date.now();

    // Reset counter if window has expired
    if (now > this.resetTime) {
      this.count = 0;
      this.resetTime = now + this.windowDuration;
    }

    // Increment the counter
    this.count += 1;
    return this.count;
  }

  /**
   * Checks if rate limit is exceeded for current window
   * @param maxRequests Maximum allowed requests in the window
   * @returns Boolean indicating if rate limit is exceeded
   */
  isLimitExceeded(
    maxRequests: number = RATE_LIMIT.MAX_REQUESTS_PER_MINUTE
  ): boolean {
    // Check if window has expired first
    const now = Date.now();
    if (now > this.resetTime) {
      this.count = 0;
      this.resetTime = now + this.windowDuration;
      return false;
    }

    return this.count >= maxRequests;
  }
}

// Global singleton rate limit counter for property searches
let propertySearchCounter: RateLimitCounter | null = null;

/**
 * Gets a global rate limit counter for property searches
 */
export const getPropertySearchRateLimiter = (): RateLimitCounter => {
  if (!propertySearchCounter) {
    propertySearchCounter = new RateLimitCounter();
  }
  return propertySearchCounter;
};
