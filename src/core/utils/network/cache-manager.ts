/**
 * Cache Buster Utility
 *
 * This utility adds a "Clean Slate" button to clear all user data and reset the app
 * It's a simple but effective solution to ensure users can get rid of stale data
 */

import { Platform } from 'react-native';
import { Alert } from "react-native";
import { eventEmitter, AppEvents } from "src/core/utils/sys/event-emitter";
import { logger } from "../sys/log";

let SecureStore: typeof import('expo-secure-store') | undefined;
let AsyncStorage: typeof import('@react-native-async-storage/async-storage') | undefined;
if (Platform.OS !== 'web' && typeof navigator !== 'undefined') {
  SecureStore = require('expo-secure-store');
  AsyncStorage = require('@react-native-async-storage/async-storage');
}

/**
 * Completely resets all app data by clearing AsyncStorage, SecureStore, etc.
 * This is the nuclear option when users are experiencing data issues
 */
export const resetAllAppData = async (): Promise<boolean> => {
  try {
    logger.log("🧨 EXECUTING FULL APP DATA RESET");

    // 1. Clear all AsyncStorage
    await AsyncStorage?.clear();
    logger.log("✅ AsyncStorage cleared");

    // 2. Clear SecureStore (for platforms that support it)
    try {
      const secureKeys = [
        "accessToken",
        "refreshToken",
        "userCredentials",
        "userId",
      ];

      for (const key of secureKeys) {
        await SecureStore?.deleteItemAsync(key);
      }
      logger.log("✅ SecureStore cleared");
    } catch (err) {
      logger.warn("⚠️ SecureStore clear failed:", err);
      // SecureStore might not be available on all platforms
      logger.log("SecureStore not cleared (might not be available)");
    }

    // 3. Set a marker to indicate fresh state
    await AsyncStorage?.setItem("appResetTimestamp", Date.now().toString());

    // 4. Notify the app about the reset
    eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);

    return true;
  } catch (err) {
    logger.error("❌ Error during app data reset:", err);
    return false;
  }
};

/**
 * A simple function to show a "clean slate" alert with options to reset
 */
export const showCleanSlateAlert = () => {
  Alert.alert(
    "Start Fresh",
    "If you're experiencing any issues, you can reset the app to a clean state. This will log you out and clear all cached data.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset App Data",
        style: "destructive",
        onPress: async () => {
          const success = await resetAllAppData();

          if (success) {
            Alert.alert(
              "Reset Complete",
              "The app has been reset to a clean state. Please restart the app now.",
              [
                {
                  text: "OK",
                },
              ]
            );
          } else {
            Alert.alert(
              "Reset Failed",
              "Something went wrong. Try force-closing and reopening the app.",
              [
                {
                  text: "OK",
                },
              ]
            );
          }
        },
      },
    ]
  );
};
