// Booking feature exports

// Components
export * from "./components";

// Services - Re-export booking services from shared
export {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
  calculatePrice,
  getBookedDatesForProperty,
  createBookingReview,
  getBookingReview,
} from "@shared/services/bookingService";

// Types - Re-export booking types
export type {
  Booking,
  BookingData,
  BookingGuests,
  BookingContactInfo,
  AvailabilityParams,
  PriceCalculationParams,
  PriceDetails,
  PopulatedBooking,
} from "@shared/types/booking";
