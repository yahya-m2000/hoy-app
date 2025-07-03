/**
 * Authentication Service
 * 
 * Comprehensive authentication service providing:
 * - User authentication (login, logout, registration)
 * - Token management and validation
 * - Password reset and security operations
 * - Social authentication integration
 * - User session management
 * 
 * @module @core/api/services/auth
 * @author Hoy Development Team
 * @version 2.0.0
 */

import {api} from "@core/api/client";
import { 
  LoginCredentials, 
  LoginResponse 
} from "@core/types/auth.types";
import { logErrorWithContext } from "src/core/utils/sys/error";
import { logger } from "@core/utils/sys/log";

// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Registration data structure
 */
export interface RegisterData {
  email: string;
  password: string;
  /** User first name */
  firstName: string;
  /** User last name */
  lastName: string;
  /** Optional role (defaults to 'user') */
  role?: "user" | "host";
  confirmPassword?: string;
  agreeToTerms?: boolean;
  /** Optional phone number */
  phoneNumber?: string;
  /** Optional profile picture URL or base64 */
  profilePicture?: string;
  /** Optional address */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Registration response structure
 */
export interface RegistrationResponse {
  user: any;
  tokens: {
    access: string;
    refresh: string;
    expiresIn: number;
  };
  message: string;
  requiresVerification?: boolean;
}

/**
 * Password reset data structure
 */
export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

/**
 * Password reset request response
 */
export interface PasswordResetResponse {
  message: string;
  resetTokenSent: boolean;
  expiresIn?: number;
}

// ========================================
// AUTHENTICATION SERVICE
// ========================================

/**
 * Main authentication service class with comprehensive auth operations
 */
export class AuthService {
  /**
   * Authenticate user with email and password
   * 
   * @param credentials - User login credentials
   * @returns Promise<LoginResponse> - Authentication result with user data and tokens
   * @throws Will throw error if authentication fails
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
      }

      logger.log("Attempting login for:", credentials.email);

      const response = await api.post<{ data: LoginResponse }>("/auth/login", {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      logger.log("Login successful for:", credentials.email);
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.login", error);
      
      // Provide user-friendly error messages
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      } else if (error.response?.status === 403) {
        throw new Error("Account is not verified or has been suspended");
      } else if (error.response?.status === 429) {
        throw new Error("Too many login attempts. Please try again later");
      }
      
      throw new Error(error.response?.data?.message || "Login failed. Please try again");
    }
  }

  /**
   * Register a new user account
   * 
   * @param userData - User registration data
   * @returns Promise<RegistrationResponse> - Registration result with user data
   * @throws Will throw error if registration fails or validation errors occur
   */
  static async register(userData: RegisterData): Promise<RegistrationResponse> {
    try {
      // Input validation
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error("Email, password, first name and last name are required");
      }

      if (userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      logger.log("Attempting registration for:", userData.email);

      // Prepare payload matching backend expectations
      const payload = {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        role: userData.role ?? "user",
        phoneNumber: userData.phoneNumber,
        profilePicture: userData.profilePicture,
        address: userData.address,
      };

      const response = await api.post<{ data: any }>("/auth/register", payload);

      // Backend currently returns only the created user without tokens
      const createdUser = response.data.data;

      // Attempt automatic login to retrieve tokens so the app can proceed seamlessly
      let loginTokens: LoginResponse | null = null;
      try {
        loginTokens = await this.login({
          email: userData.email,
          password: userData.password,
        });
      } catch (loginError) {
        logger.warn("Auto-login after registration failed", loginError);
      }

      const registrationResponse: RegistrationResponse = {
        user: loginTokens?.user ?? createdUser,
        tokens: {
          access: loginTokens?.accessToken ?? "",
          refresh: loginTokens?.refreshToken ?? "",
          expiresIn: loginTokens?.expiresIn ?? 0,
        },
        message: "Registration successful",
        requiresVerification: false,
      };

      logger.log("Registration successful for:", userData.email);
      return registrationResponse;

    } catch (error: any) {
      logErrorWithContext("AuthService.register", error);
      
      // Handle specific registration errors
      if (error.response?.status === 409) {
        throw new Error("An account with this email already exists");
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Invalid registration data");
      }
      
      throw new Error(error.response?.data?.message || "Registration failed. Please try again");
    }
  }

  /**
   * Log out user and clear authentication data
   * Uses enhanced logout service for comprehensive session management
   * 
   * @param refreshToken - Optional refresh token for server-side logout
   * @returns Promise<{ success: boolean }> - Logout confirmation
   */
  static async logout(refreshToken?: string): Promise<{ success: boolean }> {
    try {
      // Import enhanced logout service dynamically to avoid circular dependencies
      const { performEnhancedLogout } = await import('@core/auth/enhanced-logout');
      
      // Use enhanced logout for comprehensive session management
      const result = await performEnhancedLogout({
        reason: 'manual_logout',
        notifyServer: true,
        auditLog: true,
      });

      logger.log("Enhanced logout completed", {
        success: result.success,
        sessionInvalidated: result.sessionInvalidated,
        serverNotified: result.serverNotified,
        tokensCleared: result.tokensCleared,
        errors: result.errors,
        warnings: result.warnings,
      });
      
      return { success: result.success };

    } catch (error: any) {
      logErrorWithContext("AuthService.logout", error);
      
      // Fallback to basic logout if enhanced logout fails
      try {
        if (refreshToken) {
          try {
            await api.post("/auth/logout", { refreshToken });
          } catch (serverError) {
            logger.warn("Server-side logout failed:", serverError);
          }
        }
        
        // Import clearUserData dynamically to avoid circular deps
        const { clearUserData } = await import('@core/auth/clear-user-data');
        await clearUserData();
        logger.log("Fallback logout completed");
        return { success: true };
      } catch (clearError) {
        logger.error("Failed to clear user data:", clearError);
        return { success: false };
      }
    }
  }

  /**
   * Request password reset email
   * 
   * @param email - User email address
   * @returns Promise<PasswordResetResponse> - Reset request confirmation
   * @throws Will throw error if email is invalid or request fails
   */
  static async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    try {
      if (!email || !email.includes('@')) {
        throw new Error("Valid email address is required");
      }

      logger.log("Requesting password reset for:", email);

      const response = await api.post<{ data: PasswordResetResponse }>("/auth/forgot-password", {
        email: email.toLowerCase().trim(),
      });

      logger.log("Password reset email sent to:", email);
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.requestPasswordReset", error);
      
      // Don't reveal if email exists for security
      if (error.response?.status === 404) {
        return {
          message: "If an account with this email exists, a reset link has been sent",
          resetTokenSent: true,
        };
      }
      
      throw new Error(error.response?.data?.message || "Failed to send reset email");
    }
  }

  /**
   * Reset password using reset token
   * 
   * @param resetData - Password reset data including token and new password
   * @returns Promise<{ success: boolean; message: string }> - Reset confirmation
   * @throws Will throw error if token is invalid or reset fails
   */
  static async resetPassword(resetData: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      if (!resetData.token || !resetData.newPassword) {
        throw new Error("Reset token and new password are required");
      }

      if (resetData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      logger.log("Attempting password reset with token");

      const response = await api.post<{ data: { success: boolean; message: string } }>("/auth/reset-password", {
        token: resetData.token,
        password: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      });

      logger.log("Password reset successful");
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.resetPassword", error);
      
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired reset token");
      } else if (error.response?.status === 422) {
        throw new Error(error.response.data?.message || "Password validation failed");
      }
      
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  }

  /**
   * Verify user email using verification token
   * 
   * @param token - Email verification token
   * @returns Promise<{ success: boolean; message: string }> - Verification result
   * @throws Will throw error if token is invalid or verification fails
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!token) {
        throw new Error("Verification token is required");
      }

      logger.log("Attempting email verification");

      const response = await api.post<{ data: { success: boolean; message: string } }>("/auth/verify-email", {
        token,
      });

      logger.log("Email verification successful");
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.verifyEmail", error);
      
      if (error.response?.status === 400) {
        throw new Error("Invalid or expired verification token");
      }
      
      throw new Error(error.response?.data?.message || "Email verification failed");
    }
  }

  /**
   * Resend email verification link
   * 
   * @param email - User email address
   * @returns Promise<{ success: boolean; message: string }> - Resend confirmation
   */
  static async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!email) {
        throw new Error("Email address is required");
      }

      const response = await api.post<{ data: { success: boolean; message: string } }>("/auth/resend-verification", {
        email: email.toLowerCase().trim(),
      });

      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.resendVerification", error);
      throw new Error(error.response?.data?.message || "Failed to resend verification email");
    }
  }

  /**
   * Change user password (requires current password)
   * 
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Promise<{ success: boolean; message: string }> - Change confirmation
   * @throws Will throw error if current password is incorrect or change fails
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!currentPassword || !newPassword) {
        throw new Error("Current password and new password are required");
      }

      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      logger.log("Attempting password change");

      const response = await api.post<{ data: { success: boolean; message: string } }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      logger.log("Password changed successfully");
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.changePassword", error);
      
      if (error.response?.status === 401) {
        throw new Error("Current password is incorrect");
      }
      
      throw new Error(error.response?.data?.message || "Password change failed");
    }
  }

  /**
   * Refresh authentication tokens
   * 
   * @param refreshToken - Current refresh token
   * @returns Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> - New tokens
   * @throws Will throw error if refresh token is invalid or refresh fails
   */
  static async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      if (!refreshToken) {
        throw new Error("Refresh token is required");
      }

      const response = await api.post<{ 
        data: { 
          accessToken: string; 
          refreshToken: string; 
          expiresIn: number;
        } 
      }>("/auth/refresh-token", {
        refreshToken,
      });

      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.refreshTokens", error);
      
      if (error.response?.status === 401) {
        // Refresh token is invalid, user needs to log in again
        const { clearUserData } = await import('@core/auth/clear-user-data');
        await clearUserData();
        throw new Error("Session expired. Please log in again");
      }
      
      throw new Error("Failed to refresh authentication tokens");
    }
  }

  /**
   * Get current authenticated user profile
   * 
   * @returns Promise<any> - Current user data
   * @throws Will throw error if not authenticated or request fails
   */
  static async getCurrentUser(): Promise<any> {
    try {
      // Use /users/me endpoint instead of /auth/me
      const response = await api.get<{ data: any }>("/users/me");
      return response.data.data;

    } catch (error: any) {
      logErrorWithContext("AuthService.getCurrentUser", error);
      
      if (error.response?.status === 401) {
        throw new Error("Not authenticated");
      } else if (error.response?.status === 404) {
        // Try /auth/me as fallback if /users/me doesn't exist
        try {
          const fallbackResponse = await api.get<{ data: any }>("/auth/me");
          return fallbackResponse.data.data;
        } catch (fallbackError: any) {
          logErrorWithContext("AuthService.getCurrentUser fallback", fallbackError);
          throw new Error("Failed to get user profile");
        }
      }
      
      throw new Error("Failed to get user profile");
    }
  }
}

// ========================================
// LEGACY EXPORTS (for backward compatibility)
// ========================================

export const login = AuthService.login;
export const register = AuthService.register;
export const logout = AuthService.logout;
export const requestPasswordReset = AuthService.requestPasswordReset;
export const resetPassword = AuthService.resetPassword;
export const verifyEmail = AuthService.verifyEmail;
export const resendVerification = AuthService.resendVerification;
export const changePassword = AuthService.changePassword;
export const refreshTokens = AuthService.refreshTokens;
export const getCurrentUser = AuthService.getCurrentUser; 