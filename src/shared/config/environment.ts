/**
 * Environment Configuration Utility
 * Combines secure configuration (not committed) with public environment settings
 * Note: In React Native, .env files don't work automatically like in Node.js
 */

import { ENVIRONMENT } from "./envConfig";
import { SECURE_CONFIG } from "./secure.config";

// Environment variable helper function with better typing
const getEnvVar = (key: string, defaultValue?: string): string => {
  // Try to get from process.env first (works in some setups)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] || defaultValue || "";
  }

  // Return default value for React Native
  return defaultValue || "";
};

// Boolean environment variable helper
const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
};

// Number environment variable helper
const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// App Configuration
export const APP_CONFIG = {
  name: "Hoy",
  version: "1.0.0",
  environment: ENVIRONMENT.name,
  apiVersion: "v1",
  isDevelopment: ENVIRONMENT.isDevelopment,
  isProduction: ENVIRONMENT.isProduction,
};

// API Configuration - Using secure configuration for sensitive data
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL,
  version: "v1",
};

// Cache Configuration
export const CACHE_CONFIG = {
  version: "1.1.0",
  ttl: 5000,
  sessionTtl: 43200000,
};

// External Services Configuration - Using secure configuration for API keys
export const EXTERNAL_SERVICES = {
  mapboxApiKey: SECURE_CONFIG.MAPBOX_API_KEY,
};

// Data Management Settings
export const DATA_SETTINGS = {
  enableDataIntegrityChecks: true,
  disableSearchResultsCache: true,
  forceFetchOnSearchResults: true,
  bypassSearchLoadingDelay: true,
};

// Export the environment variable helper functions for use elsewhere
export { getEnvVar, getEnvBoolean, getEnvNumber };
