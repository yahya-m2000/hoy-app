/**
 * Authentication Context
 * Provides centralized authentication state management to prevent repeated auth checks
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  hasValidAuthentication,
  setAuthStateChangeCallback,
  saveTokenToStorage,
  saveRefreshTokenToStorage,
  clearTokensFromStorage,
  markTokensAsInvalid,
} from "@shared/utils/storage/authStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@shared/services";
import { setUserIdentity, clearUserIdentity } from "@shared/utils/validation";
import { debugTokenStorage } from "@shared/utils";

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  checkAuthenticationState: () => Promise<void>;
  markAsUnauthenticated: () => void;
  markAsAuthenticated: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const checkAuthenticationState = async () => {
    try {
      const authenticated = await hasValidAuthentication();
      setIsUserAuthenticated(authenticated);
      setIsAuthChecked(true);

      // Only log once during initial check
      if (!isAuthChecked) {
        if (!authenticated) {
          console.log("🚫 User not authenticated");
        } else {
          console.log("✅ User authenticated");
        }
      }
    } catch (error) {
      console.error("❌ Error checking authentication:", error);
      setIsUserAuthenticated(false);
      setIsAuthChecked(true);
    }
  };
  const markAsUnauthenticated = () => {
    setIsUserAuthenticated(false);
    setIsAuthChecked(true);
    console.log("🚫 Marked as unauthenticated");
  };
  const markAsAuthenticated = () => {
    setIsUserAuthenticated(true);
    setIsAuthChecked(true);
    console.log("✅ Marked as authenticated");
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("🔐 Starting login process...");

      // Call the auth service to perform login
      const loginResponse = await authService.login({ email, password });

      console.log("🔐 Login API call successful, storing tokens...");

      // Store tokens in AsyncStorage
      await saveTokenToStorage(loginResponse.accessToken);
      if (loginResponse.refreshToken) {
        await saveRefreshTokenToStorage(loginResponse.refreshToken);
      }

      // Store user ID for data integrity checks
      await AsyncStorage.setItem(
        "currentUserId",
        loginResponse.user.id || loginResponse.user._id
      );

      // Set user identity for integrity checks
      await setUserIdentity(
        loginResponse.user.id || loginResponse.user._id,
        loginResponse.user.email
      );
      console.log("✅ Tokens stored successfully");

      // Debug: Check what's actually stored
      await debugTokenStorage();

      // Update auth state
      markAsAuthenticated();
      console.log("✅ Login completed successfully");
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🔓 Starting logout process...");

      // Clear tokens from storage
      await clearTokensFromStorage();

      // Mark tokens as invalid
      await markTokensAsInvalid();
      // Clear user identity
      await clearUserIdentity();

      console.log("✅ Tokens cleared successfully");

      // Update auth state
      markAsUnauthenticated();

      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      // Still mark as unauthenticated even if clearing fails
      markAsUnauthenticated();
    }
  }; // Check authentication once on mount
  useEffect(() => {
    // Register callback for auth state changes
    setAuthStateChangeCallback((isAuthenticated) => {
      setIsUserAuthenticated(isAuthenticated);
      setIsAuthChecked(true);
    });

    // Initial auth check
    checkAuthenticationState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const value: AuthContextType = {
    isAuthenticated: isUserAuthenticated,
    isAuthChecked,
    checkAuthenticationState,
    markAsUnauthenticated,
    markAsAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
