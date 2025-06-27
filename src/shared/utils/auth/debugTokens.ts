/**
 * Debug utility to check token storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const debugTokenStorage = async (): Promise<void> => {
  try {
    console.log("🔍 === TOKEN STORAGE DEBUG ===");

    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const userId = await AsyncStorage.getItem("currentUserId");
    const isBlacklisted = await AsyncStorage.getItem("tokenBlacklisted");
    const invalidatedAt = await AsyncStorage.getItem("tokenInvalidatedAt");

    console.log("Access Token:", accessToken ? "Present" : "Missing");
    console.log("🔄 Refresh Token:", refreshToken ? "Present" : "Missing");
    console.log(" User ID:", userId ? "Present" : "Missing");
    console.log("Blacklisted:", isBlacklisted || "false");
    console.log("Invalidated At:", invalidatedAt || "none");

    console.log("🔍 === END DEBUG ===");
  } catch (error) {
    console.error("Debug token storage error:", error);
  }
};

export const clearAllTokenDebugData = async (): Promise<void> => {
  try {
    console.log("Clearing all token debug data...");
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "currentUserId",
      "tokenBlacklisted",
      "tokenInvalidatedAt",
    ]);
    console.log("All token debug data cleared");
  } catch (error) {
    console.error("Error clearing debug data:", error);
  }
};
