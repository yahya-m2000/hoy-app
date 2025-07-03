/**
 * Token Debug Utilities
 * 
 * Advanced token debugging with secure storage access
 * 
 * @module @core/auth/token-debug
 * @author Hoy Development Team
 * @version 1.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { eventEmitter, AppEvents } from "../utils/sys/event-emitter";
import { logger } from "../utils/sys/log";
import { 
  getTokenFromStorage, 
  getRefreshTokenFromStorage,
  saveTokenToStorage,
  clearTokensFromStorage 
} from "./storage";

/**
 * Get comprehensive token debug information
 * Uses secure storage instead of direct AsyncStorage access
 */
export const getTokenDebugInfo = async () => {
  try {
    // Use secure storage functions instead of direct AsyncStorage
    const [accessToken, refreshToken, userId] = await Promise.all([
      getTokenFromStorage(),
      getRefreshTokenFromStorage(),
      AsyncStorage.getItem("currentUserId"),
    ]);

    const debugInfo = {
      tokens: {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        // Only show first/last few characters for security
        accessTokenPreview: accessToken ? 
          `${accessToken.substring(0, 8)}...${accessToken.substring(accessToken.length - 8)}` : null,
        refreshTokenPreview: refreshToken ? 
          `${refreshToken.substring(0, 8)}...${refreshToken.substring(refreshToken.length - 8)}` : null,
      },
      user: {
        userId,
        hasUserId: !!userId,
      },
      timestamp: new Date().toISOString(),
    };

    logger.debug("Token debug info generated", {
      hasAccessToken: debugInfo.tokens.hasAccessToken,
      hasRefreshToken: debugInfo.tokens.hasRefreshToken,
      hasUserId: debugInfo.user.hasUserId,
    }, {
      module: "TokenDebug"
    });

    return debugInfo;
  } catch (error) {
    logger.error("Failed to get token debug info", error, {
      module: "TokenDebug"
    });
    throw error;
  }
};

/**
 * Test token expiration by setting an invalid token
 * WARNING: This will invalidate current session
 */
export const testTokenExpiration = async (): Promise<void> => {
  try {
    logger.warn("Testing token expiration - this will invalidate current session", undefined, {
      module: "TokenDebug"
    });
    
    // Save an obviously invalid token for testing
    await saveTokenToStorage("EXPIRED_TOKEN_FOR_TESTING");
    
    logger.debug("Invalid token set for testing", undefined, {
      module: "TokenDebug"
    });
  } catch (error) {
    logger.error("Failed to set test token", error, {
      module: "TokenDebug"
    });
    throw error;
  }
};

/**
 * Clear all authentication data
 * WARNING: This will log out the user
 */
export const clearAllAuthData = async (): Promise<void> => {
  try {
    logger.warn("Clearing all authentication data", undefined, {
      module: "TokenDebug"
    });
    
    // Use secure storage function to clear tokens
    await clearTokensFromStorage();
    
    logger.debug("All authentication data cleared", undefined, {
      module: "TokenDebug"
    });
  } catch (error) {
    logger.error("Failed to clear auth data", error, {
      module: "TokenDebug"
    });
    throw error;
  }
};

/**
 * Validate token format and structure
 */
export const validateTokenFormat = async () => {
  try {
    const accessToken = await getTokenFromStorage();
    
    if (!accessToken) {
      return {
        isValid: false,
        reason: "No access token found",
      };
    }

    // Basic JWT format validation (3 parts separated by dots)
    const parts = accessToken.split('.');
    const isJWTFormat = parts.length === 3;
    
    // Check if it looks like a JWT
    const isValidJWT = isJWTFormat && parts.every(part => 
      /^[A-Za-z0-9_-]+$/.test(part)
    );

    return {
      isValid: isValidJWT,
      format: isJWTFormat ? 'JWT' : 'Unknown',
      parts: parts.length,
      reason: isValidJWT ? 'Valid JWT format' : 'Invalid token format',
    };
  } catch (error) {
    logger.error("Failed to validate token format", error, {
      module: "TokenDebug"
    });
    return {
      isValid: false,
      reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Simulates a token expiration to test the refresh flow
 * Uses secure storage instead of AsyncStorage
 */
export const simulateTokenExpiration = async (): Promise<void> => {
  try {
    // Set a clearly invalid token using secure storage
    await saveTokenToStorage("EXPIRED_TOKEN_FOR_TESTING");

    logger.warn("Token expiration simulated using secure storage. Next API request should trigger refresh.", undefined, {
      module: "TokenDebug"
    });

    if (Platform.OS !== "web" && __DEV__) {
      Alert.alert(
        "Token Expiration Simulated",
        "The next API request should trigger a refresh. Check logger for details."
      );
    }

    return;
  } catch (error) {
    logger.error("Error simulating token expiration", error, {
      module: "TokenDebug"
    });
  }
};

/**
 * Force logout by clearing tokens and emitting logout event
 * Uses secure storage instead of AsyncStorage
 */
export const forceLogout = async (): Promise<void> => {
  try {
    // Use secure storage function to clear tokens
    await clearTokensFromStorage();
    eventEmitter.emit(AppEvents.AUTH_LOGOUT);

    logger.warn("Forced logout completed. All tokens cleared from secure storage.", undefined, {
      module: "TokenDebug"
    });

    if (Platform.OS !== "web" && __DEV__) {
      Alert.alert("Forced Logout", "All tokens have been cleared from secure storage.");
    }

    return;
  } catch (error) {
    logger.error("Error during forced logout", error, {
      module: "TokenDebug"
    });
  }
};
