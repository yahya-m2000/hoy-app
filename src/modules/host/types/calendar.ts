/**
 * Host Calendar Types and Interfaces
 * Comprehensive type definitions for the host calendar system
 */

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  guest: Guest;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
  currency: string;
}

export interface CalendarDay {
  date: string; // ISO date string (YYYY-MM-DD)
  isAvailable: boolean;
  price: number;
  currency: string;
  booking?: Booking;
  isBlocked?: boolean;
  blockReason?: "maintenance" | "personal" | "other";
  isWeekend?: boolean;
  customPrice?: number; // Override base price
  minimumNights?: number;
  promotionPercentage?: number; // Discount percentage
}

export interface CalendarMonth {
  year: number;
  month: number; // 1-12
  days: CalendarDay[];
}

export interface PropertyCalendarData {
  propertyId: string;
  propertyName: string;
  basePrice: number;
  currency: string;
  minimumNights: number;
  advanceNotice: number; // days
  weekendMultiplier?: number;
  months: CalendarMonth[];
}

export interface CalendarSettings {
  minimumNights: number;
  advanceNotice: number;
  weekendMultiplier: number;
  defaultPrice: number;
  currency: string;
}

export interface DaySelectionAction {
  type: "availability" | "pricing" | "settings" | "block";
  selectedDates: string[];
}

export interface PricingModalData {
  selectedDates: string[];
  currentPrice: number;
  currency: string;
  isWeekend: boolean;
}

export interface CustomSettingsModalData {
  selectedDates: string[];
  minimumNights: number;
  promotionPercentage: number;
  advanceNotice: number;
}

export interface CalendarUpdateRequest {
  propertyId: string;
  updates: {
    date: string;
    isAvailable?: boolean;
    price?: number;
    minimumNights?: number;
    promotionPercentage?: number;
    isBlocked?: boolean;
    blockReason?: string;
  }[];
}

export interface CalendarResponse {
  success: boolean;
  data: PropertyCalendarData;
}

export interface CalendarUpdateResponse {
  success: boolean;
  data: {
    updatedDates: string[];
    calendar: PropertyCalendarData;
  };
}

// Utility types for calendar state management
export type CalendarViewMode = "month" | "week" | "day";
export type SelectionMode = "single" | "range" | "multiple";

export interface CalendarState {
  currentDate: Date;
  selectedDates: string[];
  selectionMode: SelectionMode;
  isSelecting: boolean;
  propertyCalendar?: PropertyCalendarData;
  loading: boolean;
  error?: string;
}
