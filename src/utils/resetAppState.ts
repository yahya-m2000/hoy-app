/**
 * Reset App State Utility
 *
 * This is a more extreme approach to clearing user data. It should
 * be used when regular logout doesn't work correctly or when there
 * appears to be data contamination between users.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearUserData } from "./clearUserData";
import { QueryClient } from "@tanstack/react-query";

// Reference to the global query client (will be set from app)
let _queryClient: QueryClient | null = null;

/**
 * Store the query client reference for later use
 */
export const setQueryClientRef = (queryClient: QueryClient) => {
  _queryClient = queryClient;
};

/**
 * Force a complete reset of the app state
 * This is much more thorough than a regular logout
 */
export const resetAppState = async (): Promise<void> => {
  try {
    console.log("🔄 EXECUTING EMERGENCY APP STATE RESET");

    // 1. Clear all user data with our enhanced utility
    await clearUserData();

    // 2. If we have access to query client, invalidate and remove all queries
    if (_queryClient) {
      try {
        _queryClient.clear();
        console.log("Query cache cleared");
      } catch (e) {
        console.error("Failed to clear query cache:", e);
      }
    }

    // 3. Clear ALL async storage (except critical app settings)
    try {
      const keys = await AsyncStorage.getAllKeys();
      const preserveKeys = ["language", "appVersion", "onboardingCompleted"];
      const keysToRemove = keys.filter((key) => !preserveKeys.includes(key));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Removed ${keysToRemove.length} keys from storage`);
      }
    } catch (e) {
      console.error("Failed to clear AsyncStorage:", e);
    }

    // 4. Set a flag so the app knows a reset happened
    await AsyncStorage.setItem("appStateReset", Date.now().toString());

    console.log("✅ APP STATE RESET COMPLETE");

    // Return true to indicate success
    return Promise.resolve();
  } catch (error) {
    console.error("❌ CRITICAL ERROR DURING APP STATE RESET:", error);
    return Promise.reject(error);
  }
};

/**
 * Check if app state was recently reset
 * Can be used to show a notification to the user
 */
export const wasAppStateReset = async (): Promise<boolean> => {
  try {
    const resetTime = await AsyncStorage.getItem("appStateReset");
    if (!resetTime) return false;

    const resetTimestamp = parseInt(resetTime, 10);
    const now = Date.now();

    // Check if reset happened in the last 5 minutes
    return now - resetTimestamp < 5 * 60 * 1000;
  } catch {
    return false;
  }
};
