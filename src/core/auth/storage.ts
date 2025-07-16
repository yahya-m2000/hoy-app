/**
 * Authentication Storage
 * 
 * Secure token and authentication state management including:
 * - Token storage and retrieval
 * - Authentication validation
 * - Token blacklisting
 * - State change callbacks
 * 
 * @module @core/auth/storage
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

import { logger } from "../utils/sys/log";

// ========================================
// STORAGE KEYS
// ========================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_ID: "currentUserId",
  TOKEN_BLACKLISTED: "tokenBlacklisted",
  TOKEN_INVALIDATED_AT: "tokenInvalidatedAt",
} as const;

// ========================================
// STATE MANAGEMENT
// ========================================

type AuthStateChangeCallback = (isAuthenticated: boolean) => void;
let authStateChangeCallback: AuthStateChangeCallback | null = null;

/**
 * Set callback for auth state changes
 */
export const setAuthStateChangeCallback = (
  callback: AuthStateChangeCallback
): (() => void) => {
  authStateChangeCallback = callback;
  return () => {
    authStateChangeCallback = null;
  };
};

/**
 * Notify auth state change
 */
const notifyAuthStateChange = (isAuthenticated: boolean) => {
  if (authStateChangeCallback) {
    authStateChangeCallback(isAuthenticated);
  }
};

// ========================================
// TOKEN STORAGE
// ========================================

/**
 * Save access token to secure storage
 */
export const saveTokenToStorage = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    logger.debug("Access token saved to secure storage", undefined, {
      module: "AuthStorage"
    });
  } catch (error) {
    logger.error("Failed to save access token", error, {
      module: "AuthStorage"
    });
    throw error;
  }
};

/**
 * Save refresh token to secure storage
 */
export const saveRefreshTokenToStorage = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    logger.debug("Refresh token saved to secure storage", undefined, {
      module: "AuthStorage"
    });
  } catch (error) {
    logger.error("Failed to save refresh token", error, {
      module: "AuthStorage"
    });
    throw error;
  }
};

/**
 * Get access token from secure storage
 */
export const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    logger.error("Failed to get access token", error, {
      module: "AuthStorage"
    });
    return null;
  }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshTokenFromStorage = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    logger.error("Failed to get refresh token", error, {
      module: "AuthStorage"
    });
    return null;
  }
};

// ========================================
// AUTHENTICATION VALIDATION
// ========================================

/**
 * Check if user is currently authenticated
 * Alias for hasValidAuthentication for backward compatibility
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return hasValidAuthentication();
};

// Add helper to check JWT expiration
interface JwtPayload { exp?: number; [key: string]: any }

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000; // seconds
    return decoded.exp < now;
  } catch {
    // If decode fails, treat as expired
    return true;
  }
};

/**
 * Check if user has valid authentication
 */
export const hasValidAuthentication = async (): Promise<boolean> => {
  try {
    const [accessToken, refreshToken, userId] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage(),
      safeGetItem(AsyncStorage, STORAGE_KEYS.USER_ID),
    ]);

    // Check if tokens exist
    if (!accessToken || !refreshToken || !userId) {
      logger.debug("Authentication validation failed: missing tokens or user ID", undefined, {
        module: "AuthStorage"
      });
      return false;
    }

    // Check if tokens are blacklisted
    const isBlacklisted = await safeGetItem(AsyncStorage, STORAGE_KEYS.TOKEN_BLACKLISTED);
    if (isBlacklisted === "true") {
      // Double-check if tokens themselves are still valid; if so, the blacklist flag may be stale
      const accessExpired = isTokenExpired(accessToken);
      const refreshExpired = isTokenExpired(refreshToken);
      if (!accessExpired && !refreshExpired) {
        logger.debug("Stale token blacklist detected – clearing flags", undefined, { module: "AuthStorage" });
        await clearTokenInvalidation();
      } else {
        logger.debug("Authentication validation failed: tokens are blacklisted", undefined, {
          module: "AuthStorage"
        });
        return false;
      }
    }

    // Check token invalidation timestamp
    const invalidatedAt = await safeGetItem(AsyncStorage, STORAGE_KEYS.TOKEN_INVALIDATED_AT);
    if (invalidatedAt) {
      const invalidatedTime = parseInt(invalidatedAt, 10);
      const currentTime = Date.now();
      
      if (currentTime < invalidatedTime + 5000) { // 5 second grace period
        logger.debug("Clearing stale token invalidation flag", undefined, {
          module: "AuthStorage"
        });
        await safeRemoveItem(AsyncStorage, STORAGE_KEYS.TOKEN_INVALIDATED_AT);
      }
    }

    // Verify expiration
    if (isTokenExpired(accessToken) || isTokenExpired(refreshToken)) {
      logger.debug("Authentication validation failed: tokens are expired", undefined, {
        module: "AuthStorage"
      });
      return false;
    }

    logger.debug("Valid authentication found", undefined, {
      module: "AuthStorage"
    });
    return true;
  } catch (error) {
    logger.error("Error validating authentication", error, {
      module: "AuthStorage"
    });
    return false;
  }
};

// ========================================
// TOKEN INVALIDATION
// ========================================

/**
 * Mark tokens as invalid
 */
export const markTokensAsInvalid = async (): Promise<void> => {
  try {
    await safeSetItem(AsyncStorage, STORAGE_KEYS.TOKEN_BLACKLISTED, "true");
    await safeSetItem(
      AsyncStorage,
      STORAGE_KEYS.TOKEN_INVALIDATED_AT,
      Date.now().toString()
    );
    logger.debug("Tokens marked as invalid", undefined, {
      module: "AuthStorage"
    });
    notifyAuthStateChange(false);
  } catch (error) {
    logger.error("Failed to mark tokens as invalid", error, {
      module: "AuthStorage"
    });
  }
};

/**
 * Clear token invalidation flags
 */
export const clearTokenInvalidation = async (): Promise<void> => {
  try {
    await Promise.all([
      safeRemoveItem(AsyncStorage, STORAGE_KEYS.TOKEN_BLACKLISTED),
      safeRemoveItem(AsyncStorage, STORAGE_KEYS.TOKEN_INVALIDATED_AT),
    ]);
    logger.debug("Token invalidation flags cleared", undefined, {
      module: "AuthStorage"
    });
  } catch (error) {
    logger.error("Failed to clear token invalidation", error, {
      module: "AuthStorage"
    });
  }
};

// ========================================
// TOKEN CLEANUP
// ========================================

/**
 * Clear all tokens from storage
 */
export const clearTokensFromStorage = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {}),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {}),
      safeRemoveItem(AsyncStorage, STORAGE_KEYS.USER_ID),
      safeRemoveItem(AsyncStorage, STORAGE_KEYS.TOKEN_BLACKLISTED),
      safeRemoveItem(AsyncStorage, STORAGE_KEYS.TOKEN_INVALIDATED_AT),
    ]);
    
    logger.debug("Auth state cleared", undefined, {
      module: "AuthStorage"
    });
    notifyAuthStateChange(false);
  } catch (error) {
    logger.error("Failed to clear auth state", error, {
      module: "AuthStorage"
    });
  }
};

// Helper functions for safe AsyncStorage usage
const safeGetItem = async (storage: typeof AsyncStorage, key: string): Promise<string | null> => {
  if (storage && typeof storage.getItem === 'function') {
    return await storage.getItem(key);
  }
  return null;
};
const safeSetItem = async (storage: typeof AsyncStorage, key: string, value: string): Promise<void> => {
  if (storage && typeof storage.setItem === 'function') {
    await storage.setItem(key, value);
  }
};
const safeRemoveItem = async (storage: typeof AsyncStorage, key: string): Promise<void> => {
  if (storage && typeof storage.removeItem === 'function') {
    await storage.removeItem(key);
  }
};
