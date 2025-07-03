/**
 * User Service
 * 
 * Comprehensive user management operations including:
 * - User profile management
 * - Account settings and preferences
 * - Payment methods management
 * - Data integrity verification
 * 
 * @module @core/api/services/user
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logErrorWithContext } from "@core/utils/sys/error";
import type { User } from "@core/types/user.types";
import { logger } from "@core/utils/sys/log";

// ========================================
// Type Definitions
// ========================================

/**
 * User profile update data
 */
export interface UserProfileData {
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phoneNumber?: string;
  /** Profile picture URL */
  profilePicture?: string;
  /** Date of birth */
  dateOfBirth?: string;
  /** Bio/description */
  bio?: string;
  /** Preferred language */
  language?: string;
  /** Currency preference */
  currency?: string;
}

/**
 * Password change data
 */
export interface PasswordChangeData {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
}

/**
 * User preferences structure
 */
export interface UserPreferences {
  /** Email notification settings */
  emailNotifications: boolean;
  /** Push notification settings */
  pushNotifications: boolean;
  /** SMS notification settings */
  smsNotifications: boolean;
  /** Marketing communications */
  marketingEmails: boolean;
  /** Currency preference */
  currency: string;
  /** Language preference */
  language: string;
  /** Timezone */
  timezone: string;
}

/**
 * Payment method structure
 */
export interface PaymentMethod {
  /** Payment method ID */
  id: string;
  /** Method type (card, paypal, etc.) */
  type: string;
  /** Display name */
  displayName: string;
  /** Last 4 digits for cards */
  last4?: string;
  /** Brand (visa, mastercard, etc.) */
  brand?: string;
  /** Whether this is the default method */
  isDefault: boolean;
  /** Expiry date for cards */
  expiryDate?: string;
}

// ========================================
// User Service
// ========================================

/**
 * User management service class
 */
export class UserService {
  private static readonly STORAGE_KEYS = {
    USER_ID: 'currentUserId',
    INTEGRITY_ERROR: 'userDataIntegrityError',
    FORCE_RESET: 'forceDataReset',
  };

  /**
   * Get current authenticated user with data integrity verification
   * 
   * @returns Promise<User> - Current user data
   * @throws Error if user not found or data integrity issues
   */
  static async getCurrentUser(): Promise<User> {
    // Generate cache-busting parameters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    try {
      // Get stored user ID for data integrity verification
      const storedUserId = await AsyncStorage.getItem(UserService.STORAGE_KEYS.USER_ID);

      // Make request with robust cache prevention
      const response = await api.get<{ data: User }>(`/users/me`, {
        params: {
          _t: timestamp,
          _r: random,
          _v: "1.0.1", // Version to force cache invalidation
        },
        headers: {
          // Cache prevention headers
          "Cache-Control": "no-cache, no-store, must-revalidate, private",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-Timestamp": timestamp.toString(),
          "X-Client-ID": random,
        },
      });

      const userData = response.data.data;
      if (userData) {
        // Add fetch metadata
        (userData as any)._fetchedAt = new Date().toISOString();

        // Verify data integrity
        if (storedUserId && userData._id && userData._id !== storedUserId) {
          logger.error(
            `DATA INTEGRITY ERROR: User ID mismatch! Expected ${storedUserId}, got ${userData._id}`
          );

          // Store error flag for next app reload
          await AsyncStorage.setItem(UserService.STORAGE_KEYS.INTEGRITY_ERROR, "true");
          throw new Error("Data integrity error: User ID mismatch");
        }

        // Store user ID if not already stored
        if (!storedUserId && userData._id) {
          await AsyncStorage.setItem(UserService.STORAGE_KEYS.USER_ID, userData._id);
        }
      }

      return userData;
    } catch (error: any) {
      logErrorWithContext("getCurrentUser", error);

      // Handle data integrity errors
      if (error instanceof Error && error.message.includes("integrity")) {
        // Trigger clean slate on next app launch
        await AsyncStorage.setItem(UserService.STORAGE_KEYS.FORCE_RESET, "true");
      }

      throw error;
    }
  }

  /**
   * Update user profile information
   * 
   * @param profileData - Profile update data
   * @returns Promise<User> - Updated user data
   */
  static async updateProfile(profileData: UserProfileData): Promise<User> {
    try {
      const response = await api.put<{ data: User }>("/users/me", profileData);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("updateProfile", error);
      throw error;
    }
  }

  /**
   * Change user password
   * 
   * @param passwordData - Current and new password
   * @returns Promise<void>
   */
  static async updatePassword(passwordData: PasswordChangeData): Promise<void> {
    try {
      await api.put("/users/me/password", passwordData);
    } catch (error: any) {
      logErrorWithContext("updatePassword", error);
      throw error;
    }
  }

  /**
   * Get user by ID (for public profiles)
   * 
   * @param id - User identifier
   * @returns Promise<Partial<User>> - Public user data
   */
  static async getUserById(id: string): Promise<Partial<User>> {
    try {
      const response = await api.get<{ data: Partial<User> }>(`/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("getUserById", error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * 
   * @returns Promise<UserPreferences> - User preferences
   */
  static async getUserPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<{ data: UserPreferences }>("/users/me/preferences");
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("getUserPreferences", error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * 
   * @param preferencesData - New preferences
   * @returns Promise<UserPreferences> - Updated preferences
   */
  static async updateUserPreferences(preferencesData: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await api.put<{ data: UserPreferences }>(
        "/users/me/preferences",
        preferencesData
      );
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("updateUserPreferences", error);
      throw error;
    }
  }

  /**
   * Get user's payment methods
   * 
   * @returns Promise<PaymentMethod[]> - Array of payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get<{ data: PaymentMethod[] }>("/users/me/payment-methods");
      return response.data.data || [];
    } catch (error: any) {
      logErrorWithContext("getPaymentMethods", error);
      return [];
    }
  }

  /**
   * Add a new payment method
   * 
   * @param methodData - Payment method data
   * @returns Promise<PaymentMethod> - Added payment method
   */
  static async addPaymentMethod(methodData: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    try {
      const response = await api.post<{ data: PaymentMethod }>(
        "/users/me/payment-methods",
        methodData
      );
      return response.data.data;
    } catch (error: any) {
      logErrorWithContext("addPaymentMethod", error);
      throw error;
    }
  }

  /**
   * Remove a payment method
   * 
   * @param methodId - Payment method ID
   * @returns Promise<void>
   */
  static async removePaymentMethod(methodId: string): Promise<void> {
    try {
      await api.delete(`/users/me/payment-methods/${methodId}`);
    } catch (error: any) {
      logErrorWithContext("removePaymentMethod", error);
      throw error;
    }
  }

  /**
   * Set default payment method
   * 
   * @param methodId - Payment method ID
   * @returns Promise<void>
   */
  static async setDefaultPaymentMethod(methodId: string): Promise<void> {
    try {
      await api.patch(`/users/me/payment-methods/${methodId}/default`);
    } catch (error: any) {
      logErrorWithContext("setDefaultPaymentMethod", error);
      throw error;
    }
  }

  /**
   * Delete user account
   * 
   * @param password - Current password for verification
   * @returns Promise<void>
   */
  static async deleteAccount(password: string): Promise<void> {
    try {
      await api.request({
        method: 'DELETE',
        url: "/users/me",
        data: { password },
      });

      // Clear all stored data
      await this.clearUserData();
    } catch (error: any) {
      logErrorWithContext("deleteAccount", error);
      throw error;
    }
  }

  /**
   * Clear all user data from storage
   * 
   * @returns Promise<void>
   */
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        UserService.STORAGE_KEYS.USER_ID,
        UserService.STORAGE_KEYS.INTEGRITY_ERROR,
        UserService.STORAGE_KEYS.FORCE_RESET,
      ]);
    } catch (error: any) {
      logErrorWithContext("clearUserData", error);
    }
  }

  /**
   * Check for data integrity issues
   * 
   * @returns Promise<boolean> - True if integrity issues exist
   */
  static async checkDataIntegrity(): Promise<boolean> {
    try {
      const hasIntegrityError = await AsyncStorage.getItem(UserService.STORAGE_KEYS.INTEGRITY_ERROR);
      const forceReset = await AsyncStorage.getItem(UserService.STORAGE_KEYS.FORCE_RESET);
      
      return hasIntegrityError === "true" || forceReset === "true";
    } catch (error: any) {
      logErrorWithContext("checkDataIntegrity", error);
      return false;
    }
  }
}

// ========================================
// Legacy Function Exports
// ========================================

// getCurrentUser export removed to avoid conflicts with AuthService.getCurrentUser
// Use AuthService.getCurrentUser() for authentication-related user data
// Use UserService.getCurrentUser() for detailed user profile operations

/**
 * Update user profile
 * @deprecated Use UserService.updateProfile instead
 */
export const updateProfile = UserService.updateProfile;

/**
 * Update user password
 * @deprecated Use UserService.updatePassword instead
 */
export const updatePassword = UserService.updatePassword;

/**
 * Get user by ID
 * @deprecated Use UserService.getUserById instead
 */
export const getUserById = UserService.getUserById;

/**
 * Get user preferences
 * @deprecated Use UserService.getUserPreferences instead
 */
export const getUserPreferences = UserService.getUserPreferences;

/**
 * Update user preferences
 * @deprecated Use UserService.updateUserPreferences instead
 */
export const updateUserPreferences = UserService.updateUserPreferences;

/**
 * Get payment methods
 * @deprecated Use UserService.getPaymentMethods instead
 */
export const getPaymentMethods = UserService.getPaymentMethods;

/**
 * Add payment method
 * @deprecated Use UserService.addPaymentMethod instead
 */
export const addPaymentMethod = UserService.addPaymentMethod;

// Default export
export default UserService;
