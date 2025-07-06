/**
 * Booking Types
 * 
 * Comprehensive type definitions for booking-related operations including:
 * - Booking data structures
 * - Guest information
 * - Payment methods
 * - Booking flow states
 * 
 * @module @core/types
 * @author Hoy Development Team
 * @version 1.0.0
 */

// ========================================
// Guest Information Types
// ========================================

/**
 * Guest count information for booking
 */
export interface BookingGuestInfo {
  /** Number of adults */
  adults: number;
  /** Number of children */
  children: number;
  /** Number of infants */
  infants: number;
  /** Number of pets */
  pets: number;
}

/**
 * Booking date range
 */
export interface BookingDates {
  /** Check-in date */
  startDate: Date | null;
  /** Check-out date */
  endDate: Date | null;
}

// ========================================
// Pricing Types
// ========================================

/**
 * Detailed price breakdown for booking
 */
export interface BookingPriceDetails {
  /** Total booking price */
  totalPrice: number;
  /** Base price per night */
  basePrice?: number;
  /** Number of nights */
  nights?: number;
  /** Cleaning fee */
  cleaningFee?: number;
  /** Service fee */
  serviceFee?: number;
  /** Taxes and fees */
  taxes?: number;
  /** Host fee */
  hostFee?: number;
  /** Discount amount */
  discount?: number;
  /** Currency code */
  currency?: string;
}

// ========================================
// Contact Information Types
// ========================================

/**
 * Guest contact information
 */
export interface BookingContactInfo {
  /** Full name */
  name: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Emergency contact name */
  emergencyContactName?: string;
  /** Emergency contact phone */
  emergencyContactPhone?: string;
}

// ========================================
// Payment Types
// ========================================

/**
 * Payment method details
 */
export interface PaymentMethodDetails {
  /** Card brand (visa, mastercard, etc.) */
  brand?: string;
  /** Last 4 digits of card */
  last4?: string;
  /** Expiry date */
  expiry?: string;
  /** Cardholder name */
  name?: string;
  /** Associated phone number */
  phone?: string;
  /** Billing address */
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Payment method structure
 */
export interface PaymentMethod {
  /** Payment method ID */
  id: string;
  /** Payment type */
  type: 'card' | 'zaad' | 'paypal' | 'bank_transfer' | 'test';
  /** Whether this is the default payment method */
  isDefault: boolean;
  /** Payment method details */
  details: PaymentMethodDetails;
  /** Whether the method is verified */
  isVerified?: boolean;
  /** Creation date */
  createdAt?: string;
}

// ========================================
// Booking Form Types
// ========================================

/**
 * Form data used in the booking confirmation modal
 */
export interface BookingFormData {
  /** Selected dates */
  startDate: Date | null;
  /** End date */
  endDate: Date | null;
  /** Guest information */
  guests: BookingGuestInfo;
  /** Selected payment method */
  paymentMethod: PaymentMethod | null;
  /** Special requests or notes */
  specialRequests: string;
  /** Contact information */
  contactInfo?: BookingContactInfo;
  /** Promotional code */
  promoCode?: string;
}

// ========================================
// API Data Types
// ========================================

/**
 * API booking creation data structure
 */
export interface BookingApiData {
  /** Property identifier */
  propertyId: string;
  /** Unit identifier (for multi-unit properties) */
  unitId?: string;
  /** Check-in date (ISO string) */
  checkIn: string;
  /** Check-out date (ISO string) */
  checkOut: string;
  /** Total guest count */
  guestCount: number;
  /** Detailed guest breakdown */
  guests: BookingGuestInfo;
  /** Total booking price */
  totalPrice: number;
  /** Special requests */
  specialRequests?: string;
  /** Guest contact information */
  contactInfo: BookingContactInfo;
  /** Payment method type */
  paymentType: string;
  /** Payment status */
  paymentStatus: string;
  /** Payment transaction ID */
  paymentId?: string;
  /** Currency code */
  currency?: string;
  /** Promotional code */
  promoCode?: string;
}

// ========================================
// Availability and Pricing Params
// ========================================

/**
 * Parameters for checking booking availability
 */
export interface BookingAvailabilityParams {
  /** Property identifier */
  propertyId: string;
  /** Unit identifier (optional) */
  unitId?: string;
  /** Check-in date (ISO string) */
  checkIn: string;
  /** Check-out date (ISO string) */
  checkOut: string;
  /** Total guest count */
  guestCount: number;
}

/**
 * Parameters for calculating booking price
 */
export type BookingPriceParams = BookingAvailabilityParams & {
  /** Promotional code */
  promoCode?: string;
};

// ========================================
// Booking Flow Types
// ========================================

/**
 * Props for booking step components
 */
export interface BookingStepProps {
  /** Function to proceed to next step */
  onNext: () => void;
  /** Function to go back to previous step */
  onBack?: () => void;
  /** Whether the step is currently loading */
  isLoading?: boolean;
  /** Current booking data */
  bookingData?: Partial<BookingFormData>;
  /** Function to update booking data */
  updateBookingData?: (data: Partial<BookingFormData>) => void;
}

/**
 * Available booking steps
 */
export type BookingStep = 'dates' | 'guests' | 'payment' | 'confirmation' | 'complete';

/**
 * Complete booking flow state
 */
export interface BookingState {
  /** Current step in the booking flow */
  step: BookingStep;
  /** Selected dates */
  dates: BookingDates;
  /** Guest information */
  guests: BookingGuestInfo;
  /** Selected payment method */
  paymentMethod: PaymentMethod | null;
  /** Price breakdown */
  priceDetails: BookingPriceDetails | null;
  /** Availability status */
  isAvailable: boolean | null;
  /** Whether checking availability */
  isCheckingAvailability: boolean;
  /** General loading state */
  loading: boolean;
  /** Special requests */
  specialRequests: string;
  /** Contact information */
  contactInfo?: BookingContactInfo;
  /** Error message */
  error?: string;
  /** Booking ID after successful creation */
  bookingId?: string;
}

// ========================================
// Booking Status Types
// ========================================

/**
 * Possible booking statuses
 */
export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'in_progress'
  | 'refunded'
  | 'disputed';

/**
 * Booking payment status options
 */
export type BookingPaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

// ========================================
// Booking Entity Type
// ========================================

/**
 * Complete booking entity
 */
export interface Booking {
  /** Booking identifier */
  _id: string;
  /** Property identifier */
  propertyId: string;
  /** Property details */
  property?: {
    title: string;
    location: string;
    images: string[];
  };
  /** Unit identifier */
  unitId?: string;
  /** Guest user ID */
  guestId: string;
  /** Host user ID */
  hostId: string;
  /** Check-in date */
  checkIn: string;
  /** Check-out date */
  checkOut: string;
  /** Guest information */
  guests: BookingGuestInfo;
  /** Total guest count */
  guestCount: number;
  /** Contact information */
  contactInfo: BookingContactInfo;
  /** Price breakdown */
  pricing: BookingPriceDetails;
  /** Total amount (legacy field) */
  totalAmount: number;
  /** Total price (actual field from API) */
  totalPrice: number;
  /** Currency */
  currency: string;
  /** Booking status */
  status: BookingStatus;
  /** Payment status */
  paymentStatus: BookingPaymentStatus;
  /** Payment method used */
  paymentMethod: string;
  /** Payment transaction ID */
  paymentId?: string;
  /** Special requests */
  specialRequests?: string;
  /** Promotional code used */
  promoCode?: string;
  /** Cancellation reason */
  cancellationReason?: string;
  /** Refund amount */
  refundAmount?: number;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Whether booking has been reviewed */
  hasReview?: boolean;
  /** Review ID if exists */
  reviewId?: string;
}

/**
 * Populated booking entity with related data
 * Extends the base Booking with fully populated related entities
 */
export interface PopulatedBooking extends Booking {
  /** Populated property details */
  property: {
    _id: string;
    title: string;
    location: string;
    locationString: string;
    images: string[];
    rating?: number;
    reviewCount?: number;
    hostId: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    price: number;
    currency: string;
  };
  /** Populated guest details */
  guest: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    verified: boolean;
  };
  /** Populated host details */
  host: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    verified: boolean;
    hostSince: string;
    responseRate?: number;
    responseTime?: string;
  };
}

// ========================================
// HOST BOOKING SPECIFIC TYPES
// ========================================

/**
 * Filters for host booking queries
 */
export interface HostBookingFilters {
  /** Filter by property ID */
  propertyId?: string;
  /** Filter by booking status */
  status?: string;
  /** Filter by start date */
  startDate?: string;
  /** Filter by end date */
  endDate?: string;
  /** Page number for pagination */
  page?: number;
  /** Items per page limit */
  limit?: number;
}

/**
 * Bookings organized by date for calendar views
 */
export interface BookingsByDate {
  [date: string]: PopulatedBooking[];
}

/**
 * Dashboard statistics for booking overview
 */
export interface BookingDashboardStats {
  /** Number of check-ins today */
  todayCheckIns: number;
  /** Number of check-outs today */
  todayCheckOuts: number;
  /** Number of upcoming bookings */
  upcomingBookings: number;
  /** Total revenue amount */
  totalRevenue: number;
  /** Property occupancy rate */
  occupancyRate: number;
  /** Total number of properties */
  totalProperties: number;
  /** Number of currently active bookings */
  activeBookings: number;
}

/**
 * Today's booking activities for host dashboard
 */
export interface TodayBookings {
  /** Today's check-ins */
  checkIns: PopulatedBooking[];
  /** Today's check-outs */
  checkOuts: PopulatedBooking[];
  /** Current ongoing stays */
  currentStays: PopulatedBooking[];
}

// ========================================
// CALENDAR BOOKING TYPES
// ========================================

/**
 * Property unit interface for booking context
 */
export interface PropertyUnit {
  /** Unit ID */
  _id: string;
  /** Unit name/number */
  name: string;
  /** Unit type */
  type: string;
  /** Maximum guests */
  maxGuests: number;
  /** Bedrooms */
  bedrooms: number;
  /** Bathrooms */
  bathrooms: number;
  /** Unit amenities */
  amenities: string[];
  /** Unit price */
  price: number;
  /** Whether unit is available */
  isAvailable: boolean;
}

/**
 * Calendar event interface for booking context
 */
export interface CalendarEvent {
  /** Event ID */
  _id: string;
  /** Event start date */
  startDate: string;
  /** Event end date */
  endDate: string;
  /** Whether dates are booked */
  isBooked: boolean;
  /** Associated booking ID if booked */
  bookingId?: string;
  /** Event title/description */
  title?: string;
  /** Event type */
  type: 'booking' | 'blocked' | 'maintenance' | 'personal';
}

/**
 * Detailed booking data from API responses (used in calendar views)
 */
export interface DetailedBookingData {
  _id: string;
  userId: string;
  unitId?: string | null;
  propertyId: {
    _id: string;
    hostId: string;
    name: string;
    type: string;
    propertyType: string;
    description: string;
    images: string[];
    price: number;
    currency: string;
    amenities: string[];
    bedrooms: number;
    beds: number;
    bathrooms: number;
    maxGuests: number;
    rating: number;
    reviewCount: number;
    reviews?: string[];
    isActive: boolean;
    isFeatured: boolean;
    isSuperHost: boolean;
    units?: PropertyUnit[];
    calendar?: CalendarEvent[];
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
    permissions?: {
      canManageBookings: boolean;
      canCheckInGuests: boolean;
      canManageUnits: boolean;
      canHandleFinances: boolean;
    };
    cancellationPolicy?: {
      policyType: string;
      description: string;
      nonRefundableFees: string[];
      refundPercentages: {
        _id: string;
        immediate: number;
        beforeDays: number;
        percentage: number;
      }[];
    };
    houseRules?: {
      checkInTime: {
        from: string;
        to: string;
      };
      quietHours: {
        from: string;
        to: string;
      };
      checkOutTime: string;
      smokingAllowed: boolean;
      petsAllowed: boolean;
      partiesAllowed: boolean;
      additionalRules: string[];
    };
    safetyFeatures?: {
      securityCameras: {
        exterior: boolean;
        interior: boolean;
        description: string;
      };
      smokeDetector: boolean;
      carbonMonoxideDetector: boolean;
      fireExtinguisher: boolean;
      firstAidKit: boolean;
      weaponsOnProperty: boolean;
      dangerousAnimals: boolean;
      additionalSafetyInfo: string[];
    };
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  paymentStatus: string;
  bookingStatus: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  cancellationDetails: {
    refundAmount: number;
    refundProcessed: boolean;
    cancellationFee: number;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * Simplified booking data for calendar display
 */
export interface CalendarBookingData {
  id: string;
  startDate: Date;
  endDate: Date;
  guestName: string;
  guestAvatar?: string;
  status: "past" | "active" | "upcoming";
  totalPrice: number;
}
