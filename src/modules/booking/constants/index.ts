/**
 * Booking module constants
 */

export const BOOKING_STEPS = {
  DATES: 'dates' as const,
  GUESTS: 'guests' as const,
  PAYMENT: 'payment' as const,
  CONFIRMATION: 'confirmation' as const,
} as const;

export const PAYMENT_TYPES = {
  CARD: 'card' as const,
  ZAAD: 'zaad' as const,
  TEST: 'test' as const,
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending' as const,
  CONFIRMED: 'confirmed' as const,
  PAID: 'paid' as const,
  FAILED: 'failed' as const,
} as const;

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed' as const,
  PENDING: 'pending' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export const ZAAD_CONFIG = {
  USSD_CODE: '*123*012345679#',
  BRAND_COLOR: '#00A651',
  NAME: 'ZAAD Mobile',
} as const;

export const TEST_PAYMENT_METHOD = {
  id: 'test-payment-method',
  type: PAYMENT_TYPES.TEST,
  isDefault: true,
  details: {
    brand: 'Test Card',
    last4: '1234',
    expiry: '01/2030',
  },
} as const;

export const DEFAULT_GUEST_COUNT = {
  adults: 1,
  children: 0,
  infants: 0,
  pets: 0,
} as const;

export const BOOKING_VALIDATION = {
  MIN_ADULTS: 1,
  MAX_GUESTS_DEFAULT: 4,
  MIN_NIGHTS: 1,
} as const;
