/**
 * Authentication Hooks
 * 
 * Custom hooks for authentication operations including:
 * - Token refresh functionality
 * - Authentication prompts
 * - Auth state management
 * 
 * @module @core/auth/hooks
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getRefreshTokenFromStorage, hasValidAuthentication } from "./storage";
import { api } from "@core/api/client";
import { AuthActionOptions } from "../types/auth.types";
import { logger } from "../utils/sys/log";
import { router } from "expo-router";

/**
 * Custom hook for handling token refresh
 * Note: The API service now handles token refresh automatically,
 * but this hook provides additional retry logic for specific use cases
 */
export function useTokenRefresh() {
  const { isAuthenticated, markAsUnauthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Attempts to refresh the access token using the API service
   * Returns true if successful, false otherwise
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing || !isAuthenticated) {
      return false;
    }

    setIsRefreshing(true);
    try {
      const refreshToken = await getRefreshTokenFromStorage();
      if (!refreshToken) {
        markAsUnauthenticated();
        return false;
      }

      // Make a test API call to trigger token refresh if needed
      // The API service will handle the actual refresh logic
      await api.get("/auth/me");
      return true;
    } catch (error) {
      logger.error("Token refresh error:", error);
      markAsUnauthenticated();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, isRefreshing, markAsUnauthenticated]);

  /**
   * Executes a function with automatic token refresh if it fails with 401
   * @param fn The function to execute with auto token refresh
   * @param retries Maximum number of refresh attempts (default: 1)
   */
  const withTokenRefresh = useCallback(
    async <T>(fn: () => Promise<T>, retries = 1): Promise<T> => {
      try {
        return await fn();
      } catch (error: any) {
        // Check if error is due to token expiration
        const is401 = error?.response?.status === 401;
        const isTokenError =
          error?.response?.data?.message === "Token expired" ||
          error?.response?.data?.message?.includes("token") ||
          error?.response?.data?.message?.includes("auth");

        if (is401 && isTokenError && retries > 0) {
          logger.log(
            `Token expired. Attempting refresh. Retries left: ${retries}`
          );

          // Try to refresh token and retry the operation
          const refreshed = await refreshToken();
          if (refreshed) {
            // Wait a short time before retrying to ensure token propagation
            await new Promise((resolve) => setTimeout(resolve, 200));
            return await withTokenRefresh(fn, retries - 1);
          }
        }

        // If refresh didn't work or error is not token-related, rethrow
        throw error;
      }
    },
    [refreshToken]
  );

  return {
    refreshToken,
    withTokenRefresh,
    isRefreshing,
  };
}

/**
 * Custom hook for auth actions that require authentication
 * Provides utilities to prompt user for authentication when needed
 */
export const useAuthAction = (options: AuthActionOptions = {}) => {
  const { isAuthenticated } = useAuth();

  /**
   * Execute an action that requires authentication
   * If user is not authenticated, show prompt or redirect to login
   */
  const executeWithAuth = useCallback(
    async (action: () => void | Promise<void>) => {
      if (!isAuthenticated) {
        // Navigate to authentication screen
        logger.log("Authentication required for this action - redirecting to login");
        router.push("/(auth)/login");
        
        if (options.onCancel) {
          options.onCancel();
        }
        return;
      }

      try {
        await action();
        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (error) {
        logger.error("Error executing authenticated action:", error);
        throw error;
      }
    },
    [isAuthenticated, options]
  );

  return {
    executeWithAuth,
    isAuthenticated,
  };
};

/**
 * Hook to check if user is authenticated
 * Uses secure storage instead of direct AsyncStorage access
 */
export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const authenticated = await hasValidAuthentication();
      setIsAuthenticated(authenticated);
      
      logger.debug("Authentication status checked", { authenticated }, {
        module: "AuthHooks"
      });
    } catch (error) {
      logger.error("Failed to check authentication status", error, {
        module: "AuthHooks"
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isLoading,
    refreshAuthStatus: checkAuthStatus,
  };
};

/**
 * Hook to get refresh token status
 * Uses secure storage instead of direct AsyncStorage access
 */
export const useRefreshToken = () => {
  const [hasRefreshToken, setHasRefreshToken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkRefreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use secure storage function instead of direct AsyncStorage
      const refreshToken = await getRefreshTokenFromStorage();
      setHasRefreshToken(!!refreshToken);
      
      logger.debug("Refresh token status checked", { hasRefreshToken: !!refreshToken }, {
        module: "AuthHooks"
      });
    } catch (error) {
      logger.error("Failed to check refresh token", error, {
        module: "AuthHooks"
      });
      setHasRefreshToken(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkRefreshToken();
  }, [checkRefreshToken]);

  return {
    hasRefreshToken,
    isLoading,
    refreshTokenStatus: checkRefreshToken,
  };
}; 