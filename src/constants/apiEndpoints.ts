/**
 * API endpoints constants
 * Use these constants when making API requests to ensure consistency
 * Note: All paths should be relative to the baseURL (which already includes /api/v1)
 */

// Property-related endpoints
export const PROPERTY_ENDPOINTS = {
  SEARCH: "/properties/search",
  FEATURED: "/properties/featured",
  NEARBY: "/properties/nearby",
  DETAILS: (id: string) => `/properties/${id}`,
  CALENDAR: (id: string) => `/properties/${id}/calendar`,
  UNITS: (id: string) => `/properties/${id}/units`,
  UNIT_DETAILS: (propertyId: string, unitId: string) =>
    `/properties/${propertyId}/units/${unitId}`,
  REVIEWS: (id: string) => `/properties/${id}/reviews`,
};

// Search-related endpoints
export const SEARCH_ENDPOINTS = {
  GENERAL: "/search",
  SUGGESTIONS: "/search/suggestions",
  NEARBY: "/search/nearby",
  TRENDING: "/search/trending",
};

// User-related endpoints
export const USER_ENDPOINTS = {
  PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/me",
  FAVORITES: "/users/me/favorites",
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

// Booking endpoints
export const BOOKING_ENDPOINTS = {
  CREATE: "/bookings",
  USER_BOOKINGS: "/bookings/me",
  DETAILS: (id: string) => `/bookings/${id}`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
};
