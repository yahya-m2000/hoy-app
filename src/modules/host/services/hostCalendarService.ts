/**
 * Host Calendar API Service
 * Handles all calendar-related API calls for host properties
 */

import api from "@shared/services/core/client";
import { logErrorWithContext } from "@shared/utils/error";
import {
  PropertyCalendarData,
  CalendarUpdateRequest,
  CalendarResponse,
  CalendarUpdateResponse,
  CalendarSettings,
} from "../types/calendar";

/**
 * Get calendar data for a specific property
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
      `/host/properties/${propertyId}/calendar`,
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
 */
export const updatePropertyCalendar = async (
  updateRequest: CalendarUpdateRequest
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      `/host/properties/${updateRequest.propertyId}/calendar`,
      updateRequest
    );

    return response.data.data.calendar;
  } catch (error) {
    logErrorWithContext("updatePropertyCalendar", error);
    throw error;
  }
};

/**
 * Bulk update availability for date range
 */
export const updateAvailability = async (
  propertyId: string,
  startDate: string,
  endDate: string,
  isAvailable: boolean
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      `/host/properties/${propertyId}/calendar/availability`,
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
 */
export const updatePricing = async (
  propertyId: string,
  dates: string[],
  price: number,
  promotionPercentage?: number
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      `/host/properties/${propertyId}/calendar/pricing`,
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
 * Block or unblock dates
 */
export const updateBlockedDates = async (
  propertyId: string,
  dates: string[],
  isBlocked: boolean,
  blockReason?: string
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      `/host/properties/${propertyId}/calendar/block`,
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
 * Update calendar settings (minimum nights, advance notice, etc.)
 */
export const updateCalendarSettings = async (
  propertyId: string,
  settings: Partial<CalendarSettings>
): Promise<PropertyCalendarData> => {
  try {
    const response = await api.patch<CalendarUpdateResponse>(
      `/host/properties/${propertyId}/calendar/settings`,
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
 */
export const fetchPropertyBookings = async (
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<any[]> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<{ success: boolean; data: any[] }>(
      `/host/properties/${propertyId}/bookings`,
      { params }
    );

    return response.data.data || [];
  } catch (error) {
    logErrorWithContext("fetchPropertyBookings", error);
    throw error;
  }
};
