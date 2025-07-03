/**
 * Authentication Debug Utilities
 * 
 * Debug utilities for authentication state with secure token access
 * 
 * @module @core/auth/debug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTokenFromStorage, getRefreshTokenFromStorage } from "./storage";
import { logger } from "../utils/sys/log";

/**
 * Get current authentication debug info
 * Uses secure storage instead of direct AsyncStorage access
 */
export const getAuthDebugInfo = async () => {
  try {
    // Use secure storage functions instead of direct AsyncStorage access
    const [accessToken, refreshToken, userId, isBlacklisted, invalidatedAt] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage(),
      AsyncStorage.getItem("currentUserId"),
      AsyncStorage.getItem("tokenBlacklisted"),
      AsyncStorage.getItem("tokenInvalidatedAt"),
    ]);

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      userId,
      isBlacklisted: isBlacklisted === "true",
      invalidatedAt: invalidatedAt ? new Date(parseInt(invalidatedAt)) : null,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error("Failed to get auth debug info", error, {
      module: "AuthDebug"
    });
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      accessTokenLength: 0,
      refreshTokenLength: 0,
      userId: null,
      isBlacklisted: false,
      invalidatedAt: null,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Debug utility to check token storage securely
 * @deprecated Use getAuthDebugInfo() instead for secure debugging
 */
export const debugTokenStorage = async (): Promise<void> => {
  try {
    logger.warn("debugTokenStorage is deprecated. Use getAuthDebugInfo() for secure debugging", undefined, {
      module: "AuthDebug"
    });
    
    const debugInfo = await getAuthDebugInfo();
    
    logger.debug("🔍 === SECURE TOKEN STORAGE DEBUG ===", undefined, {
      module: "AuthDebug"
    });
    logger.debug("🔑 Access Token:", debugInfo.hasAccessToken ? "Present" : "Missing", {
      module: "AuthDebug"
    });
    logger.debug("🔄 Refresh Token:", debugInfo.hasRefreshToken ? "Present" : "Missing", {
      module: "AuthDebug"
    });
    logger.debug("👤 User ID:", debugInfo.userId ? "Present" : "Missing", {
      module: "AuthDebug"
    });
    logger.debug("❌ Blacklisted:", debugInfo.isBlacklisted ? "Yes" : "No", {
      module: "AuthDebug"
    });
    logger.debug("⏰ Invalidated At:", debugInfo.invalidatedAt || "None", {
      module: "AuthDebug"
    });
    logger.debug("🔍 === END SECURE DEBUG ===", undefined, {
      module: "AuthDebug"
    });
  } catch (error) {
    logger.error("❌ Debug token storage error:", error, {
      module: "AuthDebug"
    });
  }
}; 