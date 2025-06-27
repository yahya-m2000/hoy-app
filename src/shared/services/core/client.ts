import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventEmitter, AppEvents } from "@shared/utils/eventEmitter";
import NetInfo from "../../utils/network/netInfoCompat";
import { API_BASE_URL, ENDPOINTS, isPublicEndpoint } from "../../constants/api";
import { jwtDecode } from "jwt-decode";
import {
  hasValidAuthentication,
  markTokensAsInvalid,
  clearTokenInvalidation,
} from "@shared/utils/storage/authStorage";

// Request validation utilities
const validateRequest = (config: any): { isValid: boolean; error?: string } => {
  // Check if URL is properly formatted
  if (!config.url && !config.baseURL) {
    return { isValid: false, error: "No URL provided for request" };
  }

  // Check if method is valid
  const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  if (config.method && !validMethods.includes(config.method.toUpperCase())) {
    return { isValid: false, error: `Invalid HTTP method: ${config.method}` };
  }

  // Validate headers
  if (config.headers) {
    // Check for potential security issues
    const dangerousHeaders = ["x-forwarded-for", "x-real-ip"];
    for (const header of dangerousHeaders) {
      if (config.headers[header.toLowerCase()]) {
        console.warn(`⚠️ Potentially dangerous header detected: ${header}`);
      }
    }
  }

  return { isValid: true };
};

// Enhanced error classification
const classifyError = (
  error: any
): { type: string; severity: "low" | "medium" | "high"; retry: boolean } => {
  if (!error.response) {
    // Network error
    return { type: "network", severity: "high", retry: true };
  }

  const status = error.response.status;

  if (status >= 500) {
    return { type: "server", severity: "high", retry: true };
  } else if (status === 429) {
    return { type: "rate_limit", severity: "medium", retry: true };
  } else if (status === 401) {
    return { type: "authentication", severity: "medium", retry: false };
  } else if (status === 403) {
    return { type: "authorization", severity: "medium", retry: false };
  } else if (status >= 400) {
    return { type: "client", severity: "low", retry: false };
  }

  return { type: "unknown", severity: "medium", retry: false };
};

// Use expoConfig for baseURL, fallback to localhost
const apiBaseUrl =
  API_BASE_URL ||
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

// Circuit breaker pattern for failing endpoints
const endpointFailures = new Map<
  string,
  { count: number; lastFailure: number }
>();
const CIRCUIT_BREAKER_THRESHOLD = 5; // Fail after 5 consecutive failures
const CIRCUIT_BREAKER_TIMEOUT = 60000; // Reset after 1 minute

const isCircuitBreakerOpen = (url: string): boolean => {
  const failures = endpointFailures.get(url);
  if (!failures) return false;

  const now = Date.now();

  // Reset if enough time has passed
  if (now - failures.lastFailure > CIRCUIT_BREAKER_TIMEOUT) {
    endpointFailures.delete(url);
    return false;
  }

  return failures.count >= CIRCUIT_BREAKER_THRESHOLD;
};

const recordEndpointFailure = (url: string): void => {
  const failures = endpointFailures.get(url) || { count: 0, lastFailure: 0 };
  failures.count += 1;
  failures.lastFailure = Date.now();
  endpointFailures.set(url, failures);

  if (failures.count >= CIRCUIT_BREAKER_THRESHOLD) {
    console.warn(
      `🔥 Circuit breaker OPEN for ${url} (${failures.count} failures)`
    );
  }
};

const recordEndpointSuccess = (url: string): void => {
  endpointFailures.delete(url);
};

// Clear circuit breaker state for auth endpoints (they should never be blocked)
const clearAuthEndpointFailures = (): void => {
  const authEndpoints = [
    `${apiBaseUrl}${ENDPOINTS.AUTH.LOGIN}`,
    `${apiBaseUrl}${ENDPOINTS.AUTH.REGISTER}`,
    `${apiBaseUrl}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    `${apiBaseUrl}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
    `${apiBaseUrl}${ENDPOINTS.AUTH.RESET_PASSWORD}`,
  ];

  authEndpoints.forEach((endpoint) => {
    endpointFailures.delete(endpoint);
  });

  console.log("🔧 Cleared circuit breaker state for auth endpoints");
};

// Clear auth endpoint failures on startup
clearAuthEndpointFailures();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
    // Add a cache control header to prevent browser caching
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    // Add ngrok header to skip browser warning
    "ngrok-skip-browser-warning": "true",
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
    }; // Validate the request first
    const validation = validateRequest(config);
    if (!validation.isValid) {
      console.error("Invalid request:", validation.error);
      return Promise.reject(new Error(validation.error));
    } // Check circuit breaker before making request (but skip for auth endpoints)
    const requestUrl = config.url || config.baseURL || "";
    const isAuthRequest =
      config.url &&
      (config.url.includes(ENDPOINTS.AUTH.LOGIN) ||
        config.url.includes(ENDPOINTS.AUTH.REGISTER) ||
        config.url.includes(ENDPOINTS.AUTH.REFRESH_TOKEN) ||
        config.url.includes(ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
        config.url.includes(ENDPOINTS.AUTH.RESET_PASSWORD));

    if (!isAuthRequest && isCircuitBreakerOpen(requestUrl)) {
      console.warn(
        `🔥 Circuit breaker OPEN for ${requestUrl} - request blocked`
      );
      const error = new Error(`Service temporarily unavailable: ${requestUrl}`);
      error.name = "CircuitBreakerError";
      return Promise.reject(error);
    }

    // Check if this is a request that requires authentication    // Skip token checks for auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      config.url &&
      (config.url.includes(ENDPOINTS.AUTH.LOGIN) ||
        config.url.includes(ENDPOINTS.AUTH.REGISTER) ||
        config.url.includes(ENDPOINTS.AUTH.REFRESH_TOKEN));

    // Use the improved public endpoint detection
    const isPublic = config.url && isPublicEndpoint(config.url, config.method);
    if (!isAuthEndpoint && !isPublic) {
      // Check if user has valid authentication before making the request
      const hasValidAuth = await hasValidAuthentication();

      if (!hasValidAuth) {
        console.log(
          "Authentication invalid - blocking API request to:",
          config.url
        );
        const error = new Error("Authentication required - user not logged in");
        error.name = "AuthenticationError";
        return Promise.reject(error);
      }
      try {
        // Get current access token
        const accessToken = await AsyncStorage.getItem("accessToken");

        // Check if token exists and is expired or about to expire (within 5 minutes)
        if (accessToken) {
          const decoded: any = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          const expiresIn = decoded.exp - currentTime;

          // If token expires in less than 5 minutes, refresh it proactively
          if (expiresIn < 300) {
            // 5 minutes in seconds
            console.log(
              `Token expires in ${expiresIn.toFixed(
                1
              )} seconds. Refreshing proactively...`
            );

            // Check if we've tried to refresh recently to prevent excessive refreshes
            const lastAttemptStr = await AsyncStorage.getItem(
              "lastTokenRefreshAttempt"
            );
            const lastAttempt = lastAttemptStr
              ? parseInt(lastAttemptStr, 10)
              : 0;
            const timeSinceLastAttempt = Date.now() - lastAttempt;

            // Only attempt refresh if it's been more than 30 seconds since last attempt
            if (timeSinceLastAttempt > 30000) {
              const refreshed = await ensureValidToken();
              if (refreshed) {
                // Get the new token
                const newToken = await AsyncStorage.getItem("accessToken");
                if (newToken) {
                  // Update the Authorization header for this request
                  config.headers["Authorization"] = `Bearer ${newToken}`;
                  console.log("Successfully refreshed token proactively");
                }
              } else {
                console.warn("Failed to refresh token proactively");
              }
            } else {
              console.log(
                `Skipping proactive refresh (attempted ${(
                  timeSinceLastAttempt / 1000
                ).toFixed(1)}s ago)`
              );
            }
          } // If we have a token, always add it to the request
          if (!config.headers["Authorization"] && accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
          }
        }
      } catch (error) {
        console.error("Error checking token in request interceptor:", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and check user data integrity
api.interceptors.response.use(
  async (response: any) => {
    // Record successful request for circuit breaker (excluding auth endpoints)
    const requestUrl = response?.config?.url || response?.config?.baseURL || "";
    const isAuthRequest =
      response?.config?.url &&
      (response.config.url.includes(ENDPOINTS.AUTH.LOGIN) ||
        response.config.url.includes(ENDPOINTS.AUTH.REGISTER) ||
        response.config.url.includes(ENDPOINTS.AUTH.REFRESH_TOKEN) ||
        response.config.url.includes(ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
        response.config.url.includes(ENDPOINTS.AUTH.RESET_PASSWORD));

    if (requestUrl && !isAuthRequest) {
      recordEndpointSuccess(requestUrl);
    }

    // Check if this is a user data response and verify it's for the correct user
    try {
      if (
        response?.config?.url?.includes("/users/me") &&
        response?.data?.data &&
        // Only check user profile endpoints, not other user-related endpoints
        (response?.config?.url === "/users/me" ||
          response?.config?.url?.endsWith("/users/me"))
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

    // If no config, can't retry - reject immediately
    if (!originalRequest) {
      console.error("API error (no config) - cannot retry request");
      return Promise.reject(error);
    }

    // Classify the error for better handling
    const errorInfo = classifyError(error);
    console.log(
      `📊 Error classified as: ${errorInfo.type} (severity: ${errorInfo.severity})`
    );

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Log detailed error information for debugging
      if (error.response) {
        console.error(`API Error ${error.response.status}:`, {
          url: originalRequest.url,
          method: originalRequest.method,
          status: error.response.status,
          message: error.response.data?.message || "Unknown error",
          type: errorInfo.type,
        });
      } else {
        console.error(`Network Error:`, {
          url: originalRequest.url,
          method: originalRequest.method,
          message: error.message,
          type: errorInfo.type,
        });
      }
      return Promise.reject(error);
    }

    // Check if error message indicates token expiration
    const isTokenExpired =
      error.response?.data?.message?.includes("expired") ||
      error.response?.data?.message === "Token expired" ||
      error.response?.data?.message?.includes("token");

    if (!isTokenExpired) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If we're already refreshing token, queue this request
    if (isRefreshing) {
      console.log("Token refresh already in progress, queueing request");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          console.log("Queue processed, retrying request with new token");
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          console.error("Failed queue processing:", err);
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
            console.error("No refresh token available, logging out");
            await AsyncStorage.removeItem("accessToken");
            await markTokensAsInvalid();
            eventEmitter.emit(AppEvents.AUTH_LOGOUT);
            processQueue(new Error("No refresh token available"));
            reject(error);
            return;
          }

          // Use the correct refresh token endpoint directly
          // Since apiBaseUrl already includes /api/v1, we need to build the full URL correctly
          const refreshEndpoint = `${apiBaseUrl}${ENDPOINTS.AUTH.REFRESH_TOKEN}`;
          console.log(`Attempting token refresh at: ${refreshEndpoint}`);
          console.log(
            `Using refresh token starting with: ${refreshToken?.substring(
              0,
              10
            )}...`
          );

          // Record token refresh attempt timestamp
          await AsyncStorage.setItem(
            "lastTokenRefreshAttempt",
            Date.now().toString()
          );

          const response = await axios.post(
            refreshEndpoint,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                // Include Authorization header with refresh token as well (alternative method)
                Authorization: `Bearer ${refreshToken}`,
                // Add device info to help with debugging
                "X-Device-Info": Constants.deviceName || "unknown",
                "X-App-Version": Constants.expoConfig?.version || "unknown",
              },
              withCredentials: true,
            }
          );
          console.log("Token refresh successful");
          await AsyncStorage.setItem(
            "lastTokenRefreshSuccess",
            Date.now().toString()
          );

          // Clear any token invalidation flags on successful refresh
          await clearTokenInvalidation();

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
            console.log("Saved new refresh token");
          } else {
            console.log("No new refresh token provided, keeping existing one");
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
        } catch (refreshError: any) {
          // Log detailed error information to help with debugging
          console.error("Error refreshing token:", refreshError);
          console.error(
            "Refresh error status:",
            refreshError?.response?.status
          );
          console.error(
            "Refresh error data:",
            JSON.stringify(refreshError?.response?.data)
          );

          // Record token refresh failure
          await AsyncStorage.setItem(
            "lastTokenRefreshFailure",
            JSON.stringify({
              timestamp: Date.now(),
              status: refreshError?.response?.status || "no_response",
              message: refreshError?.message || "Unknown error",
            })
          ); // Only logout if there's an actual auth error, not just network issues
          // Network issues might be temporary, so we don't want to log users out unnecessarily
          if (
            refreshError?.response?.status === 401 ||
            refreshError?.response?.status === 403
          ) {
            // Failed to refresh token, clean up and redirect to login
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken");
            await markTokensAsInvalid();
            eventEmitter.emit(AppEvents.AUTH_LOGOUT);
          } else if (!refreshError?.response) {
            // Network error - might be temporary, keep tokens
            console.log(
              "Network error during token refresh - will retry on next request"
            );
          }

          processQueue(
            new Error(
              `Failed to refresh token: ${
                refreshError?.message || "Unknown error"
              }`
            )
          );
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
    const originalRequest = error.config; // Record endpoint failure for circuit breaker (but not for auth endpoints or circuit breaker errors)
    if (originalRequest && error.name !== "CircuitBreakerError") {
      const requestUrl = originalRequest.url || originalRequest.baseURL || "";
      const isAuthRequest =
        originalRequest.url &&
        (originalRequest.url.includes(ENDPOINTS.AUTH.LOGIN) ||
          originalRequest.url.includes(ENDPOINTS.AUTH.REGISTER) ||
          originalRequest.url.includes(ENDPOINTS.AUTH.REFRESH_TOKEN) ||
          originalRequest.url.includes(ENDPOINTS.AUTH.FORGOT_PASSWORD) ||
          originalRequest.url.includes(ENDPOINTS.AUTH.RESET_PASSWORD));

      if (requestUrl && !isAuthRequest) {
        recordEndpointFailure(requestUrl);
      }
    }

    // If no config, can't retry - reject immediately
    if (!originalRequest) {
      console.error("API error (no config) - cannot retry request");
      return Promise.reject(error);
    } // Check if this is a network error
    const isNetworkError = !error.response;
    const errorInfo = classifyError(error);

    // Log error information for debugging
    console.log(
      `📊 Error classified as: ${errorInfo.type} (severity: ${errorInfo.severity}, retry: ${errorInfo.retry})`
    );

    if (isNetworkError) {
      console.log(
        `🔄 Network error detected, retry count: ${
          originalRequest._retryCount || 0
        }/${MAX_RETRIES}`
      );

      // If we haven't retried yet, let's retry the request
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Check network connectivity before retry
        try {
          await checkConnection();
          console.log("📡 Network connectivity confirmed, retrying request");
        } catch (connectionError) {
          const errorMsg =
            connectionError instanceof Error
              ? connectionError.message
              : "Unknown connection error";
          console.error(
            "📵 No network connectivity, aborting retry:",
            errorMsg
          );
          return Promise.reject(error);
        }

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

        console.log(
          `⏰ Retrying in ${retryDelay}ms (attempt ${originalRequest._retryCount}/${MAX_RETRIES})`
        );

        // Retry the request after the calculated delay
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        return api(originalRequest);
      }

      console.error(
        `❌ Max retries (${MAX_RETRIES}) exceeded for network error`
      );
    }

    // For rate limiting errors, add special handling
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Default 5 seconds

      if ((originalRequest._retryCount || 0) < MAX_RETRIES) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        console.log(`⏳ Rate limited, retrying after ${delay}ms`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Decode and check if a token is expired
 * @param token JWT token to check
 * @returns true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Add 30 second buffer to prevent edge cases
    return decoded.exp < currentTime - 30;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Check if access token is valid and refresh if needed
 * Call this before making critical API calls to ensure a valid token
 * @returns Promise resolving to true if token is valid or was refreshed successfully
 */
export const ensureValidToken = async (): Promise<boolean> => {
  try {
    // Record token refresh attempt timestamp
    await AsyncStorage.setItem(
      "lastTokenRefreshAttempt",
      Date.now().toString()
    );

    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    // If no tokens, we can't do anything
    if (!refreshToken) {
      console.log("No refresh token available, can't ensure valid token");
      return false;
    }

    // If access token is still valid, no need to refresh
    if (accessToken && !isTokenExpired(accessToken)) {
      // Log token information for debugging
      try {
        const decoded: any = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        const expiresIn = decoded.exp - currentTime;
        console.log(
          `Access token valid for ${expiresIn.toFixed(
            1
          )} more seconds. No refresh needed.`
        );
      } catch (e) {
        console.warn("Error decoding token during expiry check:", e);
      }
      return true;
    }

    console.log("Access token expired or missing, attempting refresh");

    // Check if we've tried to refresh too recently (prevent hammering the server)
    const lastSuccessStr = await AsyncStorage.getItem(
      "lastTokenRefreshSuccess"
    );
    const lastSuccess = lastSuccessStr ? parseInt(lastSuccessStr, 10) : 0;
    const timeSinceLastSuccess = Date.now() - lastSuccess;

    // If we successfully refreshed within the last 5 seconds, don't try again
    if (lastSuccessStr && timeSinceLastSuccess < 5000) {
      console.log(
        `Skipping refresh - token was just refreshed ${(
          timeSinceLastSuccess / 1000
        ).toFixed(1)}s ago`
      );
      return true;
    }

    // Token is expired or missing, try to refresh
    const refreshEndpoint = `${apiBaseUrl}${ENDPOINTS.AUTH.REFRESH_TOKEN}`;
    console.log(`Attempting token refresh at: ${refreshEndpoint}`);
    console.log(
      `Using refresh token starting with: ${refreshToken?.substring(0, 10)}...`
    );

    // Use device info to help with debugging
    const deviceInfo = {
      deviceName: Constants.deviceName || "unknown",
      deviceId: Constants.installationId || "unknown",
      appVersion: Constants.expoConfig?.version || "unknown",
      osVersion: Constants.systemVersion || "unknown",
    };

    const response = await axios.post(
      refreshEndpoint,
      {
        refreshToken,
        deviceInfo, // Include device info in request body for debugging
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
          "X-Device-Info": JSON.stringify(deviceInfo),
        },
        withCredentials: true,
        timeout: 10000, // 10 second timeout for token refresh
      }
    );

    // Record token refresh success timestamp
    await AsyncStorage.setItem(
      "lastTokenRefreshSuccess",
      Date.now().toString()
    );

    interface TokenResponse {
      data: {
        accessToken: string;
        refreshToken?: string;
      };
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = (
      response.data as TokenResponse
    ).data;

    // Update tokens in storage
    await AsyncStorage.setItem("accessToken", newAccessToken);
    if (newRefreshToken) {
      await AsyncStorage.setItem("refreshToken", newRefreshToken);
      console.log("Saved new refresh token");
    } else {
      console.log("No new refresh token provided, keeping existing one");
    }

    // Update header for future requests
    api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

    // Verify the new token
    try {
      const decoded: any = jwtDecode(newAccessToken);
      const currentTime = Date.now() / 1000;
      const expiresIn = decoded.exp - currentTime;
      console.log(`New token valid for ${(expiresIn / 60).toFixed(1)} minutes`);

      // Save token metadata for debugging
      await AsyncStorage.setItem(
        "tokenMetadata",
        JSON.stringify({
          refreshedAt: Date.now(),
          expiresAt: decoded.exp * 1000,
          userId: decoded.userId || decoded.sub,
          iat: decoded.iat,
        })
      );
    } catch (e) {
      console.warn("Error decoding refreshed token:", e);
    }

    console.log("Token refreshed successfully via ensureValidToken");
    return true;
  } catch (error: any) {
    console.error("Failed to ensure valid token:", error);

    // Record token refresh failure with detailed information
    await AsyncStorage.setItem(
      "lastTokenRefreshFailure",
      JSON.stringify({
        timestamp: Date.now(),
        status: error?.response?.status || "no_response",
        message: error?.message || "Unknown error",
        data: error?.response?.data || {},
        url: error?.config?.url || "unknown",
      })
    );

    // Check if this is a fatal auth error
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      // Increment failure counter to track persistent auth issues
      const failCountStr =
        (await AsyncStorage.getItem("tokenRefreshFailCount")) || "0";
      const failCount = parseInt(failCountStr, 10) + 1;
      await AsyncStorage.setItem("tokenRefreshFailCount", failCount.toString());

      // If we've had multiple auth failures, consider logging out
      if (failCount >= 3) {
        console.error(
          "Multiple token refresh failures detected, user may need to re-authenticate"
        );

        // Only emit logout event if this is a persistent auth issue, not just a temporary network error
        if (failCount >= 5) {
          eventEmitter.emit(AppEvents.AUTH_LOGOUT);

          // Reset counter after logout
          await AsyncStorage.setItem("tokenRefreshFailCount", "0");
        }
      }
    } else {
      // For network errors or server errors, don't increment failure counter
      console.log("Non-auth error during token refresh - may be temporary");
    }

    return false;
  }
};

/**
 * Validate the refresh token flow by testing various scenarios
 * This is useful for development and troubleshooting
 * @returns Object with test results
 */
export const validateTokenRefreshFlow = async () => {
  const results: Record<string, any> = {
    hasAccessToken: false,
    hasRefreshToken: false,
    accessTokenValid: false,
    accessTokenExpiry: null,
    refreshSuccess: false,
    apiCallSuccess: false,
    errors: [],
  };

  try {
    // Step 1: Check if we have tokens
    const accessToken = await AsyncStorage.getItem("accessToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    results.hasAccessToken = !!accessToken;
    results.hasRefreshToken = !!refreshToken;

    // Step 2: Check if access token is valid
    if (accessToken) {
      try {
        const decoded: any = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;
        const expiresIn = decoded.exp - currentTime;

        results.accessTokenValid = !isTokenExpired(accessToken);
        results.accessTokenExpiry = {
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          expiresIn: expiresIn,
          expiresInMinutes: (expiresIn / 60).toFixed(1),
          decoded: {
            sub: decoded.sub || decoded.userId,
            iat: decoded.iat,
            exp: decoded.exp,
          },
        };
      } catch (err) {
        const error = err as Error;
        results.errors.push({ stage: "decoding", error: error.message });
      }
    }

    // Step 3: Test token refresh
    if (refreshToken) {
      try {
        const refreshed = await ensureValidToken();
        results.refreshSuccess = refreshed; // If refresh succeeded, get updated token info
        if (refreshed) {
          const newToken = await AsyncStorage.getItem("accessToken");
          if (newToken) {
            try {
              const decoded: any = jwtDecode(newToken);
              results.newTokenInfo = {
                expiresAt: new Date(decoded.exp * 1000).toISOString(),
                expiresIn: decoded.exp - Date.now() / 1000,
                decoded: {
                  sub: decoded.sub || decoded.userId,
                  iat: decoded.iat,
                  exp: decoded.exp,
                },
              };
            } catch (err) {
              const error = err as Error;
              results.errors.push({
                stage: "decoding_new_token",
                error: error.message,
              });
            }
          }
        }
      } catch (err) {
        const error = err as Error;
        results.errors.push({ stage: "refresh", error: error.message });
      }
    } // Step 4: Test API call with refreshed token
    try {
      // Make a test API call to user profile endpoint
      const response = await api.get(`/users/me`);
      results.apiCallSuccess = true;
      // Type assertion for the response
      interface ApiResponse {
        data: {
          data?: {
            _id?: string;
            email?: string;
            name?: string;
          };
        };
      }

      const typedResponse = response as ApiResponse;
      results.userData = {
        userId: typedResponse.data.data?._id,
        email: typedResponse.data.data?.email,
        name: typedResponse.data.data?.name,
      };
    } catch (err) {
      results.apiCallSuccess = false;
      const error = err as any; // Using any for axios error which has a complex structure
      results.errors.push({
        stage: "api_call",
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Step 5: Get debug info from storage
    try {
      const lastRefreshAttempt = await AsyncStorage.getItem(
        "lastTokenRefreshAttempt"
      );
      const lastRefreshSuccess = await AsyncStorage.getItem(
        "lastTokenRefreshSuccess"
      );
      const lastRefreshFailure = await AsyncStorage.getItem(
        "lastTokenRefreshFailure"
      );
      const tokenMetadata = await AsyncStorage.getItem("tokenMetadata");
      const failCount = await AsyncStorage.getItem("tokenRefreshFailCount");

      results.debugInfo = {
        lastRefreshAttempt: lastRefreshAttempt
          ? new Date(parseInt(lastRefreshAttempt, 10)).toISOString()
          : null,
        lastRefreshSuccess: lastRefreshSuccess
          ? new Date(parseInt(lastRefreshSuccess, 10)).toISOString()
          : null,
        lastRefreshFailure: lastRefreshFailure
          ? JSON.parse(lastRefreshFailure)
          : null,
        tokenMetadata: tokenMetadata ? JSON.parse(tokenMetadata) : null,
        failCount: failCount ? parseInt(failCount, 10) : 0,
        deviceInfo: {
          deviceName: Constants.deviceName,
          installationId: Constants.installationId,
          appVersion: Constants.expoConfig?.version,
          osVersion: Constants.systemVersion,
        },
      };
    } catch (err) {
      const error = err as Error;
      results.errors.push({ stage: "debug_info", error: error.message });
    }

    return results;
  } catch (err) {
    const error = err as Error;
    results.errors.push({ stage: "overall_validation", error: error.message });
    return results;
  }
};

export default api;
