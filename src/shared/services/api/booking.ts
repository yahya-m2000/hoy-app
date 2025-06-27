/**
 * Booking API Service
 * Handles all booking-related API calls for the mobile app
 */

import api from "../core/client";
import { BOOKING_ENDPOINTS } from "@shared/constants";
import {
  Booking,
  PopulatedBooking,
  BookingData,
  AvailabilityParams,
  PriceCalculationParams,
  PriceDetails,
} from "@shared/types";

export class BookingService {
  /**
   * Get all user bookings
   */
  static async getUserBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PopulatedBooking[]> {
    const response = await api.get(BOOKING_ENDPOINTS.USER_BOOKINGS, {
      params,
    });
    return (response.data as any).data as PopulatedBooking[];
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(id: string): Promise<PopulatedBooking> {
    const response = await api.get(BOOKING_ENDPOINTS.DETAILS(id));
    return (response.data as any).data as PopulatedBooking;
  }

  /**
   * Create a new booking
   */
  static async createBooking(data: BookingData): Promise<Booking> {
    const response = await api.post(BOOKING_ENDPOINTS.CREATE, data);
    return (response.data as any).data as Booking;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.put(BOOKING_ENDPOINTS.CANCEL(id), {
      reason,
    });
    return (response.data as any).data as Booking;
  }

  /**
   * Check in guest (host only)
   */
  static async checkInGuest(id: string): Promise<Booking> {
    const response = await api.put(BOOKING_ENDPOINTS.CHECK_IN(id));
    return (response.data as any).data as Booking;
  }

  /**
   * Check out guest (guest or host)
   */
  static async checkOutGuest(id: string): Promise<Booking> {
    const response = await api.put(BOOKING_ENDPOINTS.CHECK_OUT(id));
    return (response.data as any).data as Booking;
  }

  /**
   * Check availability for dates
   */
  static async checkAvailability(params: AvailabilityParams): Promise<{
    available: boolean;
    conflictingBookings?: Booking[];
  }> {
    const response = await api.get("/bookings/check-availability", {
      params: {
        propertyId: params.propertyId,
        unitId: params.unitId,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        guestCount: params.guestCount,
      },
    });
    return (response.data as any).data as {
      available: boolean;
      conflictingBookings?: Booking[];
    };
  }

  /**
   * Calculate booking price
   */
  static async calculatePrice(
    params: PriceCalculationParams
  ): Promise<PriceDetails> {
    const response = await api.post("/bookings/calculate-price", {
      propertyId: params.propertyId,
      unitId: params.unitId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guestCount: params.guestCount,
      promoCode: params.promoCode,
    });
    return (response.data as any).data as PriceDetails;
  }
}

// Export as default for convenient importing
export default BookingService;
