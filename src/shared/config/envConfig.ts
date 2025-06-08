/**
 * Environment-specific configuration
 * This file can be modified for different deployment environments
 */

// Environment Detection
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";
const isProduction = !__DEV__ && process.env.NODE_ENV === "production";

// Development Configuration
const developmentConfig = {
  API_BASE_URL: "https://31d3-109-147-151-140.ngrok-free.app/api/v1",
  MAPBOX_API_KEY:
    "sk.eyJ1IjoieW0yMDAwIiwiYSI6ImNtOXg2ZDMzajB4ZmQyaXM2cWNnamEzOHUifQ.PxAYNN4I-PHTU3MDjxZRYA",
  ENABLE_LOGGING: true,
  ENABLE_DEBUG_MODE: true,
};

// Production Configuration
const productionConfig = {
  API_BASE_URL: "https://your-production-api.com/api/v1", // Replace with actual production URL
  MAPBOX_API_KEY:
    "sk.eyJ1IjoieW0yMDAwIiwiYSI6ImNtOXg2ZDMzajB4ZmQyaXM2cWNnamEzOHUifQ.PxAYNN4I-PHTU3MDjxZRYA",
  ENABLE_LOGGING: false,
  ENABLE_DEBUG_MODE: false,
};

// Export the appropriate configuration based on environment
export const ENV_CONFIG = isDevelopment ? developmentConfig : productionConfig;

// Helper to easily switch environments
export const ENVIRONMENT = {
  isDevelopment,
  isProduction,
  name: isDevelopment ? "development" : "production",
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_REFRESH_TOKEN: "/auth/refresh-token",
  AUTH_FORGOT_PASSWORD: "/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/auth/reset-password",

  // Properties
  PROPERTY_SEARCH: "/properties/search",
  PROPERTY_FEATURED: "/properties/featured",
  PROPERTY_NEARBY: "/properties/nearby",
  PROPERTY_DETAILS: "/properties",
  PROPERTY_CALENDAR: "/calendar",
  PROPERTY_UNITS: "/units",
  PROPERTY_REVIEWS: "/reviews",
  PROPERTY_AVAILABILITY: "/availability",

  // Search
  SEARCH_GENERAL: "/search",
  SEARCH_SUGGESTIONS: "/search/suggestions",
  SEARCH_NEARBY: "/search/nearby",
  SEARCH_TRENDING: "/search/trending",

  // User
  USER_PROFILE: "/user/profile",
  USER_UPDATE_PROFILE: "/users/me",
  USER_BOOKINGS: "/user/bookings",
  USER_FAVORITES: "/user/favorites",
  USER_MESSAGES: "/user/messages",

  // Host
  HOST_DASHBOARD: "/host/dashboard",
  HOST_PROPERTIES: "/host/properties",
  HOST_EARNINGS: "/host/earnings",
  HOST_RESERVATIONS: "/host/reservations",
  HOST_MESSAGES: "/host/messages",
  HOST_SETTINGS: "/host/settings",

  // Bookings
  BOOKING_CREATE: "/bookings",
  BOOKING_USER_BOOKINGS: "/bookings/me",
};

export default ENV_CONFIG;
