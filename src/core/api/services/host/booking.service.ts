/**
 * Host booking management service
 * Handles booking operations for host properties
 */

import {api} from "@core/api/client";
import { 
  Booking, 
  PopulatedBooking, 
  HostBookingFilters, 
  BookingsByDate, 
  BookingDashboardStats,
  TodayBookings 
} from "@core/types/booking.types";
import { logErrorWithContext } from "@core/utils/sys/error";

/**
 * Get bookings for host properties
 */
export const fetchHostBookings = async (
  filters?: HostBookingFilters
): Promise<{
  bookings: PopulatedBooking[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: {
        bookings: PopulatedBooking[];
        total: number;
        page: number;
        totalPages: number;
      };
    }>("/host/bookings", { params: filters });
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchHostBookings", error);
    throw error;
  }
};

/**
 * Get bookings for a specific date
 */
export const fetchBookingsByDate = async (
  date: string
): Promise<PopulatedBooking[]> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: PopulatedBooking[];
    }>(`/host/bookings/date/${date}`);
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchBookingsByDate", error);
    throw error;
  }
};

/**
 * Get bookings for a date range (for calendar view)
 */
export const fetchBookingsForDateRange = async (
  startDate: string,
  endDate: string
): Promise<BookingsByDate> => {
  try {
    const response = await api.get<{ success: boolean; data: BookingsByDate }>(
      "/host/bookings/date-range",
      {
        params: { startDate, endDate },
      }
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchBookingsForDateRange", error);
    throw error;
  }
};

/**
 * Get today's relevant bookings (check-ins, check-outs, current stays)
 */
export const fetchTodayBookings = async (): Promise<TodayBookings> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: TodayBookings;
    }>("/host/bookings/today");
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchTodayBookings", error);
    throw error;
  }
};

/**
 * Get dashboard statistics
 */
export const fetchBookingDashboardStats = async (): Promise<BookingDashboardStats> => {
  try {
    const response = await api.get<{ success: boolean; data: BookingDashboardStats }>(
      "/host/dashboard/stats"
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchBookingDashboardStats", error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: string
): Promise<Booking> => {
  try {
    const response = await api.patch<{ success: boolean; data: Booking }>(
      `/host/bookings/${bookingId}/status`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("updateBookingStatus", error);
    throw error;
  }
};

/**
 * Get specific booking details
 */
export const fetchHostBooking = async (
  bookingId: string
): Promise<PopulatedBooking> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: PopulatedBooking;
    }>(`/host/bookings/${bookingId}`);
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchHostBooking", error);
    throw error;
  }
};
