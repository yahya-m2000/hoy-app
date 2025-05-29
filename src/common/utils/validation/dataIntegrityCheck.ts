/**
 * Data Integrity Checker
 *
 * This utility helps to detect and fix session-related data integrity issues
 * including data leaking between different user sessions
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { eventEmitter, AppEvents } from "../eventEmitter";
import { purgeAllUserData } from "../storage/purgeUserData";

const LAST_INTEGRITY_CHECK = "lastIntegrityCheck";
const CURRENT_USER_ID = "currentUserId";
const CURRENT_USER_EMAIL = "currentUserEmail";

/**
 * Verifies that user data is consistent and doesn't contain data from other users
 * @param userData User data object from API or cache
 * @returns Promise<boolean> True if data is consistent, false if integrity issues found
 */
export const verifyUserDataIntegrity = async (
  userData: any
): Promise<boolean> => {
  try {
    if (!userData || !userData._id) {
      console.warn("Cannot verify data integrity: user data is missing ID");
      return false;
    }

    // Get stored user identifiers
    const storedUserId = await AsyncStorage.getItem(CURRENT_USER_ID);
    const storedEmail = await AsyncStorage.getItem(CURRENT_USER_EMAIL);

    // If this is the first user data we're seeing, store it
    if (!storedUserId) {
      await AsyncStorage.setItem(CURRENT_USER_ID, userData._id);
      if (userData.email) {
        await AsyncStorage.setItem(CURRENT_USER_EMAIL, userData.email);
      }
      return true;
    }

    // Check if user ID matches what we have stored
    if (storedUserId !== userData._id) {
      console.error(
        `Data integrity error: User ID mismatch! Stored: ${storedUserId}, Current: ${userData._id}`
      );
      return false;
    }

    // Check if email matches if we have both values
    if (storedEmail && userData.email && storedEmail !== userData.email) {
      console.error(
        `Data integrity error: User email mismatch! Stored: ${storedEmail}, Current: ${userData.email}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in data integrity check:", error);
    return false; // Fail safe on any errors
  }
};

/**
 * Runs a comprehensive data integrity check and fixes any issues
 * This should be called during app startup and after login/logout
 */
export const performDataIntegrityCheck = async (): Promise<void> => {
  // Get configuration settings
  const enableChecks =
    Constants.expoConfig?.extra?.enableDataIntegrityChecks !== false;
  if (!enableChecks) {
    console.log("Data integrity checks disabled by configuration");
    return;
  }

  try {
    // Don't run checks too frequently
    const lastCheck = await AsyncStorage.getItem(LAST_INTEGRITY_CHECK);
    const now = Date.now();

    // Only check once every 5 minutes at most
    if (lastCheck && now - parseInt(lastCheck, 10) < 5 * 60 * 1000) {
      return;
    }

    console.log("Performing data integrity check");

    // Store the timestamp of this check
    await AsyncStorage.setItem(LAST_INTEGRITY_CHECK, now.toString());

    // Check if we have a token but no user ID, which is inconsistent
    const accessToken = await AsyncStorage.getItem("accessToken");
    const userId = await AsyncStorage.getItem(CURRENT_USER_ID);

    if (accessToken && !userId) {
      console.warn("Data integrity issue: Found token but no user ID");

      // This is an inconsistent state, reset auth data
      await purgeAllUserData();
      eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);
      return;
    }

    // Check session age
    const loginTimestamp = await AsyncStorage.getItem("loginTimestamp");
    if (loginTimestamp) {
      const sessionAge = now - parseInt(loginTimestamp, 10);
      const sessionTTL =
        Constants.expoConfig?.extra?.sessionTTL || 12 * 60 * 60 * 1000; // Default 12 hours

      if (sessionAge > sessionTTL) {
        console.warn(
          `Session expired: ${sessionAge}ms old (max: ${sessionTTL}ms)`
        );

        // Force logout of stale session
        await purgeAllUserData();
        eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);
        return;
      }
    }

    console.log("Data integrity check completed successfully");
  } catch (error) {
    console.error("Error during data integrity check:", error);
  }
};

/**
 * Sets user identity information for integrity checks
 */
export const setUserIdentity = async (
  userId: string,
  email?: string
): Promise<void> => {
  if (!userId) return;

  await AsyncStorage.setItem(CURRENT_USER_ID, userId);
  if (email) {
    await AsyncStorage.setItem(CURRENT_USER_EMAIL, email);
  }

  // Update login timestamp
  await AsyncStorage.setItem("loginTimestamp", Date.now().toString());
};

/**
 * Clears user identity information
 */
export const clearUserIdentity = async (): Promise<void> => {
  await AsyncStorage.removeItem(CURRENT_USER_ID);
  await AsyncStorage.removeItem(CURRENT_USER_EMAIL);
  await AsyncStorage.removeItem("loginTimestamp");
};
