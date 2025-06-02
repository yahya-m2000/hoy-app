// API constants
export const API_BASE_URL =
  "https://41ea-109-147-151-140.ngrok-free.app/api/v1"; // Replace with your actual API URL

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  // Host endpoints
  HOST: {
    DASHBOARD: "/host/dashboard",
    PROPERTIES: "/host/properties",
    PROPERTY: (id: string) => `/host/properties/${id}`,
    EARNINGS: "/host/earnings",
    RESERVATIONS: "/host/reservations",
    RESERVATION: (id: string) => `/host/reservations/${id}`,
    MESSAGES: "/host/messages",
    MESSAGES_CONVERSATION: (id: string) => `/host/messages/${id}`,
    SETTINGS: "/host/settings",
  },

  // User/traveler endpoints
  USER: {
    PROFILE: "/user/profile",
    BOOKINGS: "/user/bookings",
    BOOKING: (id: string) => `/user/bookings/${id}`,
    FAVORITES: "/user/favorites",
    MESSAGES: "/user/messages",
    MESSAGES_CONVERSATION: (id: string) => `/user/messages/${id}`,
  },

  // Property endpoints
  PROPERTIES: {
    SEARCH: "/properties/search",
    DETAILS: (id: string) => `/properties/${id}`,
    REVIEWS: (id: string) => `/properties/${id}/reviews`,
    AVAILABILITY: (id: string) => `/properties/${id}/availability`,
  },
};
