/**
 * Host Calendar Service
 * 
 * Manages calendar operations for host properties including:
 * - Availability management
 * - Pricing updates
 * - Date blocking/unblocking
 * - Calendar settings configuration
 * - Booking retrieval for calendar display
 * 
 * @module @core/api/services/host
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { logErrorWithContext } from "@core/utils/sys/error";
import type {
  PropertyCalendarData,
  CalendarUpdateRequest,
  CalendarResponse,
  CalendarUpdateResponse,
  CalendarSettings,
} from "@core/types/calendar.types";
import { logger } from "@core/utils/sys/log";
import { PopulatedBooking } from "@core/types/booking.types";

// API Endpoints
const CALENDAR_ENDPOINTS = {
  PROPERTY_CALENDAR: (propertyId: string) => `/host/properties/${propertyId}/calendar`,
  AVAILABILITY: (propertyId: string) => `/host/properties/${propertyId}/calendar/availability`,
  PRICING: (propertyId: string) => `/host/properties/${propertyId}/calendar/pricing`,
  BLOCK_DATES: (propertyId: string) => `/host/properties/${propertyId}/calendar/block`,
  SETTINGS: (propertyId: string) => `/host/properties/${propertyId}/calendar/settings`,
  BOOKINGS: (propertyId: string) => `/host/properties/${propertyId}/bookings`,
} as const;

/**
 * Fetch calendar data for a specific property
 * 
 * @param propertyId - The ID of the property
 * @param startDate - Optional start date for the calendar range
 * @param endDate - Optional end date for the calendar range
 * @returns Promise<PropertyCalendarData> - Calendar data with availability and pricing
 */
export const fetchPropertyCalendar = async (
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<PropertyCalendarData> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<CalendarResponse>(
      CALENDAR_ENDPOINTS.PROPERTY_CALENDAR(propertyId),
      { params }
    );

    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchPropertyCalendar", error);
    throw error;
  }
};

/**
 * Update calendar availability and pricing for specific dates
 * 
 * @param updateRequest - Request object containing property ID and date updates
 * @returns Promise<PropertyCalendarData> - Updated calendar data
 */
export const updatePropertyCalendar = async (
  updateRequest: CalendarUpdateRequest
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      CALENDAR_ENDPOINTS.PROPERTY_CALENDAR(updateRequest.propertyId),
      updateRequest
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updatePropertyCalendar", error);
    throw error;
  }
};

/**
 * Bulk update availability for a date range
 * 
 * @param propertyId - The ID of the property
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param isAvailable - Whether the dates should be available or not
 * @returns Promise<PropertyCalendarData> - Updated calendar data
 */
export const updateAvailability = async (
  propertyId: string,
  startDate: string,
  endDate: string,
  isAvailable: boolean
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      CALENDAR_ENDPOINTS.AVAILABILITY(propertyId),
      {
        startDate,
        endDate,
        isAvailable,
      }
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updateAvailability", error);
    throw error;
  }
};

/**
 * Update pricing for specific dates
 * 
 * @param propertyId - The ID of the property
 * @param dates - Array of dates to update
 * @param price - New price for the dates
 * @param promotionPercentage - Optional promotion percentage discount
 * @returns Promise<PropertyCalendarData> - Updated calendar data
 */
export const updatePricing = async (
  propertyId: string,
  dates: string[],
  price: number,
  promotionPercentage?: number
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      CALENDAR_ENDPOINTS.PRICING(propertyId),
      {
        dates,
        price,
        promotionPercentage,
      }
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updatePricing", error);
    throw error;
  }
};

/**
 * Block or unblock dates for a property
 * 
 * @param propertyId - The ID of the property
 * @param dates - Array of dates to block/unblock
 * @param isBlocked - Whether to block or unblock the dates
 * @param blockReason - Optional reason for blocking
 * @returns Promise<PropertyCalendarData> - Updated calendar data
 */
export const updateBlockedDates = async (
  propertyId: string,
  dates: string[],
  isBlocked: boolean,
  blockReason?: string
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      CALENDAR_ENDPOINTS.BLOCK_DATES(propertyId),
      {
        dates,
        isBlocked,
        blockReason,
      }
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updateBlockedDates", error);
    throw error;
  }
};

/**
 * Update calendar settings for a property
 * 
 * @param propertyId - The ID of the property
 * @param settings - Partial calendar settings to update
 * @returns Promise<PropertyCalendarData> - Updated calendar data
 */
export const updateCalendarSettings = async (
  propertyId: string,
  settings: Partial<CalendarSettings>
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      CALENDAR_ENDPOINTS.SETTINGS(propertyId),
      settings
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updateCalendarSettings", error);
    throw error;
  }
};

/**
 * Get property bookings for calendar display
 * 
 * @param propertyId - The ID of the property
 * @param startDate - Optional start date for filtering bookings
 * @param endDate - Optional end date for filtering bookings
 * @returns Promise<PopulatedBooking[]> - Array of bookings with populated data
 */
export const fetchPropertyBookings = async (
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<PopulatedBooking[]> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<{ success: boolean; data: PopulatedBooking[] }>(
      CALENDAR_ENDPOINTS.BOOKINGS(propertyId),
      { params }
    );

    return response.data.data || [];
  } catch (error) {
    logErrorWithContext("fetchPropertyBookings", error);
    throw error;
  }
};

/**
 * Host Calendar Service
 * Provides organized access to all calendar operations
 */
export const HostCalendarService = {
  fetchPropertyCalendar,
  updatePropertyCalendar,
  updateAvailability,
  updatePricing,
  updateBlockedDates,
  updateCalendarSettings,
  fetchPropertyBookings,
};

// Default export
export default HostCalendarService;
