/**
 * Authentication Context
 *
 * Provides centralized authentication state management including:
 * - Authentication state tracking
 * - Login/logout functionality
 * - Token management
 * - User session management
 *
 * @module @core/auth/context
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthContextType,
  AuthProviderProps,
  AuthUser,
  RegisterCredentials,
  PasswordResetCredentials,
} from "../types/auth.types";
import {
  hasValidAuthentication,
  setAuthStateChangeCallback,
  saveTokenToStorage,
  saveRefreshTokenToStorage,
  clearTokensFromStorage,
  markTokensAsInvalid,
  clearTokenInvalidation,
} from "../auth/storage";
import {
  setUserIdentity,
  clearUserIdentity,
} from "src/core/utils/data/validation/integrity-check";
import { AuthService } from "@core/api/services/auth";
import { resetCircuitBreaker } from "@core/api/circuit-breaker";
import { logger } from "../utils/sys/log/logger";
import { getAuthDebugInfo } from "../auth/debug";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";

// ========================================
// CONTEXT CREATION
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// AUTH PROVIDER COMPONENT (INTERNAL)
// ========================================

const AuthProviderInternal: React.FC<AuthProviderProps> = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const queryClient = useQueryClient();

  // Reset circuit breaker for user endpoints on mount to prevent blocking
  useEffect(() => {
    resetCircuitBreaker("/users/me");
    logger.debug("Reset circuit breaker for /users/me endpoint", undefined, {
      module: "AuthContext",
    });
  }, []);

  // ========================================
  // AUTH STATE MANAGEMENT
  // ========================================

  /**
   * Check current authentication state
   * Only checks token validity, doesn't load user data (that's handled by useCurrentUser hook)
   */
  const checkAuthenticationState = async () => {
    try {
      const authenticated = await hasValidAuthentication();
      setIsUserAuthenticated(authenticated);
      setIsAuthChecked(true);

      if (authenticated) {
        logger.auth("User authenticated");
        // Don't load user data here - let the useCurrentUser hook handle it
        // This prevents duplicate API calls and respects the hook's caching strategy
      } else {
        setCurrentUser(null);
        logger.auth("User not authenticated");
      }
    } catch (error) {
      logger.error("Error checking authentication", error, {
        module: "AuthContext",
      });
      setIsUserAuthenticated(false);
      setIsAuthChecked(true);
      setCurrentUser(null);
    }
  };

  /**
   * Mark user as unauthenticated
   */
  const markAsUnauthenticated = () => {
    setIsUserAuthenticated(false);
    setIsAuthChecked(true);
    setCurrentUser(null);
    logger.auth("Marked as unauthenticated");
  };

  /**
   * Mark user as authenticated
   */
  const markAsAuthenticated = (user?: AuthUser) => {
    setIsUserAuthenticated(true);
    setIsAuthChecked(true);
    if (user) {
      setCurrentUser(user);
    }
    logger.auth("Marked as authenticated", { email: user?.email });
  };

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      logger.auth("Starting login process", { email });

      // Call the auth service to perform login
      const loginResponse = await AuthService.login({ email, password });

      logger.auth("Login API call successful, storing tokens", { email });

      // Store tokens in AsyncStorage
      if (loginResponse.accessToken) {
        await saveTokenToStorage(loginResponse.accessToken);
      }
      if (loginResponse.refreshToken) {
        await saveRefreshTokenToStorage(loginResponse.refreshToken);
      }

      // Clear any previous token invalidation flags (e.g., blacklisted)
      await clearTokenInvalidation();

      // Store user ID for data integrity checks
      const userId = loginResponse.user.id || (loginResponse.user as any)._id;
      await AsyncStorage.setItem("currentUserId", userId);

      // Set user identity for integrity checks
      await setUserIdentity(userId, loginResponse.user.email);
      logger.auth("Tokens and user data stored successfully", { email });

      // Create session for session management
      try {
        const { createSession } = await import(
          "@core/security/session-manager"
        );
        const sessionInfo = await createSession(userId, "password", {
          ipAddress: undefined, // Could be obtained from device info
          userAgent: undefined, // Could be obtained from device info
        });

        logger.auth("Session created successfully", {
          email,
        });
      } catch (sessionError) {
        // Don't fail login if session creation fails
        logger.warn("Failed to create session during login", sessionError, {
          module: "AuthContext",
        });
      }

      // Debug: Check what's actually stored
      await getAuthDebugInfo();

      // Update auth state with user data
      setCurrentUser(loginResponse.user);
      markAsAuthenticated(loginResponse.user);

      logger.auth("Login completed successfully", { email });
    } catch (error) {
      logger.error("Login failed", error, { module: "AuthContext" });
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      logger.auth("Starting registration process", {
        email: credentials.email,
      });

      // Map our RegisterCredentials to the API's RegisterData format
      const registerData = {
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: credentials.role ?? "user",
        phoneNumber: credentials.phoneNumber,
        profilePicture: credentials.profilePicture,
        address: credentials.address,
        agreeToTerms: credentials.agreeToTerms,
      } as const;

      // Call the auth service to perform registration
      const registerResponse = await AuthService.register(registerData);

      logger.auth("Registration API call successful, storing tokens", {
        email: credentials.email,
      });

      // If tokens are present use them, otherwise perform login to get tokens
      let accessToken = registerResponse.tokens?.access;
      let refreshToken = registerResponse.tokens?.refresh;

      if (!accessToken) {
        const loginResponse = await AuthService.login({
          email: credentials.email,
          password: credentials.password,
        });
        accessToken = loginResponse.accessToken;
        refreshToken = loginResponse.refreshToken;
      }

      if (accessToken) {
        await saveTokenToStorage(accessToken);
      }
      if (refreshToken) {
        await saveRefreshTokenToStorage(refreshToken);
      }

      // Clear any previous token invalidation flags
      await clearTokenInvalidation();

      // Store user ID for data integrity checks
      const userObj = registerResponse.user;
      const userId = userObj?.id || (userObj as any)?._id;
      await AsyncStorage.setItem("currentUserId", userId);

      // Set user identity for integrity checks
      await setUserIdentity(userId, userObj?.email);
      logger.auth("Tokens and user data stored successfully", {
        email: credentials.email,
      });

      // Update auth state with user data
      if (userObj) {
        setCurrentUser(userObj);
        markAsAuthenticated(userObj);
      }

      logger.auth("Registration completed successfully", {
        email: credentials.email,
      });
    } catch (error) {
      logger.error("Registration failed", error, { module: "AuthContext" });
      throw error;
    }
  };

  /**
   * Logout user and clear all data
   */
  const logout = async (): Promise<void> => {
    try {
      logger.auth("Starting logout process");

      // Call server logout endpoint first
      try {
        await AuthService.logout();
        logger.auth("Server logout successful");
      } catch (error) {
        logger.warn(
          "Server logout failed, continuing with local logout:",
          error
        );
        // Continue with local logout even if server call fails
      }

      // Clear tokens from storage
      await clearTokensFromStorage();

      // Mark tokens as invalid
      await markTokensAsInvalid();

      // Clear user identity
      await clearUserIdentity();

      // Clear current user ID
      await AsyncStorage.removeItem("currentUserId");

      // Clear query cache
      queryClient.clear();

      // Update auth state
      setCurrentUser(null);
      markAsUnauthenticated();

      logger.auth("Logout completed successfully");
    } catch (error) {
      logger.error("Error during logout", error, { module: "AuthContext" });
      // Still mark as unauthenticated even if cleanup fails
      setCurrentUser(null);
      markAsUnauthenticated();
    }
  };

  /**
   * Request password reset
   */
  const requestPasswordReset = async (email: string): Promise<void> => {
    try {
      logger.auth("Requesting password reset", { email });
      await AuthService.requestPasswordReset(email);
      logger.auth("Password reset email sent", { email });
    } catch (error) {
      logger.error("Password reset request failed", error, {
        module: "AuthContext",
      });
      throw error;
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (
    credentials: PasswordResetCredentials
  ): Promise<void> => {
    try {
      logger.auth("Attempting password reset with token");
      await AuthService.resetPassword(credentials);
      logger.auth("Password reset successful");
    } catch (error) {
      logger.error("Password reset failed", error, { module: "AuthContext" });
      throw error;
    }
  };

  // ========================================
  // LIFECYCLE MANAGEMENT
  // ========================================

  useEffect(() => {
    checkAuthenticationState();

    // Set up auth state change callback
    const unsubscribe = setAuthStateChangeCallback((isAuthenticated) => {
      if (!isAuthenticated) {
        markAsUnauthenticated();
      }
    });

    return unsubscribe;
  }, []);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: AuthContextType = {
    isAuthenticated: isUserAuthenticated,
    isAuthChecked,
    user: currentUser,
    checkAuthenticationState,
    markAsUnauthenticated,
    markAsAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// ========================================
// AUTH PROVIDER WITH ERROR BOUNDARY
// ========================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => (
  <ContextErrorBoundary
    contextName="Authentication"
    critical={true} // Auth is critical - errors should be handled carefully
    enableRetry={true}
    maxRetries={2}
    onError={(error, errorInfo, contextName) => {
      logger.error(`[${contextName}] Critical context error:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        module: "AuthProvider",
      });
    }}
  >
    <AuthProviderInternal>{children}</AuthProviderInternal>
  </ContextErrorBoundary>
);

// ========================================
// CONTEXT HOOK
// ========================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
