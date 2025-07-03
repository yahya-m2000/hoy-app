/**
 * API Throttling Utilities
 *
 * Provides mechanisms for rate limiting API requests to avoid
 * hitting server-side limits or overwhelming the API.
 * 
 * @module @core/utils/api/throttling
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { ThrottleStore } from '@core/types/api.types';

// Re-export for backward compatibility
export { ThrottleStore };

const throttleStore: ThrottleStore = {};

/**
 * Check if an API endpoint call should be throttled
 * @param endpoint API endpoint to check
 * @param minInterval Minimum interval between calls in milliseconds
 * @returns Whether the call should be throttled
 */
export const shouldThrottle = (
  endpoint: string,
  minInterval: number = 1000
): boolean => {
  const now = Date.now();
  const stored = throttleStore[endpoint];

  // If no previous call, allow this one
  if (!stored) {
    throttleStore[endpoint] = {
      lastCallTime: now,
      minInterval,
    };
    return false;
  }

  // Check if enough time has passed
  const timeSinceLastCall = now - stored.lastCallTime;
  if (timeSinceLastCall < stored.minInterval) {
    return true;
  }

  // Update last call time
  throttleStore[endpoint].lastCallTime = now;
  return false;
};

/**
 * Reset throttling for a specific endpoint
 * @param endpoint API endpoint to reset
 */
export const resetThrottle = (endpoint: string): void => {
  delete throttleStore[endpoint];
};

/**
 * Clear all throttling data
 */
export const clearAllThrottles = (): void => {
  Object.keys(throttleStore).forEach((key) => {
    delete throttleStore[key];
  });
};

/**
 * Get remaining time before an endpoint can be called again
 * @param endpoint API endpoint to check
 * @returns Milliseconds until endpoint can be called again, or 0 if not throttled
 */
export const getThrottleWaitTime = (endpoint: string): number => {
  const now = Date.now();
  const stored = throttleStore[endpoint];

  if (!stored) {
    return 0;
  }

  const timeSinceLastCall = now - stored.lastCallTime;
  const remainingTime = stored.minInterval - timeSinceLastCall;

  return Math.max(0, remainingTime);
};

/**
 * Wrap a function with throttling
 * @param fn Function to throttle
 * @param key Unique key for this function (default: function name)
 * @param interval Minimum interval between calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  key?: string,
  interval: number = 1000
): (...args: Parameters<T>) => ReturnType<T> | null {
  const throttleKey = key || fn.name || "anonymous";

  return (...args: Parameters<T>): ReturnType<T> | null => {
    if (shouldThrottle(throttleKey, interval)) {
      console.warn(`Function call throttled: ${throttleKey}`);
      return null;
    }

    return fn(...args);
  };
} 