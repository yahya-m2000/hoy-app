/**
 * Reservation Types
 * 
 * Comprehensive type definitions for reservation management including:
 * - Reservation data structures
 * - Status and payment tracking
 * - Filtering and statistics
 * - Guest and property information
 * 
 * @module @core/types/reservation
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { BaseEntity } from './common.types';

// ========================================
// RESERVATION STATUS TYPES
// ========================================

/**
 * Reservation status options
 */
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

/**
 * Payment status options
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial' | 'failed';

// ========================================
// CORE RESERVATION TYPE
// ========================================

/**
 * Complete reservation interface
 */
export interface Reservation extends BaseEntity {
  /** Guest user ID */
  guestId: string;
  /** Guest full name */
  guestName: string;
  /** Guest profile photo URL */
  guestPhoto?: string;
  /** Host user ID */
  hostId: string;
  /** Associated property ID */
  propertyId: string;
  /** Property title/name */
  propertyTitle: string;
  /** Property location */
  propertyLocation: string;
  /** Property main image URL */
  propertyImage?: string;
  /** Check-in date (YYYY-MM-DD) */
  checkIn: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOut: string;
  /** Number of guests */
  guestCount: number;
  /** Total booking amount */
  totalAmount: number;
  /** Currency code */
  currency: string;
  /** Reservation status */
  status: ReservationStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Last update timestamp */
  updatedAt: string;
  
  // Additional computed properties for component compatibility
  /** Alias for guestCount */
  guests?: number;
  /** Whether payment is completed */
  isPaid?: boolean;
  /** Number of nights */
  nights?: number;
  /** Average nightly rate */
  nightlyRate?: number;
  /** Service fees */
  serviceFee?: number;
  /** Taxes amount */
  taxes?: number;
  /** Cleaning fee */
  cleaningFee?: number;
  /** Cancellation reason */
  cancellationReason?: string;
  /** Special requests from guest */
  specialRequests?: string;
  /** Host notes */
  hostNotes?: string;
  /** Guest contact information */
  guestContact?: {
    email?: string;
    phone?: string;
  };
}

// ========================================
// FILTER & SEARCH TYPES
// ========================================

/**
 * Reservation filter options
 */
export interface ReservationFilter {
  /** Status filter */
  status?: ReservationStatus | 'all';
  /** Property ID filter */
  propertyId?: string;
  /** Start date filter */
  startDate?: string;
  /** End date filter */
  endDate?: string;
  /** Payment status filter */
  paymentStatus?: PaymentStatus;
  /** Guest name search */
  guestName?: string;
  /** Minimum amount filter */
  minAmount?: number;
  /** Maximum amount filter */
  maxAmount?: number;
  /** Currency filter */
  currency?: string;
  /** Date range type */
  dateRangeType?: 'check_in' | 'check_out' | 'created' | 'updated';
}

/**
 * Reservation search parameters
 */
export interface ReservationSearchParams extends ReservationFilter {
  /** Search query */
  query?: string;
  /** Sort field */
  sortBy?: 'checkIn' | 'checkOut' | 'createdAt' | 'totalAmount' | 'status';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Results per page */
  limit?: number;
  /** Page offset */
  offset?: number;
}

// ========================================
// STATISTICS TYPES
// ========================================

/**
 * Reservation statistics breakdown
 */
export interface ReservationStats {
  /** Total reservations count */
  total: number;
  /** Pending reservations count */
  pending: number;
  /** Confirmed reservations count */
  confirmed: number;
  /** Cancelled reservations count */
  cancelled: number;
  /** Completed reservations count */
  completed: number;
  /** Rejected reservations count */
  rejected: number;
  /** Revenue breakdown by status */
  revenue: {
    /** Total revenue amount */
    total: number;
    /** Pending revenue amount */
    pending: number;
    /** Confirmed revenue amount */
    confirmed: number;
    /** Completed revenue amount */
    completed: number;
  };
  /** Average booking value */
  averageBookingValue?: number;
  /** Average length of stay */
  averageStayLength?: number;
  /** Occupancy rate percentage */
  occupancyRate?: number;
  /** Cancellation rate percentage */
  cancellationRate?: number;
}

/**
 * Reservation analytics by time period
 */
export interface ReservationAnalytics {
  /** Monthly breakdown */
  monthly: Array<{
    month: string;
    count: number;
    revenue: number;
    averageValue: number;
  }>;
  /** Weekly breakdown */
  weekly: Array<{
    week: string;
    count: number;
    revenue: number;
  }>;
  /** Daily breakdown */
  daily: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  /** Top performing properties */
  topProperties: Array<{
    propertyId: string;
    propertyTitle: string;
    reservationCount: number;
    totalRevenue: number;
    averageRating: number;
  }>;
}

// ========================================
// RESERVATION ACTIONS TYPES
// ========================================

/**
 * Reservation action types
 */
export type ReservationAction = 'confirm' | 'reject' | 'cancel' | 'check_in' | 'check_out' | 'modify';

/**
 * Reservation action request
 */
export interface ReservationActionRequest {
  /** Reservation ID */
  reservationId: string;
  /** Action to perform */
  action: ReservationAction;
  /** Action reason/notes */
  reason?: string;
  /** Additional action data */
  data?: Record<string, string | number | boolean>;
}

/**
 * Reservation modification request
 */
export interface ReservationModificationRequest {
  /** Reservation ID to modify */
  reservationId: string;
  /** New check-in date */
  newCheckIn?: string;
  /** New check-out date */
  newCheckOut?: string;
  /** New guest count */
  newGuestCount?: number;
  /** Modification reason */
  reason: string;
  /** Price adjustment */
  priceAdjustment?: number;
}

// ========================================
// LIST & DISPLAY TYPES
// ========================================

/**
 * Reservation list item for table/list display
 */
export interface ReservationListItem {
  /** Reservation ID */
  id: string;
  /** Guest name */
  guestName: string;
  /** Guest avatar */
  guestAvatar?: string;
  /** Property name */
  propertyName: string;
  /** Check-in date */
  checkIn: string;
  /** Check-out date */
  checkOut: string;
  /** Guest count */
  guests: number;
  /** Total amount */
  amount: number;
  /** Currency */
  currency: string;
  /** Status */
  status: ReservationStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Days until check-in */
  daysUntilCheckIn?: number;
  /** Whether actions are available */
  hasActions?: boolean;
}

/**
 * Reservation summary for cards/widgets
 */
export interface ReservationSummary {
  /** Reservation ID */
  id: string;
  /** Property title */
  property: string;
  /** Guest name */
  guest: string;
  /** Date range display */
  dateRange: string;
  /** Status badge info */
  status: {
    label: string;
    color: string;
    variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
  /** Amount display */
  amount: string;
  /** Quick actions available */
  quickActions?: ReservationAction[];
}

export interface ReviewTiming {
  /** When to prompt for review after checkout */
  promptAfterDays: number;
  /** Review deadline in days after checkout */
  deadlineDays: number;
}

// ========================================
// RESERVATION FORM TYPES (from features/properties)
// ========================================

/**
 * Types for Property Reservation Module
 */
export interface ReservationFormData {
  startDate: Date | null;
  endDate: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  paymentMethod: any | null;
  specialRequests: string;
}

export type ReservationStep = "dates" | "guests" | "payment" | "confirmation";

export interface ReservationStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export interface DateSelectionStepProps extends ReservationStepProps {
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateChange: (startDate: Date, endDate: Date) => void;
  propertyId?: string;
  isAvailable?: boolean | null;
  isCheckingAvailability?: boolean;
}

export interface GuestDetailsStepProps extends ReservationStepProps {
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  guests: ReservationFormData["guests"];
  onGuestChange: (
    guestType: keyof ReservationFormData["guests"],
    value: number
  ) => void;
  maxGuests?: number;
  onDateChangeRequested: () => void;
}

export interface PaymentMethodStepProps extends ReservationStepProps {
  selectedMethod: any | null;
  onSelectMethod: (method: any) => void;
}

export interface ConfirmationStepProps extends ReservationStepProps {
  property: any;
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  guests: ReservationFormData["guests"];
  priceDetails: any | null;
  paymentMethod: any | null;
  propertyPrice: number;
  onConfirm: () => void;
}

export interface PriceDetails {
  totalPrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  basePrice: number;
  nights: number;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "zaad" | "cash";
  name: string;
  icon?: string;
  details?: any;
}

/**
 * Availability data
 */
export interface AvailabilityData {
  date: string;
  available: boolean;
  price?: number;
}

/**
 * Calendar data
 */
export interface CalendarData {
  propertyId: string;
  availabilityMap: Record<string, AvailabilityData>;
  minStay: number;
  maxStay: number;
}

/**
 * Review creation request (moved from review types)
 */
export interface ReviewRequest {
  propertyId: string;
  reservationId: string;
  ratings: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
  comment: string;
}

/**
 * Reservation creation request
 */
export interface ReservationRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests?: {
    adults?: number;
    children?: number;
  };
}
