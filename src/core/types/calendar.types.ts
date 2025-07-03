/**
 * Calendar Types
 * 
 * Comprehensive type definitions for calendar functionality including:
 * - Host calendar management
 * - Booking display on calendar
 * - Availability and pricing configuration
 * - Calendar state management
 * 
 * @module @core/types/calendar
 * @author Hoy Development Team
 * @version 1.0.0
 */

/**
 * Guest information for bookings displayed on calendar
 */
export interface Guest {
  /** Unique identifier */
  id: string;
  /** Guest's first name */
  firstName: string;
  /** Guest's last name */
  lastName: string;
  /** Optional avatar URL */
  avatar?: string;
  /** Guest's email address */
  email: string;
}

/**
 * Booking information for calendar display
 * @note This is a simplified version for calendar display only
 */
export interface CalendarBooking {
  /** Unique booking identifier */
  id: string;
  /** Associated property ID */
  propertyId: string;
  /** Guest details */
  guest: Guest;
  /** Check-in date (ISO string) */
  checkIn: string;
  /** Check-out date (ISO string) */
  checkOut: string;
  /** Booking status */
  status: "confirmed" | "pending" | "cancelled";
  /** Total booking amount */
  totalAmount: number;
  /** Currency code */
  currency: string;
}

/**
 * Individual calendar day data
 */
export interface CalendarDay {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Whether the day is available for booking */
  isAvailable: boolean;
  /** Base price for the day */
  price: number;
  /** Currency code */
  currency: string;
  /** Booking information if day is booked */
  booking?: CalendarBooking;
  /** Whether the day is manually blocked */
  isBlocked?: boolean;
  /** Reason for blocking */
  blockReason?: "maintenance" | "personal" | "other";
  /** Whether this is a weekend day */
  isWeekend?: boolean;
  /** Custom price override */
  customPrice?: number;
  /** Minimum nights requirement */
  minimumNights?: number;
  /** Promotion discount percentage */
  promotionPercentage?: number;
}

/**
 * Calendar month data structure
 */
export interface CalendarMonth {
  /** Year number */
  year: number;
  /** Month number (1-12) */
  month: number;
  /** Array of days in the month */
  days: CalendarDay[];
}

/**
 * Complete property calendar data
 */
export interface PropertyCalendarData {
  /** Property identifier */
  propertyId: string;
  /** Property display name */
  propertyName: string;
  /** Base price for the property */
  basePrice: number;
  /** Currency code */
  currency: string;
  /** Default minimum nights requirement */
  minimumNights: number;
  /** Required advance notice in days */
  advanceNotice: number;
  /** Weekend price multiplier */
  weekendMultiplier?: number;
  /** Array of calendar months */
  months: CalendarMonth[];
}

/**
 * Calendar configuration settings
 */
export interface CalendarSettings {
  /** Minimum nights requirement */
  minimumNights: number;
  /** Advance notice requirement in days */
  advanceNotice: number;
  /** Weekend price multiplier */
  weekendMultiplier: number;
  /** Default price */
  defaultPrice: number;
  /** Currency code */
  currency: string;
}

/**
 * Day selection action for bulk operations
 */
export interface DaySelectionAction {
  /** Type of action to perform */
  type: "availability" | "pricing" | "settings" | "block";
  /** Array of selected dates */
  selectedDates: string[];
}

/**
 * Data for pricing modal
 */
export interface PricingModalData {
  /** Selected dates for pricing update */
  selectedDates: string[];
  /** Current price */
  currentPrice: number;
  /** Currency code */
  currency: string;
  /** Whether selection includes weekends */
  isWeekend: boolean;
}

/**
 * Data for custom settings modal
 */
export interface CustomSettingsModalData {
  /** Selected dates for settings update */
  selectedDates: string[];
  /** Minimum nights requirement */
  minimumNights: number;
  /** Promotion percentage */
  promotionPercentage: number;
  /** Advance notice requirement */
  advanceNotice: number;
}

/**
 * Request structure for calendar updates
 */
export interface CalendarUpdateRequest {
  /** Property identifier */
  propertyId: string;
  /** Array of date updates */
  updates: {
    /** Date to update */
    date: string;
    /** Availability status */
    isAvailable?: boolean;
    /** Price for the date */
    price?: number;
    /** Minimum nights override */
    minimumNights?: number;
    /** Promotion percentage */
    promotionPercentage?: number;
    /** Block status */
    isBlocked?: boolean;
    /** Block reason */
    blockReason?: string;
  }[];
}

/**
 * API response for calendar data
 */
export interface CalendarResponse {
  /** Success status */
  success: boolean;
  /** Calendar data */
  data: PropertyCalendarData;
}

/**
 * API response for calendar updates
 */
export interface CalendarUpdateResponse {
  /** Success status */
  success: boolean;
  /** Update details */
  data: {
    /** Array of updated dates */
    updatedDates: string[];
    /** Updated calendar data */
    calendar: PropertyCalendarData;
  };
}

// ========================================
// Utility Types
// ========================================

/**
 * Calendar view modes
 */
export type CalendarViewMode = "month" | "week" | "day";

/**
 * Date selection modes
 */
export type SelectionMode = "single" | "range" | "multiple";

/**
 * Calendar state management
 */
export interface CalendarState {
  /** Currently viewed date */
  currentDate: Date;
  /** Array of selected dates */
  selectedDates: string[];
  /** Current selection mode */
  selectionMode: SelectionMode;
  /** Whether user is actively selecting */
  isSelecting: boolean;
  /** Property calendar data */
  propertyCalendar?: PropertyCalendarData;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error?: string;
} 