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
    const response = await api.get<any>("/host/reservations", { params: filters });
    const respData = response.data.data;
    let bookings: PopulatedBooking[] = [];
    let total = 0;
    let page = 1;
    let totalPages = 1;

    if (Array.isArray(respData)) {
      // New API format: data is array, pagination separate field
      bookings = respData;
      total = response.data.pagination?.total || respData.length;
      page = response.data.pagination?.page || 1;
      totalPages = response.data.pagination?.pages || 1;
    } else if (respData && typeof respData === "object") {
      // Legacy/alternative format: data has bookings object
      bookings = respData.bookings || [];
      total = respData.total || bookings.length;
      page = respData.page || 1;
      totalPages = respData.totalPages || 1;
    }

    return { bookings, total, page, totalPages };
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
    }>(`/host/reservations/date/${date}`);
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
      "/host/reservations/date-range",
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
    }>("/host/reservations/today");
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
      "/host/dashboard/"
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
      `/host/reservations/${bookingId}/status`,
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
    const response = await api.get<any>(`/host/reservations/${bookingId}`);
    // Some API versions return { success, data }, others return the object directly
    const respData = response.data;
    const booking: PopulatedBooking = respData && typeof respData === "object" && "data" in respData
      ? respData.data
      : respData;
    return booking as PopulatedBooking;
  } catch (error) {
    logErrorWithContext("fetchHostBooking", error);
    throw error;
  }
};
