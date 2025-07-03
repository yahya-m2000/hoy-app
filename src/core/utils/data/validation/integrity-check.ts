/**
 * Data Integrity Check Utilities
 *
 * Comprehensive data validation and integrity checking functions
 * for API responses, user input, data consistency verification,
 * and user session integrity management.
 * 
 * @module @core/utils/validation/data-integrity-check
 * @author Hoy Development Team  
 * @version 1.0.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { eventEmitter, AppEvents } from "../../sys/event-emitter";
import { purgeNonEssentialData } from "../../storage/data-purge";
import { logger } from "../../sys/log";
import { getTokenFromStorage } from "../../../auth/storage";

// ============================================================================
// USER SESSION INTEGRITY CONSTANTS
// ============================================================================

const LAST_INTEGRITY_CHECK = "lastIntegrityCheck";
const CURRENT_USER_ID = "currentUserId";
const CURRENT_USER_EMAIL = "currentUserEmail";

// ============================================================================
// USER SESSION INTEGRITY FUNCTIONS
// ============================================================================

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
      logger.warn("Cannot verify data integrity: user data is missing ID");
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
      logger.error(
        `Data integrity error: User ID mismatch! Stored: ${storedUserId}, Current: ${userData._id}`
      );
      return false;
    }

    // Check if email matches if we have both values
    if (storedEmail && userData.email && storedEmail !== userData.email) {
      logger.error(
        `Data integrity error: User email mismatch! Stored: ${storedEmail}, Current: ${userData.email}`
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error in data integrity check:", error);
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
    logger.log("Data integrity checks disabled by configuration");
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

    logger.log("Performing data integrity check");

    // Store the timestamp of this check
    await AsyncStorage.setItem(LAST_INTEGRITY_CHECK, now.toString());

    // Check if we have a token but no user ID, which is inconsistent
    const accessToken = await getTokenFromStorage();
    const userId = await AsyncStorage.getItem(CURRENT_USER_ID);

    if (accessToken && !userId) {
      logger.warn("Data integrity issue: Found token but no user ID");

      // This is an inconsistent state, reset auth data
      await purgeNonEssentialData();
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
        logger.warn(
          `Session expired: ${sessionAge}ms old (max: ${sessionTTL}ms)`
        );

        // Force logout of stale session
        await purgeNonEssentialData();
        eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);
        return;
      }
    }

    logger.log("Data integrity check completed successfully");
  } catch (error) {
    logger.error("Error during data integrity check:", error);
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

// ============================================================================
// GENERIC DATA VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if an object has required properties
 * @param obj Object to check
 * @param requiredProps Array of required property names
 * @returns Boolean indicating if all required props exist
 */
export const hasRequiredProperties = (
  obj: any,
  requiredProps: string[]
): boolean => {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  return requiredProps.every(prop => {
    const keys = prop.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return current !== undefined && current !== null;
  });
};

/**
 * Validate that a value is within expected bounds
 * @param value Value to check
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Boolean indicating if value is within bounds
 */
export const isWithinBounds = (
  value: number,
  min: number,
  max: number
): boolean => {
  return typeof value === "number" && 
         !isNaN(value) && 
         value >= min && 
         value <= max;
};

/**
 * Check if array contains valid items
 * @param arr Array to check
 * @param validator Function to validate each item
 * @returns Boolean indicating if all items are valid
 */
export const isValidArray = <T>(
  arr: any[],
  validator: (item: T) => boolean
): boolean => {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.length > 0 && arr.every(validator);
};

/**
 * Validate email format
 * @param email Email string to validate
 * @returns Boolean indicating if email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email);
};

/**
 * Check if string is not empty after trimming
 * @param str String to check
 * @returns Boolean indicating if string has content
 */
export const isNonEmptyString = (str: any): str is string => {
  return typeof str === "string" && str.trim().length > 0;
};

/**
 * Validate that all values in object are not null/undefined
 * @param obj Object to check
 * @returns Boolean indicating if all values are valid
 */
export const allValuesValid = (obj: Record<string, any>): boolean => {
  return Object.values(obj).every(value => 
    value !== null && value !== undefined && value !== ""
  );
};

/**
 * Deep equality check for objects
 * @param obj1 First object
 * @param obj2 Second object
 * @returns Boolean indicating if objects are deeply equal
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;
  
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== "object") return obj1 === obj2;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => 
    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
  );
};

/**
 * Sanitize string input by removing potential harmful characters
 * @param input String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
};

// ========================================
// SECURE INTEGRITY VALIDATION
// ========================================

/**
 * Check authentication data integrity
 * Uses secure storage instead of direct AsyncStorage access
 */
export const checkAuthIntegrity = async () => {
  try {
    logger.debug("Starting authentication integrity check", undefined, {
      module: "IntegrityCheck"
    });

    // Use secure storage function instead of direct AsyncStorage
    const accessToken = await getTokenFromStorage();
    const userId = await AsyncStorage.getItem("currentUserId");

    const integrity = {
      hasAccessToken: !!accessToken,
      hasUserId: !!userId,
      tokenLength: accessToken?.length || 0,
      isValidTokenFormat: accessToken ? isValidJWTFormat(accessToken) : false,
      timestamp: new Date().toISOString(),
    };

    const isIntegrityValid = integrity.hasAccessToken && 
                           integrity.hasUserId && 
                           integrity.isValidTokenFormat;

    logger.debug("Authentication integrity check completed", {
      ...integrity,
      isValid: isIntegrityValid
    }, {
      module: "IntegrityCheck"
    });

    return {
      ...integrity,
      isValid: isIntegrityValid,
    };
  } catch (error) {
    logger.error("Authentication integrity check failed", error, {
      module: "IntegrityCheck"
    });
    return {
      hasAccessToken: false,
      hasUserId: false,
      tokenLength: 0,
      isValidTokenFormat: false,
      isValid: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Validate JWT token format
 */
const isValidJWTFormat = (token: string): boolean => {
  try {
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => 
      /^[A-Za-z0-9_-]+$/.test(part) && part.length > 0
    );
  } catch {
    return false;
  }
};

/**
 * Check overall data integrity
 */
export const checkDataIntegrity = async () => {
  try {
    const authIntegrity = await checkAuthIntegrity();
    const storageKeys = await AsyncStorage.getAllKeys();
    
    return {
      auth: authIntegrity,
      storage: {
        totalKeys: storageKeys.length,
        hasData: storageKeys.length > 0,
      },
      timestamp: new Date().toISOString(),
      overallValid: authIntegrity.isValid,
    };
  } catch (error) {
    logger.error("Data integrity check failed", error, {
      module: "IntegrityCheck"
    });
    return {
      auth: { isValid: false },
      storage: { totalKeys: 0, hasData: false },
      timestamp: new Date().toISOString(),
      overallValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}; 