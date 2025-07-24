/**
 * Data Purge Utilities
 * 
 * Secure data cleanup utilities with proper token handling
 * 
 * @module @core/utils/storage/data-purge
 */

import { Platform } from 'react-native';
let SecureStore: typeof import('expo-secure-store') | undefined;
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | undefined;
if (Platform.OS !== 'web' && typeof navigator !== 'undefined') {
  SecureStore = require('expo-secure-store');
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}
import { getTokenFromStorage } from "../../auth/storage";
import { logger } from "../sys/log";

import { api } from "../../api/client";

// ========================================
// STORAGE KEYS
// ========================================

const CRITICAL_AUTH_KEYS = [
  "accessToken",
  "refreshToken",
  "currentUserId",
  "tokenBlacklisted",
  "tokenInvalidatedAt",
] as const;

// ========================================
// SECURE DATA PURGE UTILITIES
// ========================================

/**
 * Check if user has active authentication before purging
 * Uses secure storage instead of direct AsyncStorage access
 */
const checkAuthenticationStatus = async (): Promise<boolean> => {
  try {
    // Use secure storage function instead of direct AsyncStorage
    const remainingToken = await getTokenFromStorage();
    return !!remainingToken;
  } catch (error) {
    logger.error("Failed to check authentication status", error, {
      module: "DataPurge"
    });
    return false;
  }
};

/**
 * Purge non-essential data while preserving authentication
 */
export const purgeNonEssentialData = async (): Promise<void> => {
  try {
    logger.debug("Starting non-essential data purge", undefined, {
      module: "DataPurge"
    });

    // Check if user is still authenticated
    const isAuthenticated = await checkAuthenticationStatus();
    
    if (!isAuthenticated) {
      logger.warn("User not authenticated, skipping data purge", undefined, {
        module: "DataPurge"
      });
      return;
    }

    // List of non-essential keys to purge (excluding auth tokens)
    const nonEssentialKeys = [
      "search_cache",
      "property_cache",
      "geocoding_cache",
      "temp_data",
      "ui_preferences",
      "analytics_buffer",
      "debug_logs",
    ];

    // Remove non-essential data
    if (AsyncStorage) await safeMultiRemove(AsyncStorage, nonEssentialKeys);

    logger.debug("Non-essential data purged successfully", {
      purgedKeys: nonEssentialKeys.length
    }, {
      module: "DataPurge"
    });
  } catch (error) {
    logger.error("Failed to purge non-essential data", error, {
      module: "DataPurge"
    });
    throw error;
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async () => {
  try {
    const keys = AsyncStorage ? await AsyncStorage.getAllKeys() : [];
    const isAuthenticated = await checkAuthenticationStatus();
    
    return {
      totalKeys: keys.length,
      isAuthenticated,
      hasSecureTokens: isAuthenticated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Failed to get storage stats", error, {
      module: "DataPurge"
    });
    return {
      totalKeys: 0,
      isAuthenticated: false,
      hasSecureTokens: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// ========================================
// DATA PURGE OPERATIONS
// ========================================

/**
 * Perform complete user data purge
 */
export const purgeUserData = async (): Promise<boolean> => {
  let success = false;

  try {
    logger.info("Starting full user data purge", undefined, {
      module: "DataPurge"
    });

    // Clear API authentication headers
    try {
      if (api.defaults.headers.common) {
        delete api.defaults.headers.common["Authorization"];
      }
      logger.debug("API auth headers cleared", undefined, {
        module: "DataPurge"
      });
    } catch (err) {
      logger.warn("Failed to clear API auth headers", err, {
        module: "DataPurge"
      });
    }

    // Get all AsyncStorage keys
    const allKeys = AsyncStorage ? await AsyncStorage.getAllKeys() : [];
    logger.debug("AsyncStorage keys found", { count: allKeys.length }, {
      module: "DataPurge"
    });

    // Filter keys to remove (exclude system keys)
    const keysToRemove = allKeys.filter((key) => {
      // Keep system keys and non-user data
      const systemKeys = [
        "@react-native-async-storage/",
        "RCTAsyncLocalStorage",
        "expo-",
        "ExponentDeviceInstallationUUID",
      ];

      return !systemKeys.some((systemKey) => key.startsWith(systemKey));
    });

    // Remove critical auth tokens individually for better error handling
    for (const key of CRITICAL_AUTH_KEYS) {
      try {
        if (AsyncStorage) await AsyncStorage.removeItem(key);
      } catch (err) {
        logger.warn("Failed to remove critical auth key", { key, error: err }, {
          module: "DataPurge"
        });
      }
    }

    logger.debug("Critical auth tokens removed individually", undefined, {
      module: "DataPurge"
    });

    // Remove remaining keys in batch
    try {
      if (AsyncStorage) await safeMultiRemove(AsyncStorage, keysToRemove);
      logger.debug("AsyncStorage keys removed", { count: keysToRemove.length }, {
        module: "DataPurge"
      });
    } catch (err) {
      logger.error("AsyncStorage purge failed", err, {
        module: "DataPurge"
      });
      
      // Try emergency clear if batch removal fails
      try {
        if (AsyncStorage) await AsyncStorage.clear();
        logger.warn("Emergency AsyncStorage clear executed", undefined, {
          module: "DataPurge"
        });
      } catch (clearErr) {
        logger.error("Emergency AsyncStorage clear failed", clearErr, {
          module: "DataPurge"
        });
      }
    }

    // Clear SecureStore
    try {
      for (const key of CRITICAL_AUTH_KEYS) {
        try {
          if (SecureStore) {
            await SecureStore.deleteItemAsync(key);
          }
        } catch (err) {
          // SecureStore might not have the key, which is fine
        }
      }
      logger.debug("Secure storage cleared", undefined, {
        module: "DataPurge"
      });
    } catch (err) {
      logger.warn("SecureStore purge failed (non-critical)", err, {
        module: "DataPurge"
      });
    }

    // Verify critical tokens are actually gone using secure storage
    try {
      const remainingToken = await getTokenFromStorage();
      if (remainingToken) {
        logger.error("CRITICAL FAILURE: Secure token still present after purge!", undefined, {
          module: "DataPurge"
        });
        // This should not happen with proper secure storage cleanup
        logger.warn("Secure tokens may not have been properly cleared", undefined, {
          module: "DataPurge"
        });
      }
    } catch (err) {
      logger.warn("Secure token verification after purge failed", err, {
        module: "DataPurge"
      });
    }

    success = true;
  } catch (error) {
    logger.error("CRITICAL ERROR during user data purge", error, {
      module: "DataPurge"
    });
  }

  logger.info("User data purge process completed", { success }, {
    module: "DataPurge"
  });

  return success;
};

// ========================================
// PURGE VERIFICATION
// ========================================

/**
 * Check if data purge was successful
 */
export const verifyPurgeSuccess = async (): Promise<boolean> => {
  try {
    // Check if critical auth tokens are gone
    for (const key of CRITICAL_AUTH_KEYS) {
      const value = AsyncStorage ? await AsyncStorage.getItem(key) : null;
      if (value) {
        logger.warn("Purge verification failed: token still present", { key }, {
          module: "DataPurge"
        });
        return false;
      }
    }

    return true;
  } catch (err) {
    logger.error("Error checking purge status", err, {
      module: "DataPurge"
    });
    return false;
  }
};

// Helper function to safely call multiRemove
const safeMultiRemove = async (storage: any, keys: string[]): Promise<void> => {
  if (storage && typeof storage.multiRemove === 'function') {
    await storage.multiRemove(keys);
  }
};
