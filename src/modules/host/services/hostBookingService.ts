/**
 * Host booking management service
 * Handles booking operations for host properties
 */

import api from "@shared/services/core/client";
import { Booking, PopulatedBooking } from "@shared/types/booking";
import { logErrorWithContext } from "@shared/utils/error";

export interface HostBookingFilters {
  propertyId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BookingsByDate {
  [date: string]: PopulatedBooking[];
}

export interface DashboardStats {
  todayCheckIns: number;
  todayCheckOuts: number;
  upcomingBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  totalProperties: number;
  activeBookings: number;
}

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
export const fetchTodayBookings = async (): Promise<{
  checkIns: PopulatedBooking[];
  checkOuts: PopulatedBooking[];
  currentStays: PopulatedBooking[];
}> => {
  try {
    const response = await api.get<{
      success: boolean;
      data: {
        checkIns: PopulatedBooking[];
        checkOuts: PopulatedBooking[];
        currentStays: PopulatedBooking[];
      };
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
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      "/host/dashboard/stats"
    );
    return response.data.data;
  } catch (error) {
    logErrorWithContext("fetchDashboardStats", error);
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
