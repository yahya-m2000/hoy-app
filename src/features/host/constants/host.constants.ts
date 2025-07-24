/**
 * Host feature constants
 */

export const HOST_ROUTES = {
  DASHBOARD: '/host/dashboard',
  SETUP: '/host/setup',
  PROPERTIES: '/host/properties',
  CALENDAR: '/host/calendar',
  RESERVATIONS: '/host/reservations',
  REVIEWS: '/host/reviews',
  EARNINGS: '/host/earnings',
} as const;

export const HOST_SETUP_STEPS = {
  PROFILE: 'profile',
  PREFERENCES: 'preferences',
  POLICIES: 'policies',
  VERIFICATION: 'verification',
} as const;

export const DEFAULT_HOST_PREFERENCES = {
  email: true,
  push: true,
  sms: false,
  bookingRequests: true,
  messages: true,
  reviews: true,
  payments: true,
};