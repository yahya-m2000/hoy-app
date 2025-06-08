import { useState, useCallback } from "react";
import { useAuth } from "@shared/context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@shared/services/core/client";

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
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        markAsUnauthenticated();
        return false;
      }

      // Make a test API call to trigger token refresh if needed
      // The API service will handle the actual refresh logic
      await api.get("/auth/me");
      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
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
          console.log(
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
