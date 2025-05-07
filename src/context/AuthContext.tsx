import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import api from "../services/api";
import * as authService from "../services/authService";
import * as userService from "../services/userService";
import { eventEmitter, AppEvents } from "../utils/eventEmitter";
import { clearUserData } from "../utils/clearUserData";
import { purgeAllUserData } from "../utils/purgeUserData";
import { useQueryClient } from "@tanstack/react-query";
import {
  performDataIntegrityCheck,
  setUserIdentity,
  clearUserIdentity,
} from "../utils/dataIntegrityCheck";

interface AuthContextType {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: (
    currentRefreshToken?: string | null
  ) => Promise<string | null>;
  loading: boolean;
  emergencyDataPurge: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  login: async () => {},
  logout: async () => {},
  refreshAccessToken: async () => null,
  loading: true,
  emergencyDataPurge: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Handler for auth logout event from API interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    };

    // Add event listener using our custom event emitter
    const unsubscribe = eventEmitter.on(
      AppEvents.AUTH_LOGOUT,
      handleAuthLogout
    );

    // Clean up
    return () => {
      unsubscribe();
    };
  }, []);

  // Clears all authentication data and caches
  const clearAuthData = async () => {
    console.log("Clearing authentication state...");

    // Clear state first
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear API auth header
    delete api.defaults.headers.common["Authorization"];

    // Clear React Query cache to prevent stale data from persisting
    queryClient.clear();
    queryClient.removeQueries({ queryKey: ["user"] });
    console.log("Query cache cleared");

    // Clear user identity data
    await clearUserIdentity();

    // Then use our comprehensive utility function to clean everything
    await clearUserData();
    console.log("Authentication data cleared");
  };

  // Initialize authentication from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing authentication state...");

        // First, run a data integrity check to detect any issues
        await performDataIntegrityCheck();

        const [token, refresh] = await Promise.all([
          AsyncStorage.getItem("accessToken"),
          AsyncStorage.getItem("refreshToken"),
        ]);

        if (token) {
          console.log("Found existing auth token, verifying session...");

          // Add a check to detect and fix potential session conflicts
          try {
            const previousUserId = await AsyncStorage.getItem("currentUserId");
            const userEmail = await AsyncStorage.getItem("userEmail");
            const loginTimestamp = await AsyncStorage.getItem("loginTimestamp");

            // Check if login is too old (session TTL exceeded)
            if (loginTimestamp) {
              const loginTime = parseInt(loginTimestamp, 10);
              const now = Date.now();
              const sessionAge = now - loginTime;
              const sessionTTL =
                Constants.expoConfig?.extra?.sessionTTL || 12 * 60 * 60 * 1000; // Default 12 hours

              if (sessionAge > sessionTTL) {
                console.warn(
                  `Session expired (age: ${sessionAge}ms, max: ${sessionTTL}ms), forcing logout`
                );
                await clearAuthData();
                setLoading(false);
                return;
              }
            }

            // Temporarily set token in state and header to fetch user data
            setAccessToken(token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            if (refresh) setRefreshToken(refresh);

            // Get current user from API to validate session
            const currentUser = await userService.getCurrentUser();

            // Check if we have a user ID mismatch (sign of cross-user data)
            if (previousUserId && currentUser._id !== previousUserId) {
              console.warn("User ID mismatch detected - clearing session data");
              await clearAuthData();
              return;
            }

            // Check if we have an email mismatch (another sign of cross-user data)
            if (userEmail && currentUser.email !== userEmail) {
              console.warn(
                "User email mismatch detected - clearing session data"
              );
              await clearAuthData();
              return;
            }

            // Everything looks good, store the current identifiers and user data
            await AsyncStorage.setItem("currentUserId", currentUser._id);
            await AsyncStorage.setItem("userEmail", currentUser.email);
            setUser(currentUser);
          } catch (error) {
            // If there's an error getting the user with current token,
            // attempt to refresh the token before giving up
            console.error("Error fetching current user:", error);
            if (refresh) {
              try {
                const newToken = await refreshAccessToken(refresh);
                if (newToken) {
                  const currentUser = await userService.getCurrentUser();
                  await AsyncStorage.setItem("currentUserId", currentUser._id);
                  await AsyncStorage.setItem("userEmail", currentUser.email);
                  setUser(currentUser);
                } else {
                  await clearAuthData();
                }
              } catch (refreshError) {
                console.error(
                  "Failed to refresh token during init:",
                  refreshError
                );
                await clearAuthData();
              }
            } else {
              await clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        await clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Starting login process...");

    try {
      // First, clear any existing data to prevent conflicts
      await clearAuthData();
      console.log("Previous auth data cleared");

      // Then proceed with the login
      const response = await authService.login({
        email,
        password,
      });

      const {
        accessToken: token,
        refreshToken: refresh,
        user: loggedUser,
      } = response;

      // Verify we have valid user data
      if (!loggedUser || !loggedUser._id) {
        console.error("Login returned invalid user data");
        throw new Error("Invalid user data received");
      }

      // Set user identity for integrity checks
      await setUserIdentity(loggedUser._id, loggedUser.email);
      console.log(`User identity set: ${loggedUser._id} / ${loggedUser.email}`);

      // Set tokens in state
      setAccessToken(token);
      setRefreshToken(refresh);
      setUser(loggedUser);

      // Set default auth header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Store tokens
      await AsyncStorage.setItem("accessToken", token);
      await AsyncStorage.setItem("refreshToken", refresh);

      // Store login timestamp to help track session freshness
      await AsyncStorage.setItem("loginTimestamp", Date.now().toString());

      // Notify system of login
      eventEmitter.emit(AppEvents.AUTH_LOGIN, { userId: loggedUser._id });

      console.log("Login completed successfully");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");

      // Try to logout on the server first to ensure the token gets blacklisted
      try {
        await authService.logout();
        console.log("Server logout successful");
      } catch (serverError) {
        console.error("Server logout error:", serverError);
        // Still continue with local logout
      }

      // Clear all auth data using our reusable function
      await clearAuthData();
    } catch (error) {
      console.error("Critical logout error:", error);
      // Try one more clearUserData as a backup
      await clearUserData();
    } finally {
      // Force another cache invalidation as safety measure
      queryClient.invalidateQueries();

      console.log("Logout process completed");

      // Force a reload of the app state to ensure clean state
      setTimeout(() => {
        console.log("Forcing app state refresh");
        // Emit event to notify app of logout completion
        eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);
      }, 300);
    }
  };
  const refreshAccessToken = async (currentRefreshToken?: string | null) => {
    try {
      console.log("Refreshing access token...");
      const tokenToUse = currentRefreshToken || refreshToken;

      if (!tokenToUse) {
        throw new Error("No refresh token available");
      }

      const tokens = await authService.refreshToken(tokenToUse);

      if (!tokens || !tokens.accessToken) {
        throw new Error("Invalid token response");
      }

      console.log("Token refresh successful");

      // Update state
      setAccessToken(tokens.accessToken);
      if (tokens.refreshToken) {
        setRefreshToken(tokens.refreshToken);
      }

      // Update auth header
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.accessToken}`;

      // Update storage
      await AsyncStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) {
        await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
      }

      // Update refresh timestamp
      await AsyncStorage.setItem("tokenRefreshedAt", Date.now().toString());

      // Notify system of token refresh
      eventEmitter.emit(AppEvents.TOKEN_REFRESHED);

      return tokens.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If token refresh fails, we need to clear everything to prevent stale state
      await clearAuthData();
      return null;
    }
  };

  // Complete data purge - emergency function to fix session issues
  const emergencyDataPurge = async () => {
    console.log("🚨 EMERGENCY DATA PURGE REQUESTED");

    try {
      // First, clear authentication data using our shared function
      await clearAuthData();

      // Then do a more thorough, complete data purge
      const success = await purgeAllUserData();

      if (!success) {
        console.error("Emergency data purge was not fully successful!");
      } else {
        console.log("✅ Emergency data purge completed successfully");
      }

      // Force a refresh of all queries
      queryClient.invalidateQueries();
      console.log("✅ All queries invalidated");

      // Notify any listeners that data has been purged
      eventEmitter.emit(AppEvents.AUTH_LOGOUT_COMPLETE);

      return success;
    } catch (error) {
      console.error("Critical error during emergency purge:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        refreshAccessToken,
        loading,
        emergencyDataPurge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
