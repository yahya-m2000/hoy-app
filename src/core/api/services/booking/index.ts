/**
 * Booking Services
 * 
 * Centralized exports for all booking-related services
 */

export { 
  default as BookingService,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
  calculatePrice,
  getBookedDatesForProperty,
  createBookingReview,
  getBookingReview
} from './booking.service';

// Re-export types for convenience  
export type {
  Booking,
  PopulatedBooking,
  BookingApiData,
  BookingGuestInfo,
  BookingContactInfo,
  BookingAvailabilityParams,
  BookingPriceParams,
  BookingPriceDetails,
} from '@core/types/booking.types'; 