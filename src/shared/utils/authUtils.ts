/**
 * Authentication utilities for handling unauthenticated user actions
 */
import { Alert } from "react-native";
import { router } from "expo-router";
// Note: Removed circular imports - these will need to be passed as parameters
import { clearTokensFromStorage } from "./storage";
import { eventEmitter, AppEvents } from "./eventEmitter";

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
 * Note: This has been moved to avoid circular dependencies
 * Use the AuthContext directly instead of this utility
 */
// Commented out to break circular dependency - use AuthContext directly
// export const useAuthAction = (options: AuthPromptOptions = {}) => {
//   const { isAuthenticated } = useAuth();
//
//   return (action: () => void) => {
//     if (requireAuth(isAuthenticated, options)) {
//       action();
//     }
//   };
// };

/**
 * Perform complete logout process
 * @param logoutFn - Logout function from auth service to avoid circular import
 */
export const performLogout = async (
  logoutFn?: () => Promise<void>
): Promise<void> => {
  try {
    // Call server logout endpoint if provided
    if (logoutFn) {
      await logoutFn();
    }
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
