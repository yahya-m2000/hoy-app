/**
 * Custom hook to fetch and manage property reservations
 * Fetches reservations/bookings for a specific property
 */

import { useState, useEffect, useCallback } from "react";
import { PopulatedBooking, CalendarBookingData } from "@core/types/booking.types";
import { fetchHostBookings } from "@core/api/services/host";
import { logErrorWithContext } from "@core/utils/sys/error";

export interface UsePropertyReservationsReturn {
  reservations: PopulatedBooking[];
  calendarBookings: CalendarBookingData[];
  loading: boolean;
  error: string | null;
  fetchReservations: (propertyId?: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
}

/**
 * Transform PopulatedBooking to CalendarBookingData for calendar components
 */
const transformBookingForCalendar = (booking: PopulatedBooking): CalendarBookingData => {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const currentDate = new Date();
  
  // Determine booking status based on dates
  let status: "past" | "active" | "upcoming" = "upcoming";
  if (checkInDate <= currentDate && checkOutDate > currentDate) {
    status = "active";
  } else if (checkOutDate <= currentDate) {
    status = "past";
  }

  return {
    id: booking._id,
    startDate: checkInDate,
    endDate: checkOutDate,
    guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
    guestAvatar: booking.guest.avatar,
    status,
    totalPrice: booking.totalAmount,
  };
};

/**
 * Hook for fetching property reservations
 * Uses the /host/bookings endpoint with propertyId filter
 */
export function usePropertyReservations(propertyId?: string): UsePropertyReservationsReturn {
  const [reservations, setReservations] = useState<PopulatedBooking[]>([]);
  const [calendarBookings, setCalendarBookings] = useState<CalendarBookingData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (targetPropertyId?: string) => {
    const propertyIdToUse = targetPropertyId || propertyId;
    
    // Don't fetch if no property ID is provided
    if (!propertyIdToUse) {
      setReservations([]);
      setCalendarBookings([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchHostBookings({
        propertyId: propertyIdToUse,
        // You can add other filters here if needed
      });
      
      const bookings = response.bookings || [];
      setReservations(bookings);
      
      // Transform bookings for calendar use
      const calendarData = bookings.map(transformBookingForCalendar);
      setCalendarBookings(calendarData);
      
      setError(null);
    } catch (err) {
      logErrorWithContext("usePropertyReservations.fetchReservations", err);
      
      let errorMessage = "Unable to load property reservations";
      if (err instanceof Error) {
        if (err.message.includes("Network Error")) {
          errorMessage = "Network connection error. Please check your internet connection and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setReservations([]);
      setCalendarBookings([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const refreshReservations = useCallback(async () => {
    await fetchReservations();
  }, [fetchReservations]);

  // Fetch reservations when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchReservations(propertyId);
    }
  }, [propertyId, fetchReservations]);

  return {
    reservations,
    calendarBookings,
    loading,
    error,
    fetchReservations,
    refreshReservations,
  };
} 