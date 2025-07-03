/**
 * Data adapter functions for calendar types
 * Separated to avoid circular dependencies
 */

import { DetailedBookingData, CalendarBookingData } from "@core/types/booking.types";

/**
 * Adapter function to convert DetailedBookingData to CalendarBookingData
 */
export function adaptBookingData(
  detailedBooking: DetailedBookingData
): CalendarBookingData {
  const startDate = new Date(detailedBooking.checkIn);
  const endDate = new Date(detailedBooking.checkOut);
  const now = new Date();
  
  // Determine booking status based on dates
  let status: "past" | "active" | "upcoming";
  if (endDate < now) {
    status = "past";
  } else if (startDate <= now && endDate >= now) {
    status = "active";
  } else {
    status = "upcoming";
  }
  
  return {
    id: detailedBooking._id,
    startDate: startDate,
    endDate: endDate,
    guestName: detailedBooking.contactInfo.name,
    guestAvatar: undefined, // Not available in detailed booking
    status: status,
    totalPrice: detailedBooking.totalPrice,
  };
}

/**
 * Adapter function to convert an array of DetailedBookingData to CalendarBookingData
 */
export function adaptBookingsData(
  detailedBookings: DetailedBookingData[]
): CalendarBookingData[] {
  return detailedBookings.map(adaptBookingData);
} 