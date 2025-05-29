/**
 * Authentication utilities for handling unauthenticated user actions
 */
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@common/context/AuthContext";

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
      onPress: onSignIn || (() => router.push("/(modals)/common/auth")),
    },
  ]);
};

/**
 * Check if user is authenticated and show prompt if not
 * Returns true if authenticated, false if not (and shows prompt)
 */
export const requireAuth = (
  user: any,
  accessToken: string | null,
  options: AuthPromptOptions = {}
): boolean => {
  const isAuthenticated = !!(user && accessToken);

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
  user: any,
  accessToken: string | null,
  action: () => void,
  options: AuthPromptOptions = {}
) => {
  return () => {
    if (requireAuth(user, accessToken, options)) {
      action();
    }
  };
};

/**
 * React hook for authentication-protected actions
 */
export const useAuthAction = (options: AuthPromptOptions = {}) => {
  const { user, accessToken } = useAuth();

  return (action: () => void) => {
    if (requireAuth(user, accessToken, options)) {
      action();
    }
  };
};
