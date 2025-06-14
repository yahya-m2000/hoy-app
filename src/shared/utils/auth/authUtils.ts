/**
 * Authentication utilities for handling unauthenticated user actions
 */
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@shared/context/AuthContext";
import * as authService from "@shared/services/api/auth";
import { clearTokensFromStorage } from "@shared/utils/storage/authStorage";
import { eventEmitter, AppEvents } from "@shared/utils/eventEmitter";

export interface AuthPromptOptions {
  title?: string;
  message?: string;
  cancelText?: string;
  signInText?: string;
  onCancel?: () => void;
  onSignIn?: () => void;
}

/**
 * Show authentication prompt when user tries to access protected feature
 */
export const showAuthPrompt = (options: AuthPromptOptions = {}) => {
  const {
    title = "Sign in Required",
    message = "You need to sign in to use this feature.",
    cancelText = "Cancel",
    signInText = "Sign In",
    onCancel,
    onSignIn,
  } = options;

  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: signInText,
      onPress: onSignIn || (() => router.push("/(overlays)/auth")),
    },
  ]);
};

/**
 * Check if user is authenticated and show prompt if not
 * Returns true if authenticated, false if not (and shows prompt)
 */
export const requireAuth = (
  isAuthenticated: boolean,
  options: AuthPromptOptions = {}
): boolean => {
  if (!isAuthenticated) {
    showAuthPrompt(options);
    return false;
  }

  return true;
};

/**
 * Higher-order function to wrap actions that require authentication
 */
export const withAuth = (
  isAuthenticated: boolean,
  action: () => void,
  options: AuthPromptOptions = {}
) => {
  return () => {
    if (requireAuth(isAuthenticated, options)) {
      action();
    }
  };
};

/**
 * React hook for authentication-protected actions
 */
export const useAuthAction = (options: AuthPromptOptions = {}) => {
  const { isAuthenticated } = useAuth();

  return (action: () => void) => {
    if (requireAuth(isAuthenticated, options)) {
      action();
    }
  };
};

/**
 * Perform complete logout process
 */
export const performLogout = async (): Promise<void> => {
  try {
    // Call server logout endpoint
    await authService.logout();
  } catch (error) {
    console.warn("Server logout failed:", error);
    // Continue with local logout even if server call fails
  }
  try {
    // Clear all local auth data
    await clearTokensFromStorage();

    // Emit logout event to update app state
    eventEmitter.emit(AppEvents.AUTH_LOGOUT);

    console.log("✅ Logout completed successfully");
  } catch (error) {
    console.error("❌ Error during logout:", error);
    throw error;
  }
};
