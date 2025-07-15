/**
 * Constants for reservation components
 * 
 * @module @features/properties/components/reservation/constants/reservationConstants
 */

export const RESERVATION_STEPS = {
  GUEST_DETAILS: 1,
  PAYMENT_METHOD: 2,
  CONFIRMATION: 3,
} as const;

export const TAB_CONTEXTS = {
  HOME: 'home',
  SEARCH: 'search',
  WISHLIST: 'wishlist',
  BOOKINGS: 'bookings',
  PROPERTIES: 'properties',
} as const;

export const DEFAULT_GUEST_COUNTS = {
  ADULTS: 1,
  CHILDREN: 0,
  INFANTS: 0,
  PETS: 0,
} as const;

export const MAX_GUESTS = 10;

export const STEP_TITLES = {
  [RESERVATION_STEPS.GUEST_DETAILS]: 'reservation.guestDetails',
  [RESERVATION_STEPS.PAYMENT_METHOD]: 'reservation.paymentMethod',
  [RESERVATION_STEPS.CONFIRMATION]: 'reservation.confirmReservation',
} as const;

export const CONFIRMATION_ROUTES = {
  [TAB_CONTEXTS.HOME]: '/(tabs)/traveler/home/property/confirmation',
  [TAB_CONTEXTS.SEARCH]: '/(tabs)/traveler/search/property/confirmation',
  [TAB_CONTEXTS.WISHLIST]: '/(tabs)/traveler/wishlist/property/confirmation',
  [TAB_CONTEXTS.BOOKINGS]: '/(tabs)/traveler/bookings/property/confirmation',
  [TAB_CONTEXTS.PROPERTIES]: '/(tabs)/traveler/properties/property/confirmation',
} as const;

export const BUTTON_TEXTS = {
  NEXT: 'Next',
  CONFIRM_RESERVATION: 'Confirm Reservation',
  BACK: 'Back',
} as const;

export const ERROR_MESSAGES = {
  MISSING_PROPERTY: 'Property information is required to make a reservation.',
  MISSING_BOOKING_INFO: 'Missing required booking information',
  BOOKING_FAILED: 'Failed to create booking. Please try again.',
  SUCCESS: 'Reservation created successfully!',
} as const;

export const TIMING = {
  NAVIGATION_DELAY: 100, // ms
} as const; 