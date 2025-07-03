/**
 * Debug utility to check token storage
 *
 * @module @core/auth/debug-tokens
 * @author Hoy Development Team
 * @version 1.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTokenFromStorage, getRefreshTokenFromStorage } from "./storage";
import { logger } from "../utils/sys/log";

/**
 * Get token debug information securely
 * Uses SecureStore instead of direct AsyncStorage access
 */
export const getTokenDebugInfo = async () => {
  try {
    // Use secure storage functions instead of direct AsyncStorage
    const [accessToken, refreshToken, userId, isBlacklisted, invalidatedAt] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage(),
      AsyncStorage.getItem("currentUserId"),
      AsyncStorage.getItem("tokenBlacklisted"),
      AsyncStorage.getItem("tokenInvalidatedAt"),
    ]);

    // Don't log actual token values for security
    const debugInfo = {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + "..." : null,
      refreshTokenPrefix: refreshToken ? refreshToken.substring(0, 10) + "..." : null,
      userId,
      isBlacklisted: isBlacklisted === "true",
      invalidatedAt: invalidatedAt ? new Date(parseInt(invalidatedAt)) : null,
      timestamp: new Date(),
    };

    logger.debug("Token debug info retrieved", debugInfo, {
      module: "TokenDebug"
    });

    return debugInfo;
  } catch (error) {
    logger.error("Failed to get token debug info", error, {
      module: "TokenDebug"
    });
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      accessTokenLength: 0,
      refreshTokenLength: 0,
      accessTokenPrefix: null,
      refreshTokenPrefix: null,
      userId: null,
      isBlacklisted: false,
      invalidatedAt: null,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Clear all token debug data securely
 * @deprecated Use clearAllAuthData from token-debug instead for secure clearing
 */
export const clearAllTokenDebugData = async (): Promise<void> => {
  try {
    logger.warn("clearAllTokenDebugData is deprecated. Use clearAllAuthData for secure token clearing", undefined, {
      module: "TokenDebug"
    });
    
    // Only clear non-sensitive metadata, not actual tokens
    await AsyncStorage.multiRemove([
      "currentUserId",
      "tokenBlacklisted", 
      "tokenInvalidatedAt",
    ]);
    
    logger.debug("Token debug metadata cleared (tokens remain secure)", undefined, {
      module: "TokenDebug"
    });
  } catch (error) {
    logger.error("Error clearing debug metadata", error, {
      module: "TokenDebug"
    });
  }
};
