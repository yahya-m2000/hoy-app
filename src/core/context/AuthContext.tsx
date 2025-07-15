/**
 * Authentication Context
 *
 * Provides centralized authentication state management including:
 * - Authentication state tracking
 * - Login/logout functionality
 * - Token management
 * - User session management
 * - Registration form state management
 *
 * @module @core/auth/context
 * @author Hoy Development Team
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthContextType,
  AuthProviderProps,
  AuthUser,
  RegisterCredentials,
  PasswordResetCredentials,
  RegistrationFormState,
  RegistrationFormErrors,
  RegistrationState,
  SSOSignupData,
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
import { UploadService } from "@core/api/services/upload/upload.service";
import { resetCircuitBreaker } from "@core/api/circuit-breaker";
import { logger } from "../utils/sys/log/logger";
import { getAuthDebugInfo } from "../auth/debug";
import { ContextErrorBoundary } from "../error/ContextErrorBoundary";
import { getValidAccessToken } from "@core/api/auth-manager";
import { getTokenFromStorage } from "../auth/storage";
import {
  testAuthTokenInterceptor,
  testAuthTokenInterceptorComprehensive,
} from "../api/auth-token-interceptor";
import { COUNTRIES } from "../utils/data/countries";
import { validateCountryCityState } from "../utils/data/countries";
import api from "../api/client";

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

  // Registration state management
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    {
      formState: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        country: "",
        city: "",
        state: "",
        avatar: null,
        agreeToTerms: false,
        selectedCountry: COUNTRIES[0],
        countryModalVisible: false,
        cityModalVisible: false,
        countrySearch: "",
        citySearch: "",
        ssoData: null,
      },
      errors: {},
      loading: false,
      isValid: false,
    }
  );

  // Reset circuit breaker for user endpoints on mount to prevent blocking
  useEffect(() => {
    resetCircuitBreaker("/users/me");
    resetCircuitBreaker("/auth/register");
    logger.debug("Reset circuit breakers for user endpoints", undefined, {
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
  const checkAuthenticationState = useCallback(async () => {
    try {
      let authenticated = await hasValidAuthentication();

      // If access token is expired but refresh token is still valid, attempt silent refresh
      if (!authenticated) {
        try {
          const newAccessToken = await getValidAccessToken();
          authenticated = !!newAccessToken;

          if (authenticated) {
            logger.debug(
              "Silent token refresh succeeded during auth check",
              undefined,
              {
                module: "AuthContext",
              }
            );
          }
        } catch (refreshError) {
          logger.warn(
            "Silent token refresh failed during auth check",
            refreshError,
            {
              module: "AuthContext",
            }
          );
        }
      }
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
  }, []);

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
        logger.auth("Access token saved to storage", { email });
      } else {
        logger.error("No access token in login response", { email });
      }

      if (loginResponse.refreshToken) {
        await saveRefreshTokenToStorage(loginResponse.refreshToken);
        logger.auth("Refresh token saved to storage", { email });
      } else {
        logger.error("No refresh token in login response", { email });
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

      // Test interceptor functionality
      try {
        const testResult = await testAuthTokenInterceptorComprehensive();
        logger.info(
          `[AuthContext] Interceptor test result:`,
          {
            interceptorWorking: testResult.interceptorWorking,
            tokenFound: testResult.tokenFound,
            storageAccessible: testResult.storageAccessible,
            error: testResult.error,
          },
          {
            module: "AuthContext",
          }
        );
      } catch (error) {
        logger.warn("[AuthContext] Interceptor test failed", error, {
          module: "AuthContext",
        });
      }

      // Run comprehensive authentication flow test
      await testAuthenticationFlow();

      // Additional debug: Verify token storage
      const storedToken = await getTokenFromStorage();
      logger.auth("Token storage verification completed", { email });
      logger.debug(
        "Stored token details",
        {
          exists: !!storedToken,
          length: storedToken?.length || 0,
          preview: storedToken ? `${storedToken.substring(0, 20)}...` : "NONE",
        },
        { module: "AuthContext" }
      );

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

      // Reset circuit breaker for registration endpoint to ensure it's not blocked
      resetCircuitBreaker("/auth/register");

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

      // The backend registration endpoint only returns user data, not tokens
      // So we need to perform a login to get the tokens
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let userObj = registerResponse.user;

      // Always perform login to get tokens since registration doesn't return them
      try {
        const loginResponse = await AuthService.login({
          email: credentials.email,
          password: credentials.password,
        });
        accessToken = loginResponse.accessToken;
        refreshToken = loginResponse.refreshToken;
        userObj = loginResponse.user; // Use user data from login response
      } catch (loginError) {
        logger.error("Auto-login after registration failed", loginError, {
          module: "AuthContext",
        });
        throw new Error(
          "Registration successful but automatic login failed. Please try logging in manually."
        );
      }

      // Store tokens
      if (accessToken) {
        await saveTokenToStorage(accessToken);
      }
      if (refreshToken) {
        await saveRefreshTokenToStorage(refreshToken);
      }

      // Clear any previous token invalidation flags
      await clearTokenInvalidation();

      // Store user ID for data integrity checks
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

  /**
   * Test authentication flow and API interceptor setup
   */
  const testAuthenticationFlow = async (): Promise<void> => {
    try {
      logger.info(
        "[AuthContext] 🔍 Starting comprehensive authentication flow test...",
        undefined,
        {
          module: "AuthContext",
        }
      );

      // 1. Test token storage
      const storedToken = await getTokenFromStorage();
      logger.info(
        `[AuthContext] 1. Token storage test: ${storedToken ? "PASS" : "FAIL"}`,
        undefined,
        {
          module: "AuthContext",
        }
      );

      // 2. Test interceptor functionality
      const testResult = await testAuthTokenInterceptorComprehensive();
      logger.info(
        `[AuthContext] 2. Interceptor test:`,
        {
          interceptorWorking: testResult.interceptorWorking ? "PASS" : "FAIL",
          tokenFound: testResult.tokenFound,
          storageAccessible: testResult.storageAccessible,
          error: testResult.error,
        },
        {
          module: "AuthContext",
        }
      );

      // 3. Test API client configuration
      logger.info(
        `[AuthContext] 3. API client config: baseURL=${api.defaults.baseURL}`,
        undefined,
        {
          module: "AuthContext",
        }
      );

      // 4. Test a simple API call to verify token attachment
      if (storedToken) {
        try {
          logger.info(
            "[AuthContext] 4. Testing API call with token...",
            undefined,
            {
              module: "AuthContext",
            }
          );

          // Make a test call to a protected endpoint
          const response = await api.get("/users/me");
          logger.info(
            `[AuthContext] 4. API call test: PASS (status: ${response.status})`,
            undefined,
            {
              module: "AuthContext",
            }
          );
        } catch (apiError: any) {
          if (apiError.response?.status === 401) {
            logger.error(
              "[AuthContext] 4. API call test: FAIL - 401 Unauthorized (token not attached)",
              undefined,
              {
                module: "AuthContext",
              }
            );
          } else {
            logger.error(
              "[AuthContext] 4. API call test: FAIL - Other error",
              apiError,
              {
                module: "AuthContext",
              }
            );
          }
        }
      } else {
        logger.warn(
          "[AuthContext] 4. API call test: SKIPPED - No token available",
          undefined,
          {
            module: "AuthContext",
          }
        );
      }

      logger.info(
        "[AuthContext] 🔍 Authentication flow test completed",
        undefined,
        {
          module: "AuthContext",
        }
      );
    } catch (error) {
      logger.error("[AuthContext] Authentication flow test failed", error, {
        module: "AuthContext",
      });
    }
  };

  // ========================================
  // REGISTRATION STATE MANAGEMENT
  // ========================================

  /**
   * Update a single registration form field
   */
  const updateRegistrationField = <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K]
  ) => {
    setRegistrationState((prev) => ({
      ...prev,
      formState: {
        ...prev.formState,
        [field]: value,
      },
    }));
  };

  /**
   * Update multiple registration form fields
   */
  const updateRegistrationFields = (fields: Partial<RegistrationFormState>) => {
    setRegistrationState((prev) => ({
      ...prev,
      formState: {
        ...prev.formState,
        ...fields,
      },
    }));
  };

  /**
   * Validate registration form
   */
  const validateRegistrationForm = (): RegistrationFormErrors => {
    const { formState } = registrationState;
    const newErrors: RegistrationFormErrors = {};

    if (!formState.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formState.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formState.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation - required for regular users, optional for SSO users
    if (!formState.ssoData) {
      // Regular users must have a password
      if (!formState.password) {
        newErrors.password = "Password is required";
      } else if (formState.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          formState.password
        )
      ) {
        newErrors.password =
          "Password must contain uppercase, lowercase, number, and special character";
      }

      if (formState.password !== formState.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else {
      // SSO users can optionally set a password
      if (formState.password) {
        // If they provide a password, validate it
        if (formState.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            formState.password
          )
        ) {
          newErrors.password =
            "Password must contain uppercase, lowercase, number, and special character";
        }

        if (formState.password !== formState.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    if (!formState.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formState.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formState.city.trim()) {
      newErrors.city = "City is required";
    } else {
      // Validate that the city belongs to the selected country
      const validation = validateCountryCityState(
        formState.selectedCountry.code,
        formState.city,
        formState.state
      );

      if (!validation.isValid) {
        newErrors.city = "Please select a valid city for the chosen country";
      }
    }

    return newErrors;
  };

  /**
   * Clear registration form errors
   */
  const clearRegistrationErrors = () => {
    setRegistrationState((prev) => ({
      ...prev,
      errors: {},
    }));
  };

  /**
   * Reset registration form to initial state
   */
  const resetRegistrationForm = () => {
    setRegistrationState({
      formState: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        country: "",
        city: "",
        state: "",
        avatar: null,
        agreeToTerms: false,
        selectedCountry: COUNTRIES[0],
        countryModalVisible: false,
        cityModalVisible: false,
        countrySearch: "",
        citySearch: "",
        ssoData: null,
      },
      errors: {},
      loading: false,
      isValid: false,
    });
  };

  /**
   * Set SSO signup data
   */
  const setSSOSignupData = (data: SSOSignupData | null) => {
    console.log("Setting SSO signup data:", data);
    setRegistrationState((prev) => {
      const newState = {
        ...prev,
        formState: {
          ...prev.formState,
          ssoData: data,
          // Prefill form with SSO data if available
          ...(data && {
            email: data.email || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            avatar: data.profilePicture || null,
          }),
        },
      };
      console.log("Updated registration state:", newState.formState);
      return newState;
    });
  };

  /**
   * Handle registration submission
   */
  const handleRegistration = async () => {
    const { formState } = registrationState;
    const formErrors = validateRegistrationForm();

    console.log("AuthContext handleRegistration - form state:", {
      hasSSOData: !!formState.ssoData,
      ssoData: formState.ssoData,
      email: formState.email,
      firstName: formState.firstName,
      lastName: formState.lastName,
      hasPassword: !!formState.password,
      agreeToTerms: formState.agreeToTerms,
    });

    if (Object.keys(formErrors).length > 0) {
      console.log("Validation errors:", formErrors);
      setRegistrationState((prev) => ({
        ...prev,
        errors: formErrors,
      }));
      return;
    }

    if (!formState.agreeToTerms) {
      throw new Error("Please agree to the terms and conditions");
    }

    setRegistrationState((prev) => ({
      ...prev,
      loading: true,
      errors: {},
    }));

    try {
      // If this is an SSO signup, use the SSO signup endpoint
      if (formState.ssoData) {
        console.log("Starting SSO signup with data:", formState.ssoData);

        const ssoSignupData = {
          email: formState.email,
          provider: formState.ssoData.provider,
          ssoId: formState.ssoData.ssoId,
          firstName: formState.firstName,
          lastName: formState.lastName,
          profilePicture: formState.avatar || formState.ssoData.profilePicture,
          password: formState.password || undefined, // Include password if provided
          phoneNumber: formState.phoneNumber,
          address: {
            city: formState.city,
            country: formState.country,
            countryCode: formState.selectedCountry.code,
            state: formState.state,
          },
        };

        console.log("Calling AuthService.ssoSignup with:", ssoSignupData);
        const ssoResponse = await AuthService.ssoSignup(ssoSignupData);

        // Store tokens from SSO signup
        if (ssoResponse.accessToken) {
          await saveTokenToStorage(ssoResponse.accessToken);
        }
        if (ssoResponse.refreshToken) {
          await saveRefreshTokenToStorage(ssoResponse.refreshToken);
        }

        // Clear any previous token invalidation flags
        await clearTokenInvalidation();

        // Store user ID for data integrity checks
        const userId = ssoResponse.user?.id || (ssoResponse.user as any)?._id;
        await AsyncStorage.setItem("currentUserId", userId);

        // Set user identity for integrity checks
        await setUserIdentity(userId, ssoResponse.user?.email);

        // Upload profile picture to B2 if it's a remote URL (from SSO)
        if (
          formState.avatar &&
          (formState.avatar.startsWith("http://") ||
            formState.avatar.startsWith("https://"))
        ) {
          try {
            logger.log("Uploading SSO profile picture to B2", {
              imageUrl: formState.avatar,
            });
            await UploadService.uploadProfileImage(formState.avatar);
            logger.log("SSO profile picture uploaded to B2 successfully");
          } catch (uploadError) {
            logger.error(
              "Failed to upload SSO profile picture to B2",
              uploadError
            );
            // Don't fail the signup if image upload fails
          }
        }

        // Mark user as authenticated
        markAsAuthenticated(ssoResponse.user);

        logger.auth("SSO signup completed successfully", {
          email: formState.email,
        });
      } else {
        // Regular registration
        const registerData: RegisterCredentials = {
          email: formState.email,
          password: formState.password,
          firstName: formState.firstName,
          lastName: formState.lastName,
          phoneNumber: formState.phoneNumber,
          profilePicture: formState.avatar || undefined,
          address: {
            city: formState.city,
            country: formState.country,
            countryCode: formState.selectedCountry.code,
            state: formState.state,
          },
          agreeToTerms: formState.agreeToTerms,
        };

        await register(registerData);
      }

      // Reset form after successful registration
      resetRegistrationForm();
    } catch (error) {
      logger.error("Registration failed", error, { module: "AuthContext" });
      throw error;
    } finally {
      setRegistrationState((prev) => ({
        ...prev,
        loading: false,
      }));
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
    testAuthenticationFlow,

    // Registration state management
    registrationState,
    updateRegistrationField,
    updateRegistrationFields,
    validateRegistrationForm,
    clearRegistrationErrors,
    resetRegistrationForm,
    setSSOSignupData,
    handleRegistration,
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
