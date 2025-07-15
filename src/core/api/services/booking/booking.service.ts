/**
 * Booking Service
 * 
 * Handles all booking-related API operations including:
 * - Creating and managing bookings
 * - Availability checking
 * - Price calculations
 * - Booking status updates
 * - Guest management
 * 
 * Features:
 * - Request queuing to prevent server overload
 * - Comprehensive error handling
 * - Type safety with TypeScript
 * 
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {api} from "@core/api/client";
import { formatError } from "src/core/utils/sys/error";
import type {
  Booking,
  PopulatedBooking,
  BookingApiData,
  BookingAvailabilityParams,
  BookingPriceParams,
  BookingPriceDetails,
} from "@core/types/booking.types";
import { logger } from "@core/utils/sys/log";

// API Endpoints
const BOOKING_ENDPOINTS = {
  BASE: "/bookings",
  USER_BOOKINGS: "/bookings",
  CREATE: "/bookings",
  DETAILS: (id: string) => `/bookings/${id}`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
  CHECK_IN: (id: string) => `/bookings/${id}/check-in`,
  CHECK_OUT: (id: string) => `/bookings/${id}/check-out`,
  AVAILABILITY: "/bookings/check-availability",
  CALCULATE_PRICE: "/bookings/calculate-price",
  BOOKED_DATES: (propertyId: string) => `/properties/${propertyId}/booked-dates`,
  REVIEW: (bookingId: string) => `/bookings/${bookingId}/review`,
} as const;

// Configuration
const REQUEST_QUEUE_DELAY = 300; // ms between requests
const MAX_RETRY_ATTEMPTS = 3;

// Request Queue Management
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;

  /**
   * Add request to queue and process
   */
  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process queue with delay between requests
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          logger.error("Error processing queued request:", error);
        }
        // Delay between requests to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, REQUEST_QUEUE_DELAY));
      }
    }

    this.isProcessing = false;
  }
}

const requestQueue = new RequestQueue();

/**
 * Booking Service Class
 * Provides organized access to all booking-related operations
 */
export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingApiData): Promise<Booking> {
    return requestQueue.enqueue(async () => {
      try {
        // Format data for server requirements
        const serverFormattedData = {
          propertyId: bookingData.propertyId,
          unitId: bookingData.unitId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guestCount: bookingData.guestCount,
          guests: bookingData.guests || {
            adults: bookingData.guestCount || 1,
            children: 0,
            infants: 0,
            pets: 0,
          },
          specialRequests: bookingData.specialRequests,
          contactInfo: bookingData.contactInfo,
          paymentId: bookingData.paymentId,
          totalPrice: bookingData.totalPrice,
        };

        logger.log("Creating booking:", JSON.stringify(serverFormattedData));
        
        const response = await api.post<{ data: Booking }>(BOOKING_ENDPOINTS.CREATE, serverFormattedData);
        return response.data.data;
      } catch (error: any) {
        logger.error("Booking creation error:", error.response?.data || error);
        throw formatError(error, "Could not create booking");
      }
    });
  }

  /**
   * Get all user bookings with optional filtering
   */
  static async getUserBookings(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PopulatedBooking[]> {
    return requestQueue.enqueue(async () => {
      try {
        logger.log("Fetching user bookings with params:", params);
        
        const response = await api.get<any>(BOOKING_ENDPOINTS.USER_BOOKINGS, { params });
        
        const responseData = response.data;

        // Handle different response formats
        if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
          logger.log("Successfully extracted bookings:", responseData.data.data.length);
          return responseData.data.data;
        }

        if (Array.isArray(responseData?.data)) {
          return responseData.data;
        }

        if (Array.isArray(responseData)) {
          return responseData;
        }

        logger.warn("Unexpected response format:", responseData);
        return [];
      } catch (error: any) {
        logger.error("Error fetching user bookings:", error);
        throw formatError(error, "Could not fetch bookings");
      }
    });
  }

  /**
   * Get booking details by ID
   */
  static async getBookingById(id: string): Promise<PopulatedBooking> {
    try {
      const response = await api.get<{ data: PopulatedBooking }>(BOOKING_ENDPOINTS.DETAILS(id));
      return response.data.data;
    } catch (error: any) {
      logger.error("Error fetching booking details:", error);
      throw formatError(error, "Could not fetch booking details");
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: string, reason?: string): Promise<Booking> {
    try {
      const body = reason ? { reason } : {};
      const response = await api.put<{ data: Booking }>(BOOKING_ENDPOINTS.CANCEL(id), body);
      return response.data.data;
    } catch (error: any) {
      logger.error("Error cancelling booking:", error);
      throw formatError(error, "Could not cancel booking");
    }
  }

  /**
   * Check in guest (host only)
   */
  static async checkInGuest(id: string): Promise<Booking> {
    try {
      const response = await api.put<{ data: Booking }>(BOOKING_ENDPOINTS.CHECK_IN(id));
      return response.data.data;
    } catch (error: any) {
      logger.error("Error checking in guest:", error);
      throw formatError(error, "Could not check in guest");
    }
  }

  /**
   * Check out guest
   */
  static async checkOutGuest(id: string): Promise<Booking> {
    try {
      const response = await api.put<{ data: Booking }>(BOOKING_ENDPOINTS.CHECK_OUT(id));
      return (response.data as any)?.data;
    } catch (error: any) {
      logger.error("Error checking out guest:", error);
      throw formatError(error, "Could not check out guest");
    }
  }

  /**
   * Check availability for specific dates
   */
  static async checkAvailability(params: BookingAvailabilityParams): Promise<{
    available: boolean;
    conflictingBookings?: Booking[];
  }> {
    try {
      const response = await api.get(BOOKING_ENDPOINTS.AVAILABILITY, {
        params: {
          propertyId: params.propertyId,
          unitId: params.unitId,
          checkInDate: params.checkIn,
          checkOutDate: params.checkOut,
          guestCount: params.guestCount,
        },
      });
      return (response.data as any)?.data;
    } catch (error: any) {
      logger.error("Error checking availability:", error);
      throw formatError(error, "Could not check availability");
    }
  }

  /**
   * Calculate booking price
   */
  static async calculatePrice(params: BookingPriceParams): Promise<BookingPriceDetails> {
    try {
      const response = await api.post(BOOKING_ENDPOINTS.CALCULATE_PRICE, {
        propertyId: params.propertyId,
        unitId: params.unitId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guestCount: params.guestCount,
        promoCode: params.promoCode,
      });
      return (response.data as any)?.data;
    } catch (error: any) {
      logger.error("Error calculating price:", error);
      throw formatError(error, "Could not calculate price");
    }
  }

  /**
   * Get booked dates for a property
   */
  static async getBookedDatesForProperty(
    propertyId: string,
    retryCount = 0
  ): Promise<string[]> {
    return requestQueue.enqueue(async () => {
      try {
        const response = await api.get(BOOKING_ENDPOINTS.BOOKED_DATES(propertyId));
        
        // Add comprehensive null checks and logging for iOS debugging
        const responseData = response?.data as any;
        logger.log("Raw API response for booked dates:", {
          hasResponse: !!response,
          hasData: !!responseData,
          responseDataType: typeof responseData,
          responseDataKeys: responseData ? Object.keys(responseData) : [],
          isArray: Array.isArray(responseData),
          isDataArray: Array.isArray(responseData?.data)
        });
        
        // Handle different response structures safely
        if (responseData) {
          // Case 1: response.data is directly an array
          if (Array.isArray(responseData)) {
            logger.log("Using response.data as array:", responseData.length);
            return responseData;
          }
          
          // Case 2: response.data.data is an array
          if (responseData.data && Array.isArray(responseData.data)) {
            logger.log("Using response.data.data as array:", responseData.data.length);
            return responseData.data;
          }
          
          // Case 3: response.data has a different structure
          logger.warn("Unexpected response structure for booked dates:", responseData);
        }
        
        // Fallback: return empty array if no valid data found
        logger.warn("No valid booked dates data found, returning empty array");
        return [];
      } catch (error: any) {
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          logger.warn(`Retry attempt ${retryCount + 1} for booked dates`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.getBookedDatesForProperty(propertyId, retryCount + 1);
        }
        
        logger.error("Error fetching booked dates:", error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
    });
  }

  /**
   * Create a booking review
   */
  static async createBookingReview(bookingId: string, reviewData: any): Promise<any> {
    try {
      const response = await api.post(BOOKING_ENDPOINTS.REVIEW(bookingId), reviewData);
      return (response.data as any)?.data;
    } catch (error: any) {
      logger.error("Error creating booking review:", error);
      throw formatError(error, "Could not create review");
    }
  }

  /**
   * Get booking review
   */
  static async getBookingReview(bookingId: string): Promise<any> {
    try {
      const response = await api.get(BOOKING_ENDPOINTS.REVIEW(bookingId));
      return (response.data as any)?.data;
    } catch (error: any) {
      logger.error("Error fetching booking review:", error);
      throw formatError(error, "Could not fetch review");
    }
  }
}

// Legacy function exports for backward compatibility
export const createBooking = BookingService.createBooking;
export const getUserBookings = BookingService.getUserBookings;
export const getBookingById = BookingService.getBookingById;
export const cancelBooking = BookingService.cancelBooking;
export const checkAvailability = BookingService.checkAvailability;
export const calculatePrice = BookingService.calculatePrice;
export const getBookedDatesForProperty = BookingService.getBookedDatesForProperty;
export const createBookingReview = BookingService.createBookingReview;
export const getBookingReview = BookingService.getBookingReview;

// Default export
export default BookingService; 