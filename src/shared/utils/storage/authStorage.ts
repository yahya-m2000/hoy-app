/**
 * Authentication storage utilities
 * Provides helper functions for token management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Global callback for auth state changes
let authStateChangeCallback: ((isAuthenticated: boolean) => void) | null = null;

/**
 * Set callback to be called when authentication state changes
 */
export const setAuthStateChangeCallback = (
  callback: (isAuthenticated: boolean) => void
) => {
  authStateChangeCallback = callback;
};

/**
 * Notify about authentication state change
 */
const notifyAuthStateChange = (isAuthenticated: boolean) => {
  if (authStateChangeCallback) {
    authStateChangeCallback(isAuthenticated);
  }
};

/**
 * Check if user is authenticated by verifying the presence of valid tokens
 * @returns Promise<boolean> True if user has valid authentication tokens
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    // User is considered authenticated if they have either an access token or refresh token
    // The API service will handle token refresh if needed
    return !!(accessToken || refreshToken);
  } catch (error) {
    console.error("Error checking authentication state:", error);
    return false;
  }
};

/**
 * Enhanced authentication check that validates token integrity
 * @returns Promise<boolean> True if user has valid, non-blacklisted tokens
 */
export const hasValidAuthentication = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const userId = await AsyncStorage.getItem("currentUserId");

    // If no tokens, definitely not authenticated
    if (!accessToken && !refreshToken) {
      console.log("No tokens found - not authenticated");
      console.log(accessToken, refreshToken, userId);
      return false;
    }

    // If no user ID, try to get user info with tokens (tokens might be valid)
    if (!userId) {
      console.warn(
        "⚠️ User ID missing but tokens exist - allowing API calls to potentially refresh user info"
      );
    }

    // Only check blacklist flag - remove time-based invalidation that might be too strict
    const isBlacklisted = await AsyncStorage.getItem("tokenBlacklisted");
    if (isBlacklisted === "true") {
      console.log("Tokens are blacklisted - not authenticated");
      return false;
    }

    // Clear any stale invalidation flags that might be blocking valid tokens
    const tokenInvalidatedAt = await AsyncStorage.getItem("tokenInvalidatedAt");
    if (tokenInvalidatedAt) {
      console.log("Clearing stale token invalidation flag");
      await AsyncStorage.removeItem("tokenInvalidatedAt");
    }

    console.log("Valid authentication found");
    return true;
  } catch (error) {
    console.error("Error checking valid authentication:", error);
    return false;
  }
};

/**
 * Mark tokens as invalid/blacklisted (called after logout or auth failure)
 */
export const markTokensAsInvalid = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem("tokenInvalidatedAt", Date.now().toString());
    await AsyncStorage.setItem("tokenBlacklisted", "true");
    console.log("Tokens marked as invalid");
    notifyAuthStateChange(false);
  } catch (error) {
    console.error("Error marking tokens as invalid:", error);
  }
};

/**
 * Clear token invalidation flags (called after successful login)
 */
export const clearTokenInvalidation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("tokenInvalidatedAt");
    await AsyncStorage.removeItem("tokenBlacklisted");
    console.log("Auth state cleared");
    notifyAuthStateChange(true);
  } catch (error) {
    console.error("Error clearing token invalidation:", error);
  }
};

/**
 * Get access token from storage
 * @returns The access token string or null if not found
 */
export const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    // Add debug logging but only if token is missing
    if (!token) {
      console.error("Access token not found in storage!");

      // Try to check if we have a refresh token
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (refreshToken) {
        console.warn("Refresh token exists, but access token is missing.");
        // We could potentially trigger a token refresh here in the future
      } else {
        console.error(
          "Neither access token nor refresh token found - user needs to login."
        );
      }
    }

    return token;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    return null;
  }
};

/**
 * Get refresh token from storage
 * @returns The refresh token string or null if not found
 */
export const getRefreshTokenFromStorage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

/**
 * Save access token to storage
 * @param token The access token to save
 */
export const saveTokenToStorage = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("accessToken", token);
  } catch (error) {
    console.error("Error saving access token:", error);
  }
};

/**
 * Save refresh token to storage
 * @param token The refresh token to save
 */
export const saveRefreshTokenToStorage = async (
  token: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem("refreshToken", token);
  } catch (error) {
    console.error("Error saving refresh token:", error);
  }
};

/**
 * Clear all authentication tokens from storage
 */
export const clearTokensFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};
