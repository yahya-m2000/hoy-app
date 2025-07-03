/**
 * API Configuration and Endpoints
 * Consolidated from api.ts and apiEndpoints.ts
 */

import { getEnv } from '@core/config/environment';

// API Base Configuration - get from environment configuration
export const API_BASE_URL = getEnv('API_URL');

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: process.env.EXPO_PUBLIC_AUTH_LOGIN || "/auth/login",
  REGISTER: process.env.EXPO_PUBLIC_AUTH_REGISTER || "/auth/register",
  REFRESH_TOKEN:
    process.env.EXPO_PUBLIC_AUTH_REFRESH_TOKEN || "/auth/refresh-token",
  FORGOT_PASSWORD:
    process.env.EXPO_PUBLIC_AUTH_FORGOT_PASSWORD || "/auth/forgot-password",
  RESET_PASSWORD:
    process.env.EXPO_PUBLIC_AUTH_RESET_PASSWORD || "/auth/reset-password",
};

// Property-related endpoints
export const PROPERTY_ENDPOINTS = {
  SEARCH: process.env.EXPO_PUBLIC_PROPERTY_SEARCH || "/properties",
  FEATURED: process.env.EXPO_PUBLIC_PROPERTY_FEATURED || "/properties/featured",
  NEARBY: process.env.EXPO_PUBLIC_PROPERTY_NEARBY || "/properties/nearby",
  DETAILS: (id: string) =>
    `${process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"}/${id}`,
  CALENDAR: (id: string) =>
    `${process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"}/${id}${
      process.env.EXPO_PUBLIC_PROPERTY_CALENDAR || "/calendar"
    }`,
  UNITS: (id: string) =>
    `${process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"}/${id}${
      process.env.EXPO_PUBLIC_PROPERTY_UNITS || "/units"
    }`,
  UNIT_DETAILS: (propertyId: string, unitId: string) =>
    `${
      process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"
    }/${propertyId}${
      process.env.EXPO_PUBLIC_PROPERTY_UNITS || "/units"
    }/${unitId}`,
  REVIEWS: (id: string) =>
    `${process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"}/${id}${
      process.env.EXPO_PUBLIC_PROPERTY_REVIEWS || "/reviews"
    }`,
  AVAILABILITY: (id: string) =>
    `${process.env.EXPO_PUBLIC_PROPERTY_DETAILS || "/properties"}/${id}${
      process.env.EXPO_PUBLIC_PROPERTY_AVAILABILITY || "/availability"
    }`,
};

// Search-related endpoints
export const SEARCH_ENDPOINTS = {
  GENERAL: process.env.EXPO_PUBLIC_SEARCH_GENERAL || "/search",
  SUGGESTIONS:
    process.env.EXPO_PUBLIC_SEARCH_SUGGESTIONS || "/search/suggestions",
  NEARBY: process.env.EXPO_PUBLIC_SEARCH_NEARBY || "/search/nearby",
  TRENDING: process.env.EXPO_PUBLIC_SEARCH_TRENDING || "/search/trending",
};

// User/traveler endpoints
export const USER_ENDPOINTS = {
  PROFILE: process.env.EXPO_PUBLIC_USER_PROFILE || "/user/profile",
  UPDATE_PROFILE:
    process.env.EXPO_PUBLIC_USER_UPDATE_PROFILE || "/user/profile",
  BOOKINGS: process.env.EXPO_PUBLIC_USER_BOOKINGS || "/user/bookings",
  BOOKING: (id: string) =>
    `${process.env.EXPO_PUBLIC_USER_BOOKINGS || "/user/bookings"}/${id}`,
  FAVORITES: process.env.EXPO_PUBLIC_USER_FAVORITES || "/user/favorites",
  MESSAGES: process.env.EXPO_PUBLIC_USER_MESSAGES || "/user/messages",
  MESSAGES_CONVERSATION: (id: string) =>
    `${process.env.EXPO_PUBLIC_USER_MESSAGES || "/user/messages"}/${id}`,
};

// Host endpoints
export const HOST_ENDPOINTS = {
  DASHBOARD: process.env.EXPO_PUBLIC_HOST_DASHBOARD || "/host/dashboard",
  PROPERTIES: process.env.EXPO_PUBLIC_HOST_PROPERTIES || "/host/properties",
  PROPERTY: (id: string) =>
    `${process.env.EXPO_PUBLIC_HOST_PROPERTIES || "/host/properties"}/${id}`,
  EARNINGS: process.env.EXPO_PUBLIC_HOST_EARNINGS || "/host/earnings",
  RESERVATIONS:
    process.env.EXPO_PUBLIC_HOST_RESERVATIONS || "/host/reservations",
  RESERVATION: (id: string) =>
    `${
      process.env.EXPO_PUBLIC_HOST_RESERVATIONS || "/host/reservations"
    }/${id}`,
  MESSAGES: process.env.EXPO_PUBLIC_HOST_MESSAGES || "/host/messages",
  MESSAGES_CONVERSATION: (id: string) =>
    `${process.env.EXPO_PUBLIC_HOST_MESSAGES || "/host/messages"}/${id}`,
  SETTINGS: process.env.EXPO_PUBLIC_HOST_SETTINGS || "/host/settings",
};

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  CREATE: process.env.EXPO_PUBLIC_BOOKING_CREATE || "/bookings",
  USER_BOOKINGS:
    process.env.EXPO_PUBLIC_BOOKING_USER_BOOKINGS || "/user/bookings",
  DETAILS: (id: string) =>
    `${process.env.EXPO_PUBLIC_BOOKING_CREATE || "/bookings"}/${id}`,
  CANCEL: (id: string) =>
    `${process.env.EXPO_PUBLIC_BOOKING_CREATE || "/bookings"}/${id}/cancel`,
  CHECK_IN: (id: string) =>
    `${process.env.EXPO_PUBLIC_BOOKING_CREATE || "/bookings"}/${id}/check-in`,
  CHECK_OUT: (id: string) =>
    `${process.env.EXPO_PUBLIC_BOOKING_CREATE || "/bookings"}/${id}/check-out`,
};

// Review endpoints
export const REVIEW_ENDPOINTS = {
  CREATE: (propertyId: string) => `/reviews/property/${propertyId}`,
  PROPERTY_REVIEWS: (propertyId: string) => `/reviews/property/${propertyId}`,
  PROPERTY_STATS: (propertyId: string) =>
    `/reviews/property/${propertyId}/stats`,
  ELIGIBILITY: (bookingId: string) => `/reviews/eligibility/${bookingId}`,
  RESPOND: (reviewId: string) => `/reviews/${reviewId}/respond`,
  REPORT: (reviewId: string) => `/reviews/${reviewId}/report`,
};

// Public endpoints that don't require authentication
export const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/properties",
  "/search",
  "/reviews/property",
  "/public",
  "/health",
  "/status",
] as const;

// Protected endpoints that always require authentication
export const PROTECTED_ENDPOINTS = [
  "/user",
  "/host",
  "/bookings",
  "/messages",
  "/favorites",
  "/profile",
] as const;

// Helper function to check if an endpoint is protected
export const isProtectedEndpoint = (url: string): boolean => {
  if (!url) return false;

  return PROTECTED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Helper function to check if an endpoint is public
export const isPublicEndpoint = (url: string, method?: string): boolean => {
  if (!url) return false;

  // First check if it's a protected endpoint (takes precedence)
  if (isProtectedEndpoint(url)) {
    return false;
  }

  return PUBLIC_ENDPOINTS.some((endpoint) => {
    if (!url.includes(endpoint)) return false;

    // Properties endpoint is public for GET requests only (but not host properties)
    if (endpoint === "/properties") {
      return (
        (!method || method.toUpperCase() === "GET") &&
        !url.includes("/host/") &&
        !url.includes("/bookings")
      );
    }

    // Status endpoint is public only for general status, not host status
    if (endpoint === "/status") {
      return !url.includes("/host/");
    }

    // Reviews property endpoint is public for GET requests only
    // (POST requests for creating reviews require authentication)
    if (endpoint === "/reviews/property") {
      return !method || method.toUpperCase() === "GET";
    }

    return true;
  });
};

// Legacy consolidated export for backwards compatibility
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  HOST: HOST_ENDPOINTS,
  USER: USER_ENDPOINTS,
  PROPERTIES: PROPERTY_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
  BOOKING: BOOKING_ENDPOINTS,
  REVIEW: REVIEW_ENDPOINTS,
};
