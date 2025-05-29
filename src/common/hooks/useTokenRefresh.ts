import { useState, useCallback } from "react";
import { useAuth } from "@common-context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Custom hook for handling token refresh
 */
export function useTokenRefresh() {
  const { refreshAccessToken } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Attempts to refresh the access token
   * Returns true if successful, false otherwise
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      return false;
    }

    setIsRefreshing(true);
    try {
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const newAccessToken = await refreshAccessToken();
      return !!newAccessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAccessToken, isRefreshing]);
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
