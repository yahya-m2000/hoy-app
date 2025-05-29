/**
 * Utility to clear all user-related data from storage
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "src/common/services/api";

/**
 * Clears all user data from the app
 * This is a utility function that can be called from anywhere
 * to ensure a complete logout of the user
 */
export const clearUserData = async (): Promise<void> => {
  try {
    // 1. Clear auth header
    if (api.defaults.headers.common["Authorization"]) {
      delete api.defaults.headers.common["Authorization"];
    }

    // 2. Get all keys from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();

    // 3. Filter for auth/user related keys
    const userDataKeys = keys.filter(
      (key) =>
        key.includes("token") ||
        key.includes("user") ||
        key.includes("auth") ||
        key.includes("profile") ||
        key.includes("preferences") ||
        key.includes("settings")
    );

    // 4. Clear all found keys
    if (userDataKeys.length > 0) {
      await AsyncStorage.multiRemove(userDataKeys);
      console.log(
        `Cleared ${userDataKeys.length} user data items from storage`
      );
    }

    // 5. Add a special flag to indicate a fresh logout
    await AsyncStorage.setItem("freshLogout", Date.now().toString());

    console.log("User data cleared successfully");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

