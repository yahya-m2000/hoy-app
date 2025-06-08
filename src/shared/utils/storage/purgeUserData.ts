/**
 * FullUserDataPurge
 *
 * A comprehensive utility that completely purges all user-related data
 * from the app. This is more thorough than the regular logout process
 * and should resolve any issues with data persisting between user accounts.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import api from "@shared/services/core/client";

/**
 * Completely purges all user data from the app's storage
 * This is the nuclear option for solving persistent user data issues
 */
export const purgeAllUserData = async (): Promise<boolean> => {
  console.log("🧨 STARTING FULL USER DATA PURGE");
  let success = true;

  try {
    // 1. Clear all auth headers
    if (api.defaults.headers.common) {
      delete api.defaults.headers.common["Authorization"];
      console.log("✅ API auth headers cleared");
    }

    // 2. Clear AsyncStorage (complete wipe except essential app settings)
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log(`Found ${allKeys.length} keys in AsyncStorage`);

      // Keys to preserve (app-level settings only)
      const preserveKeys = [
        "language",
        "appTheme",
        "onboardingComplete",
        "appVersion",
      ];

      // Keys to forcefully delete
      const criticalUserKeys = [
        "accessToken",
        "refreshToken",
        "user",
        "userId",
        "userEmail",
        "currentUserId",
        "session",
      ];

      // First remove critical keys one by one to ensure they're gone
      for (const key of criticalUserKeys) {
        await AsyncStorage.removeItem(key);
      }
      console.log("✅ Critical auth tokens removed individually");

      // Then remove all remaining keys except those to preserve
      const keysToRemove = allKeys.filter((k) => !preserveKeys.includes(k));
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ Removed ${keysToRemove.length} keys from AsyncStorage`);
      }
    } catch (err) {
      console.error("❌ AsyncStorage purge failed:", err);
      success = false;
    }

    // 3. Clear SecureStore (if available on this platform)
    if (Platform.OS !== "web") {
      try {
        const secureKeys = [
          "accessToken",
          "refreshToken",
          "userId",
          "userCredentials",
        ];

        for (const key of secureKeys) {
          await SecureStore.deleteItemAsync(key);
        }
        console.log("✅ Secure storage cleared");
      } catch (err) {
        console.warn("⚠️ SecureStore purge failed (non-critical):", err);
        // Don't set success to false as SecureStore is optional
      }
    }

    // 4. Add a marker to indicate a fresh purge
    const timestamp = Date.now().toString();
    await AsyncStorage.setItem("dataPurgeCompleted", timestamp);

    // 5. Verify the success
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      console.error("❌ CRITICAL FAILURE: Token still present after purge!");
      success = false;

      // Last-ditch effort
      await AsyncStorage.clear();
      console.log("✅ Executed emergency clear of all AsyncStorage");
    }

    return success;
  } catch (error) {
    console.error("❌ CRITICAL ERROR during user data purge:", error);
    return false;
  } finally {
    console.log("🔄 User data purge process completed, success:", success);
  }
};

/**
 * Check if a data purge was recently completed
 * @returns Boolean indicating if a purge happened in last 5 minutes
 */
export const wasPurgeRecentlyDone = async (): Promise<boolean> => {
  try {
    const timestamp = await AsyncStorage.getItem("dataPurgeCompleted");
    if (!timestamp) return false;

    const purgeTime = parseInt(timestamp, 10);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return purgeTime > fiveMinutesAgo;
  } catch (err) {
    console.error("❌ Error checking purge status:", err);
    return false;
  }
};
