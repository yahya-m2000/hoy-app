/**
 * Token debug utility
 * This module provides functions for debugging token issues in React Native
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { eventEmitter, AppEvents } from "./eventEmitter";

/**
 * Gets the current auth tokens and displays them
 * Only use this for development/debugging
 */
export const debugTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem("accessToken"),
      AsyncStorage.getItem("refreshToken"),
    ]);

    console.log("===== AUTH TOKEN DEBUG INFO =====");
    console.log("Platform:", Platform.OS);
    console.log(
      "Access Token:",
      accessToken ? `${accessToken.substring(0, 15)}...` : "null"
    );
    console.log(
      "Refresh Token:",
      refreshToken ? `${refreshToken.substring(0, 15)}...` : "null"
    );

    if (Platform.OS !== "web" && __DEV__) {
      Alert.alert(
        "Token Debug Info",
        `Access token: ${accessToken ? "Present" : "Missing"}\nRefresh token: ${
          refreshToken ? "Present" : "Missing"
        }`
      );
    }

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error debugging tokens:", error);
    return { accessToken: null, refreshToken: null };
  }
};

/**
 * Simulates a token expiration to test the refresh flow
 */
export const simulateTokenExpiration = async (): Promise<void> => {
  try {
    // Save the current token for restoring later if needed
    // const currentToken = await AsyncStorage.getItem("accessToken");

    // Set a clearly invalid token
    await AsyncStorage.setItem("accessToken", "EXPIRED_TOKEN_FOR_TESTING");

    console.log(
      "Token expiration simulated. The next API request should trigger a refresh."
    );

    if (Platform.OS !== "web" && __DEV__) {
      Alert.alert(
        "Token Expiration Simulated",
        "The next API request should trigger a refresh. Check console for details."
      );
    }

    return;
  } catch (error) {
    console.error("Error simulating token expiration:", error);
  }
};

/**
 * Force logout by clearing tokens and emitting logout event
 * Useful for testing token-related issues
 */
export const forceLogout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    eventEmitter.emit(AppEvents.AUTH_LOGOUT);

    console.log("Forced logout completed. All tokens cleared.");

    if (Platform.OS !== "web" && __DEV__) {
      Alert.alert("Forced Logout", "All tokens have been cleared.");
    }

    return;
  } catch (error) {
    console.error("Error during forced logout:", error);
  }
};
