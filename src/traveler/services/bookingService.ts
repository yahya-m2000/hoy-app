/**
 * Booking Service for the Hoy application
 * Handles API calls related to property bookings
 */

import api from "@common/services/api";
import { formatError } from "@common/utils/error/errorHandlers";
import { Platform } from "react-native";

const BASE_URL = "/bookings";

// Define types for responses
type AxiosResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
};

// Define API response type
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Define Booking-related interfaces
export interface BookingGuests {
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
}

export interface BookingContactInfo {
  name: string;
  email: string;
  phone?: string;
}

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

export interface AvailabilityParams {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export interface PriceCalculationParams {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  promoCode?: string;
}

export interface PriceDetails {
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  nights: number;
}

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
  bookingStatus: string;
  paymentStatus?: string;
  paymentId?: string;
  contactInfo?: BookingContactInfo;
  createdAt: string;
  updatedAt: string;
  reviewId?: string;
}

// Create a request queue to prevent overwhelming the server
const requestQueue: (() => Promise<any>)[] = [];
let isProcessingQueue = false;

// Process queue with delay between requests
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        console.error("Error processing queued request:", error);
      }
      // Delay between requests to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  isProcessingQueue = false;
}

// Add request to queue and process
function enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    processQueue();
  });
}

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: BookingData
): Promise<Booking> => {
  return enqueueRequest(async () => {
    try {
      // Ensure we're sending data in the format the server expects
      const serverFormattedData = {
        propertyId: bookingData.propertyId,
        unitId: bookingData.unitId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestCount: bookingData.guestCount,
        // Include the guests object which is required by the server validation
        guests: bookingData.guests || {
          adults: bookingData.guestCount || 1, // Default to at least 1 adult
          children: 0,
          infants: 0,
          pets: 0,
        },
        // Optional fields
        specialRequests: bookingData.specialRequests,
        contactInfo: bookingData.contactInfo,
        paymentId: bookingData.paymentId,
        totalPrice: bookingData.totalPrice,
      };

      // Log what we're sending for debugging
      console.log("Sending booking data:", JSON.stringify(serverFormattedData));
      const response: AxiosResponse<ApiResponse<Booking>> = await api.post(
        BASE_URL,
        serverFormattedData
      );
      return response.data.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error("Booking creation error:", error.response?.data || error);
      throw formatError(error, "Could not create booking");
    }
  });
};

/**
 * Get all bookings for the current user
 */
export const getUserBookings = async (status?: string): Promise<Booking[]> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<Booking[]>> = await api.get(
        BASE_URL,
        {
          params: { status },
        }
      );
      return response.data.data;
    } catch (error) {
      throw formatError(error, "Could not fetch bookings");
    }
  });
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<Booking>> = await api.get(
        `${BASE_URL}/${id}`
      );
      return response.data.data;
    } catch (error) {
      throw formatError(error, "Could not fetch booking");
    }
  });
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  id: string,
  reason?: string
): Promise<Booking> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<Booking>> = await api.post(
        `${BASE_URL}/${id}/cancel`,
        { reason }
      );
      return response.data.data;
    } catch (error) {
      throw formatError(error, "Could not cancel booking");
    }
  });
};

/**
 * Check property availability for given dates
 */
export const checkAvailability = async (
  params: AvailabilityParams
): Promise<boolean> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<boolean>> = await api.get(
        `${BASE_URL}/check-availability`,
        {
          params: {
            propertyId: params.propertyId,
            unitId: params.unitId,
            checkIn: params.checkIn,
            checkOut: params.checkOut,
            guestCount: params.guestCount,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      if (Platform.OS === "android") {
        // On Android, assume available on error for pre-selected dates
        // This is a temporary workaround for the API issue
        console.warn("Availability check failed, assuming available:", error);
        return true;
      }
      throw formatError(error, "Could not check availability");
    }
  });
};

/**
 * Calculate booking price including all fees
 */
export const calculatePrice = async (
  params: PriceCalculationParams
): Promise<PriceDetails> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<PriceDetails>> = await api.post(
        `${BASE_URL}/calculate-price`,
        params
      );
      return response.data.data;
    } catch (error) {
      // If price calculation fails, return estimated price
      if (Platform.OS === "android") {
        console.warn("Price calculation failed, returning estimate:", error);
        // Get base price from property API or fall back to default
        const baseNightlyRate = 100; // Default fallback rate
        const nights = getDaysBetweenDates(
          new Date(params.checkIn),
          new Date(params.checkOut)
        );

        return {
          basePrice: baseNightlyRate * nights,
          cleaningFee: Math.round(baseNightlyRate * 0.1),
          serviceFee: Math.round(baseNightlyRate * nights * 0.12),
          taxes: Math.round(baseNightlyRate * nights * 0.08),
          totalPrice: Math.round(
            baseNightlyRate * nights * 1.2 + baseNightlyRate * 0.1
          ),
          nights,
        };
      }

      throw formatError(error, "Could not calculate price");
    }
  });
};

// Helper to calculate days between dates
function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get booked dates for a property
 */
export const getBookedDatesForProperty = async (
  propertyId: string,
  retryCount = 0
): Promise<string[]> => {
  // Add cache implementation to prevent excessive API calls
  const now = Date.now();
  const cacheExpiry =
    (global as any)._bookedDatesCacheExpiry?.[propertyId] || 0;
  const cachedData = (global as any)._bookedDatesCache?.[propertyId];

  // Return cached data if available and not expired (cache for 1 hour)
  if (cachedData && now < cacheExpiry) {
    return cachedData;
  }

  // Implement rate limiting for this specific endpoint
  const lastRequestTime =
    (global as any)._lastBookedDatesRequestTime?.[propertyId] || 0;
  const minInterval = 10000; // 10 seconds minimum between requests for same property

  if (now - lastRequestTime < minInterval) {
    console.log(
      `Rate limiting booked dates API calls for property ${propertyId}`
    );
    // Return cached results if available, otherwise empty array
    return cachedData || [];
  }

  // Update last request time
  if (!(global as any)._lastBookedDatesRequestTime) {
    (global as any)._lastBookedDatesRequestTime = {};
  }
  (global as any)._lastBookedDatesRequestTime[propertyId] = now;

  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<string[]>> = await api.get(
        `/properties/${propertyId}/booked-dates`
      );

      // Store in cache with 1 hour expiry
      if (!(global as any)._bookedDatesCache) {
        (global as any)._bookedDatesCache = {};
      }
      if (!(global as any)._bookedDatesCacheExpiry) {
        (global as any)._bookedDatesCacheExpiry = {};
      }

      (global as any)._bookedDatesCache[propertyId] = response.data.data;
      (global as any)._bookedDatesCacheExpiry[propertyId] = now + 3600000; // 1 hour

      return response.data.data;
    } catch (error: any) {
      // If we hit rate limits (429), retry with exponential backoff
      if (error?.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited. Retrying after ${delay}ms delay`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return getBookedDatesForProperty(propertyId, retryCount + 1);
      }

      // Log the error but return empty array to prevent app crashes
      console.error(
        `Error fetching booked dates for property ${propertyId}:`,
        error
      );
      return [];
    }
  });
};

/**
 * Create a booking review
 */
export const createBookingReview = async (
  bookingId: string,
  reviewData: any
): Promise<any> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post(
        `${BASE_URL}/${bookingId}/review`,
        reviewData
      );
      return response.data.data;
    } catch (error) {
      throw formatError(error, "Could not create review");
    }
  });
};

/**
 * Get booking review by booking ID
 */
export const getBookingReview = async (bookingId: string): Promise<any> => {
  return enqueueRequest(async () => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.get(
        `${BASE_URL}/${bookingId}/review`
      );
      return response.data.data;
    } catch (error) {
      throw formatError(error, "Could not fetch review");
    }
  });
};
