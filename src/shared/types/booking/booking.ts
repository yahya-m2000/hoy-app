/**
 * Booking-related type definitions
 */

// Import Property type for consistency with backend schema
import { Property } from "../property";

// Guest information for bookings
export interface BookingGuests {
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
}

// Contact information for bookings
export interface BookingContactInfo {
  name: string;
  email: string;
  phone?: string;
}

// Booking creation data
export interface BookingData {
  propertyId: string;
  unitId: string;
  checkIn?: string;
  checkOut?: string;
  guestCount: number;
  guests?: BookingGuests;
  totalPrice: number;
  specialRequests?: string;
  contactInfo: BookingContactInfo;
  paymentId?: string;
}

// Availability check parameters
export interface AvailabilityParams {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

// Price calculation parameters
export interface PriceCalculationParams {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  promoCode?: string;
}

// Price breakdown details
export interface PriceDetails {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  nights: number;
}

// Booking status types
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "in-progress";

// Payment status types
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially-refunded";

// Full booking object
export interface Booking {
  _id: string;
  propertyId: string;
  unitId?: string;
  userId?: string;
  checkIn: string;
  checkOut: string;
  guestCount?: number;
  guests: BookingGuests;
  totalPrice: number;
  specialRequests?: string;
  bookingStatus: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  contactInfo?: BookingContactInfo;
  createdAt: string;
  updatedAt: string;
  reviewId?: string;
}

// Populated booking with property details using imported Property type
export interface PopulatedBooking extends Booking {
  property?: Property;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}
