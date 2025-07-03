/**
 * API Request Utilities
 *
 * Provides helper functions for making API requests with consistent
 * headers, timeout handling, and error management.
 * 
 * @module @core/utils/api/request-utils
 * @author Hoy Development Team
 * @version 1.0.0
 */

import axios from "axios";
import { getTokenFromStorage } from "@core/utils/storage";
import { handleApiError } from "src/core/utils/network/api/error-interceptor";
import { AxiosRequestConfig, AxiosResponse } from '@core/types/api.types';

// Re-export for backward compatibility
export { AxiosRequestConfig, AxiosResponse };

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 15000;

// Base API URL - should be configured based on environment
const API_BASE_URL = "https://api.hoy.com";

/**
 * Get authorization headers with current token
 * @returns Headers object with authorization token
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getTokenFromStorage();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

/**
 * Create a configured axios instance with auth headers
 * @param config Additional axios config
 * @returns Configured axios instance
 */
export const createApiClient = async (
  config: AxiosRequestConfig = {}
): Promise<any> => {
  const headers = await getAuthHeaders();

  return axios.create({
    baseURL: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      ...headers,
      ...config.headers,
    },
    ...config,
  });
};

/**
 * Make an authenticated API request
 * @param endpoint API endpoint to call
 * @param options Request options
 * @returns Response data
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const client = await createApiClient();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await client(url, options);
    return response.data;
  } catch (error) {
          const errorDetails = handleApiError(error, `API Request: ${endpoint}`);
    throw errorDetails;
  }
};

/**
 * Helper to make GET requests
 * @param endpoint API endpoint
 * @param params Query parameters
 * @param options Additional axios options
 * @returns Response data
 */
export const get = async <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "GET",
    params,
    ...options,
  });
};

/**
 * Helper to make POST requests
 * @param endpoint API endpoint
 * @param data Request body data
 * @param options Additional axios options
 * @returns Response data
 */
export const post = async <T = any>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "POST",
    data,
    ...options,
  });
};

/**
 * Helper to make PUT requests
 * @param endpoint API endpoint
 * @param data Request body data
 * @param options Additional axios options
 * @returns Response data
 */
export const put = async <T = any>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    data,
    ...options,
  });
};

/**
 * Helper to make DELETE requests
 * @param endpoint API endpoint
 * @param params Query parameters
 * @param options Additional axios options
 * @returns Response data
 */
export const del = async <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "DELETE",
    params,
    ...options,
  });
}; 