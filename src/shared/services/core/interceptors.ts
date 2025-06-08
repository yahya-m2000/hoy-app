import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./client";
import * as authService from "../api/auth";
import { eventEmitter, AppEvents } from "@shared/utils";
import { isNetworkError, addToRetryQueue } from "@shared/utils/network";

// Track if we're already refreshing a token to prevent multiple refresh calls
let isRefreshing = false;
// Queue of requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

/**
 * Process queued requests after token refresh
 */
export const processQueue = (
  error: Error | null,
  token: string | null = null
) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Setup API interceptors for handling authentication and error states
 * This function should be called when the app initializes
 */
export const setupApiInterceptors = () => {
  // Request interceptor to add authorization header
  api.interceptors.request.use(
    async (config: any) => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        // Ensure headers object exists before accessing it
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  // Response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: any) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // Handle network errors - add to retry queue if appropriate
      if (isNetworkError(error) && originalRequest) {
        const retryFn = () => {
          console.log("Retrying previously failed request");
          return api(originalRequest);
        };

        // Add to retry queue for when network is restored
        addToRetryQueue(retryFn);

        // Log a cleaner message
        console.info(
          "Request will be retried when network connection is restored"
        );

        return Promise.reject(error);
      }

      // If error is not 401 or request has already been retried, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Check if error message indicates token expiration
      const responseData = error.response?.data as any;
      const isTokenExpired =
        responseData?.message?.includes("expired") ||
        responseData?.message === "Token expired";

      if (!isTokenExpired) {
        return Promise.reject(error);
      }

      // Mark this request as retried
      originalRequest._retry = true;

      // If we're already refreshing token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
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
              await AsyncStorage.removeItem("accessToken"); // Signal that authentication has failed using our custom event emitter
              eventEmitter.emit(AppEvents.AUTH_LOGOUT);

              processQueue(new Error("No refresh token available"));
              reject(error);
              return;
            }

            // Call refresh token endpoint
            const tokens = await authService.refreshToken(refreshToken);

            // Update tokens in storage
            await AsyncStorage.setItem("accessToken", tokens.accessToken);
            if (tokens.refreshToken) {
              await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
            }

            // Update header for this request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }

            // Process queued requests
            processQueue(null, tokens.accessToken);

            // Resolve with the updated request
            resolve(api(originalRequest));
          } catch (refreshError) {
            // Failed to refresh token
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken"); // Signal that authentication has failed using our custom event emitter
            eventEmitter.emit(AppEvents.AUTH_LOGOUT);

            processQueue(refreshError as Error);
            reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        })();
      });
    }
  );
};
