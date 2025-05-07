import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventEmitter, AppEvents } from "../utils/eventEmitter";
import NetInfo from "@react-native-community/netinfo";

// Use expoConfig for baseURL, fallback to localhost
const apiBaseUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1";

// Log the API Base URL to make it easier to debug
console.log("API Base URL:", apiBaseUrl);
console.log(
  "IMPORTANT: The baseURL already includes /api/v1 - don't add it in endpoint paths"
);

// Maximum number of retries for network errors
const MAX_RETRIES = 3;
// Initial retry delay in ms (will be increased exponentially)
const INITIAL_RETRY_DELAY = 1000;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    // Add a cache control header to prevent browser caching
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Track if we're already refreshing a token to prevent multiple refresh calls
let isRefreshing = false;
// Queue of requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

// Check network connectivity before making requests
const checkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
    throw new Error("Network Error: No internet connection available");
  }
  return true;
};

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add cache control headers and handle user context
api.interceptors.request.use(
  async (config: any) => {
    // Check network connectivity before making request
    const isConnected = await checkConnection();
    if (!isConnected) {
      return Promise.reject(
        new Error("No internet connection. Please check your network settings.")
      );
    }

    // Add retry count to config if not already present
    if (config._retryCount === undefined) {
      config._retryCount = 0;
    }

    // Add robust cache busting parameters to all GET requests
    if (config.method?.toLowerCase() === "get") {
      // Get cache version from app config
      const cacheVersion = Constants.expoConfig?.extra?.cacheVersion || "1.0.0";
      const userId = (await AsyncStorage.getItem("currentUserId")) || "none";

      config.params = {
        ...config.params,
        _t: Date.now(), // Add timestamp to prevent caching
        _v: cacheVersion, // Add version to invalidate cache across app updates
        _u: userId.substring(0, 8), // Add partial user ID to separate user caches
        _r: Math.random().toString(36).substring(2, 8), // Add random string as extra precaution
      };
    }

    // Add enhanced cache control headers
    config.headers = {
      ...config.headers,
      "Cache-Control": "no-cache, no-store, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
      "X-User-Cache-Key":
        (await AsyncStorage.getItem("currentUserId")) || "none",
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and check user data integrity
api.interceptors.response.use(
  async (response: any) => {
    // Check if this is a user data response and verify it's for the correct user
    try {
      if (
        response?.config?.url?.includes("/users/me") &&
        response?.data?.data
      ) {
        const userId = await AsyncStorage.getItem("currentUserId"); // If we have a user ID stored and this doesn't match, something's wrong
        if (
          userId &&
          response.data.data?._id &&
          response.data.data._id !== userId
        ) {
          console.error(
            "USER DATA MISMATCH DETECTED: Response contains data for a different user!"
          );

          // Add a flag to indicate data integrity issue
          response.headers["X-Data-Integrity-Error"] = "true";

          // Still return response to avoid breaking the app, but mark it as corrupted
          response.data._corrupted = true;
        }
      }
    } catch (err) {
      // Don't fail on integrity checks
      console.warn("Error checking data integrity", err);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if error message indicates token expiration
    const isTokenExpired =
      error.response?.data?.message?.includes("expired") ||
      error.response?.data?.message === "Token expired";

    if (!isTokenExpired) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If we're already refreshing token, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    // Try to refresh the token
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");

          if (!refreshToken) {
            // No refresh token available, redirect to login
            await AsyncStorage.removeItem("accessToken"); // Signal auth context to update
            eventEmitter.emit(AppEvents.AUTH_LOGOUT);
            processQueue(new Error("No refresh token available"));
            reject(error);
            return;
          } // Call refresh token endpoint
          const response = await axios.post(
            `${apiBaseUrl}/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          // Define proper interface for token response
          interface TokenResponse {
            data: {
              accessToken: string;
              refreshToken?: string;
            };
          }

          const { accessToken, refreshToken: newRefreshToken } = (
            response.data as TokenResponse
          ).data;

          // Update tokens in storage
          await AsyncStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
          }

          // Update header for future requests
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          // Resolve with the updated request
          resolve(api(originalRequest));
        } catch (refreshError) {
          // Failed to refresh token, clean up and redirect to login
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken"); // Signal auth context to update
          eventEmitter.emit(AppEvents.AUTH_LOGOUT);

          processQueue(new Error("Failed to refresh token"));
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      })();
    });
  }
);

// Add a response interceptor to handle network errors and implement retry logic
api.interceptors.response.use(
  (response) => {
    // Return response as is for successful requests
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a network error
    const isNetworkError = !error.response;

    if (isNetworkError) {
      // If we haven't retried yet, let's retry the request
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Retry the request after a delay
        await new Promise((resolve) =>
          setTimeout(resolve, INITIAL_RETRY_DELAY)
        );

        return api(originalRequest);
      }

      // If we've retried the maximum number of times, reject the promise
      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;

        // Exponential backoff for retry delay
        const retryDelay =
          INITIAL_RETRY_DELAY * 2 ** originalRequest._retryCount;

        // Retry the request after the calculated delay
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
