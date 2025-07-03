/**
 * Token Utilities
 * 
 * Standalone token utility functions to avoid circular dependencies
 * 
 * @module @core/api/token-utils
 */

import { logger } from "@core/utils/sys/log/logger";

/**
 * Check if JWT token is expired (synchronous)
 * @param token JWT token to validate
 */
export const isTokenExpiredSync = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    logger.warn("Error parsing token for expiration check", error, {
      module: "TokenUtils"
    });
    return true; // Assume expired if can't parse
  }
};

/**
 * Get token expiration time (synchronous)
 * @param token JWT token to analyze
 */
export const getTokenExpirationTimeSync = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    logger.warn("Error parsing token for expiration time", error, {
      module: "TokenUtils"
    });
    return null;
  }
};

/**
 * Parse JWT token payload
 * @param token JWT token to parse
 */
export const parseTokenPayload = (token: string): any | null => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    logger.warn("Error parsing token payload", error, {
      module: "TokenUtils"
    });
    return null;
  }
};

/**
 * Get user ID from token
 * @param token JWT token
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = parseTokenPayload(token);
    return payload?.sub || payload?.userId || payload?.id || null;
  } catch (error) {
    logger.warn("Error extracting user ID from token", error, {
      module: "TokenUtils"
    });
    return null;
  }
}; 