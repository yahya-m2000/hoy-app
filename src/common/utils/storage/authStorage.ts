/**
 * Authentication storage utilities
 * Provides helper functions for token management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

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
