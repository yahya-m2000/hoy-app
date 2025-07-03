/**
 * Authentication Manager
 * 
 * Central authentication management including:
 * - Token validation and refresh
 * - Authentication state tracking
 * - Automatic token renewal
 * - Debug utilities for development
 * 
 * @module @core/api/auth-manager
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getTokenFromStorage,
  getRefreshTokenFromStorage,
  saveTokenToStorage,
  saveRefreshTokenToStorage,
  clearTokensFromStorage,
  markTokensAsInvalid,
  clearTokenInvalidation,
} from "../auth/storage";
import { logger } from "@core/utils/sys/log/logger";
import {
  validateTokenFromCache,
  isTokenExpiredCached,
  getTokenExpirationTimeCached,
  cacheTokenExpiry,
  clearTokenCache,
  getCacheStats,
  initializeTokenCache,
  type TokenValidationResult,
} from "./token-cache";
import { isTokenExpiredSync, getTokenExpirationTimeSync } from "./token-utils";

// Lazy import to avoid circular dependencies
let AuthService: any;
const getAuthService = async () => {
  if (!AuthService) {
    const module = await import("./services/auth");
    AuthService = module.AuthService;
  }
  return AuthService;
};

// ========================================
// TOKEN VALIDATION
// ========================================

// ========================================
// ENHANCED TOKEN VALIDATION WITH CACHING
// ========================================

/**
 * Check if JWT token is expired (with caching for performance)
 * @param token JWT token to validate
 * @param tokenType Type of token (access or refresh)
 * @param useCache Whether to use cached validation (default: true)
 */
export const isTokenExpired = async (
  token: string, 
  tokenType: 'access' | 'refresh' = 'access',
  useCache: boolean = true
): Promise<boolean> => {
  if (useCache) {
    // Use fast cached validation
    return await isTokenExpiredCached(token, tokenType);
  }
  
  // Fallback to legacy synchronous validation
  return isTokenExpiredSync(token);
};

/**
 * Get token expiration time (with caching for performance)
 * @param token JWT token to analyze
 * @param tokenType Type of token (access or refresh)
 * @param useCache Whether to use cached validation (default: true)
 */
export const getTokenExpirationTime = async (
  token: string, 
  tokenType: 'access' | 'refresh' = 'access',
  useCache: boolean = true
): Promise<number | null> => {
  if (useCache) {
    // Use fast cached validation
    return await getTokenExpirationTimeCached(token, tokenType);
  }
  
  // Fallback to legacy synchronous validation
  return getTokenExpirationTimeSync(token);
};

/**
 * Validate token with detailed information (cached)
 */
export const validateToken = async (
  token: string, 
  tokenType: 'access' | 'refresh' = 'access'
): Promise<TokenValidationResult> => {
  return await validateTokenFromCache(token, tokenType);
};

// ========================================
// AUTHENTICATION MANAGEMENT
// ========================================

/**
 * Get valid access token, refreshing if necessary
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  try {
    const accessToken = await getTokenFromStorage();
    
    if (!accessToken) {
      logger.debug("No access token found", undefined, {
        module: "AuthManager"
      });
      return null;
    }

    // Check if token is still valid (using cached validation)
    const isExpired = await isTokenExpired(accessToken, 'access');
    if (!isExpired) {
      logger.debug("Access token is still valid", undefined, {
        module: "AuthManager"
      });
      return accessToken;
    }

    logger.debug("Access token expired, attempting refresh", undefined, {
      module: "AuthManager"
    });

    const refreshToken = await getRefreshTokenFromStorage();
    if (!refreshToken) {
      logger.debug("No refresh token available", undefined, {
        module: "AuthManager"
      });
      return null;
    }

    // Check if refresh token is also expired (using cached validation)
    const isRefreshExpired = await isTokenExpired(refreshToken, 'refresh');
    if (isRefreshExpired) {
      logger.debug("Refresh token also expired", undefined, {
        module: "AuthManager"
      });
      await clearAuthenticationData();
      return null;
    }

    // Attempt to refresh the token
    const newTokens = await refreshAccessToken();
    return newTokens;
  } catch (error) {
    logger.error("Error getting valid access token", error, {
      module: "AuthManager"
    });
    return null;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshTokenFromStorage();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    logger.debug("Refreshing access token", undefined, {
      module: "AuthManager"
    });

    // Call the auth service to refresh token (lazy-loaded to avoid circular deps)
    const authService = await getAuthService();
    const response = await authService.refreshTokens(refreshToken);

    // Save new tokens
    await saveTokenToStorage(response.accessToken);
    if (response.refreshToken) {
      await saveRefreshTokenToStorage(response.refreshToken);
    }

    // Clear any stale token invalidation flags (tokens are now valid)
    await clearTokenInvalidation();

    // Cache token expiry information for fast validation
    await Promise.all([
      cacheTokenExpiry(response.accessToken, 'access'),
      response.refreshToken ? cacheTokenExpiry(response.refreshToken, 'refresh') : Promise.resolve()
    ]);

    logger.debug("Token refresh successful", undefined, {
      module: "AuthManager"
    });

    return response.accessToken;
  } catch (error: any) {
    logger.error("Token refresh failed", error, {
      module: "AuthManager"
    });
    
    // Only clear authentication data if the refresh token is actually invalid
    // (401/403 errors indicate invalid credentials, other errors might be network issues)
    const shouldClearAuth = error?.response?.status === 401 || 
                           error?.response?.status === 403 ||
                           error?.message?.includes('invalid') ||
                           error?.message?.includes('expired') ||
                           error?.message?.includes('revoked');
    
    if (shouldClearAuth) {
      logger.debug("Refresh token is invalid, clearing authentication data", undefined, {
        module: "AuthManager"
      });
      await clearAuthenticationData();
    } else {
      logger.debug("Token refresh failed due to network/server issue, keeping tokens", undefined, {
        module: "AuthManager"
      });
    }
    
    throw error;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthenticationData = async (): Promise<void> => {
  try {
    await Promise.all([
      clearTokensFromStorage(),
      markTokensAsInvalid(),
      AsyncStorage.removeItem("currentUserId"),
      clearTokenCache(), // Clear cached token expiry information
    ]);
    logger.debug("Authentication data cleared", undefined, {
      module: "AuthManager"
    });
  } catch (error) {
    logger.error("Error clearing authentication data", error, {
      module: "AuthManager"
    });
  }
};

// ========================================
// CACHE MANAGEMENT & PERFORMANCE
// ========================================

/**
 * Initialize authentication system with token caching
 */
export const initializeAuthManager = async (): Promise<void> => {
  try {
    await initializeTokenCache();
    
    // Cache existing tokens if they exist
    const [accessToken, refreshToken] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage()
    ]);

    const cachePromises = [];
    if (accessToken) {
      cachePromises.push(cacheTokenExpiry(accessToken, 'access'));
    }
    if (refreshToken) {
      cachePromises.push(cacheTokenExpiry(refreshToken, 'refresh'));
    }

    if (cachePromises.length > 0) {
      await Promise.all(cachePromises);
      logger.debug("Existing tokens cached for fast validation", undefined, {
        module: "AuthManager"
      });
    }

    logger.info("Authentication manager initialized with token caching", undefined, {
      module: "AuthManager"
    });
  } catch (error) {
    logger.error("Failed to initialize authentication manager", error, {
      module: "AuthManager"
    });
  }
};

/**
 * Get authentication performance statistics
 */
export const getAuthPerformanceStats = async (): Promise<{
  cacheStats: any;
  hasValidAuth: boolean;
  authCheckMethod: string;
  performanceGain?: string;
}> => {
  try {
    const startTime = Date.now();
    
    // Get cache statistics
    const cacheStats = await getCacheStats();
    
    // Check authentication status
    const hasValidAuth = await getValidAccessToken();
    const authCheckTime = Date.now() - startTime;
    
    // Estimate performance gain
    const estimatedDecodeTime = 15; // Typical JWT decode time in ms
    const actualTime = authCheckTime;
    const performanceGain = cacheStats.accessTokenCached 
      ? `${Math.round(((estimatedDecodeTime - actualTime) / estimatedDecodeTime) * 100)}% faster`
      : 'No cache benefit (first check)';

    return {
      cacheStats,
      hasValidAuth: !!hasValidAuth,
      authCheckMethod: cacheStats.accessTokenCached ? 'cached' : 'decoded',
      performanceGain,
    };
  } catch (error) {
    logger.error("Failed to get auth performance stats", error, {
      module: "AuthManager"
    });
    return {
      cacheStats: { accessTokenCached: false, refreshTokenCached: false },
      hasValidAuth: false,
      authCheckMethod: 'error',
    };
  }
};

/**
 * Manually refresh token cache (for debugging/testing)
 */
export const refreshTokenCache = async (): Promise<boolean> => {
  try {
    await clearTokenCache();
    
    const [accessToken, refreshToken] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage()
    ]);

    const cachePromises = [];
    if (accessToken) {
      cachePromises.push(cacheTokenExpiry(accessToken, 'access'));
    }
    if (refreshToken) {
      cachePromises.push(cacheTokenExpiry(refreshToken, 'refresh'));
    }

    if (cachePromises.length > 0) {
      await Promise.all(cachePromises);
      logger.debug("Token cache refreshed", undefined, {
        module: "AuthManager"
      });
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Failed to refresh token cache", error, {
      module: "AuthManager"
    });
    return false;
  }
};

// ========================================
// RE-EXPORT TOKEN UTILITIES
// ========================================

// Re-export for backward compatibility
export { isTokenExpiredSync, getTokenExpirationTimeSync } from "./token-utils";

// ========================================
// DEBUG UTILITIES (DEVELOPMENT ONLY)
// ========================================

/**
 * Debug token refresh flow (development only)
 */
export const debugTokenRefreshFlow = async (): Promise<void> => {
  if (!logger.isEnabled) {
    return;
  }

  try {
    logger.debug("VALIDATING TOKEN REFRESH FLOW", undefined, {
      module: "AuthManager"
    });

    const accessToken = await getTokenFromStorage();
    const refreshToken = await getRefreshTokenFromStorage();

    logger.debug("Current token status", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    }, { module: "AuthManager" });

    if (accessToken) {
      const [isExpired, expiresAt] = await Promise.all([
        isTokenExpired(accessToken, 'access'),
        getTokenExpirationTime(accessToken, 'access')
      ]);
      logger.debug("Access token validation", {
        isExpired,
        expiresAt,
      }, { module: "AuthManager" });
    }

    if (refreshToken) {
      const [isExpired, expiresAt] = await Promise.all([
        isTokenExpired(refreshToken, 'refresh'),
        getTokenExpirationTime(refreshToken, 'refresh')
      ]);
      logger.debug("Refresh token validation", {
        isExpired,
        expiresAt,
      }, { module: "AuthManager" });
    }

    const hasValidAuth = await getValidAccessToken();
    logger.debug("Overall authentication status", {
      isValid: !!hasValidAuth,
    }, { module: "AuthManager" });
  } catch (error) {
    logger.error("Error in token refresh flow debug", error, {
      module: "AuthManager"
    });
  }
}; 

