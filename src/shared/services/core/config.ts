/**
 * Custom Axios instance for React Native
 * This file creates an axios instance that avoids using Node.js crypto module
 */
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  logRequest,
  logResponse,
  logError,
} from "../../utils/network/networkLogger";
import { API_BASE_URL } from "../../constants/api";

// Get API base URL from environment or use default - ensure proper URL formatting
const AXIOS_API_BASE_URL = formatApiUrl(
  API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1"
);

// Format URL to ensure it has proper structure
function formatApiUrl(url: string): string {
  // Make sure URL has proper protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url;
  }

  // Remove trailing slash for consistency
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Create axios instance with baseURL
const axiosInstance = axios.create({
  baseURL: AXIOS_API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to add auth token - use async properly
let authToken: string | null = null;

// Pre-load the token
AsyncStorage.getItem("accessToken")
  .then((token) => {
    if (token) authToken = token;
  })
  .catch((err) => console.error("Error loading auth token:", err));

// Use interceptor with pre-loaded token
axiosInstance.interceptors.request.use(
  (config) => {
    // Use the cached token
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Log the request
    logRequest(
      config.method?.toUpperCase() || "GET",
      `${config.baseURL || ""}${config.url || ""}`,
      config.data
    );

    return config;
  },
  (error) => {
    logError(error.config?.url || "request error", error);
    return Promise.reject(error);
  }
);

// Add response interceptor with logging
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    logResponse(response.config.url || "", response.status, response.data);
    return response;
  },
  (error) => {
    // Log errors
    logError(error.config?.url || "unknown URL", error);
    return Promise.reject(error);
  }
);

// Add another interceptor to validate URLs before requests are sent
axiosInstance.interceptors.request.use((config) => {
  // Make sure the URL is valid
  try {
    // For absolute URLs in the request
    if (
      config.url &&
      (config.url.startsWith("http://") || config.url.startsWith("https://"))
    ) {
      // Verify it's a valid URL by trying to construct it
      new URL(config.url);
    } else if (config.url && config.baseURL) {
      // For relative URLs, combine with baseURL and validate
      const fullUrl = `${config.baseURL}${
        config.url.startsWith("/") ? config.url : `/${config.url}`
      }`;
      new URL(fullUrl);
    }
    return config;
  } catch (error) {
    console.error("Invalid URL in request:", config.url, error);
    throw new Error(`Invalid URL format: ${config.url}`);
  }
});

// Function to update the cached auth token
export const updateAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    authToken = token;
  } catch (err) {
    console.error("Error updating auth token:", err);
  }
};

// Export the instance
export default axiosInstance;

// Export type for internal use
export type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
};
