/**
 * Calendar Data Adapters
 * 
 * Data transformation utilities for calendar types
 * 
 * @module @features/calendar/utils/adapters
 * @author Hoy Development Team
 * @version 1.0.0
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

/**
 * Adapter function to convert property data to calendar property format
 */
export function adaptPropertyData(rawProperty: any): {
  id: string;
  name: string;
  type: string;
} {
  return {
    id: rawProperty._id || rawProperty.id,
    name: rawProperty.name || rawProperty.title || 'Untitled Property',
    type: rawProperty.type || 'house',
  };
}

/**
 * Adapter function to convert an array of property data
 */
export function adaptPropertiesData(rawProperties: any[]): {
  id: string;
  name: string;
  type: string;
}[] {
  return rawProperties.map(adaptPropertyData);
} 