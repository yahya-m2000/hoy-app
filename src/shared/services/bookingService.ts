/**
 * Booking Service for the Hoy application
 * Handles API calls related to property bookings
 */

import api from "@shared/services/core/client";
import { formatError } from "@shared/utils/error";
import { Platform } from "react-native";
import type {
  Booking,
  BookingData,
  BookingGuests,
  BookingContactInfo,
  AvailabilityParams,
  PriceCalculationParams,
  PriceDetails,
} from "@shared/types/booking";

// Re-export types for modules that import from this service
export type {
  Booking,
  BookingData,
  BookingGuests,
  BookingContactInfo,
  AvailabilityParams,
  PriceCalculationParams,
  PriceDetails,
} from "@shared/types/booking";

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
      console.log(
        "🔄 Making API call to get user bookings with status:",
        status
      );
      const response: AxiosResponse<any> = await api.get(BASE_URL, {
        params: { status },
      });
      console.log("📨 Raw API response structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasDataProperty: !!(response.data && response.data.data),
        dataPropertyType:
          response.data && response.data.data
            ? typeof response.data.data
            : "undefined",
        hasDataDataProperty: !!(
          response.data &&
          response.data.data &&
          response.data.data.data
        ),
        dataDataType:
          response.data && response.data.data && response.data.data.data
            ? typeof response.data.data.data
            : "undefined",
        isDataDataArray: !!(
          response.data &&
          response.data.data &&
          response.data.data.data &&
          Array.isArray(response.data.data.data)
        ),
        arrayLength:
          response.data &&
          response.data.data &&
          response.data.data.data &&
          Array.isArray(response.data.data.data)
            ? response.data.data.data.length
            : 0,
      });

      const responseData = response.data;

      // Handle the actual API response format: {success: true, data: {data: [...bookings...], pagination: {...}}}
      if (
        responseData &&
        responseData.data &&
        responseData.data.data &&
        Array.isArray(responseData.data.data)
      ) {
        console.log(
          "✅ Successfully extracted bookings array from response.data.data:",
          responseData.data.data.length,
          "items"
        );
        const bookingsArray = responseData.data.data;
        console.log(
          "🔍 Returning bookings array. Length:",
          bookingsArray.length,
          "Type:",
          typeof bookingsArray,
          "IsArray:",
          Array.isArray(bookingsArray)
        );
        return bookingsArray; // This should return the array directly
      }

      // Fallback: Handle format {data: [...bookings...], pagination: {...}}
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        console.log(
          "✅ Successfully extracted bookings array from response.data:",
          responseData.data.length,
          "items"
        );
        const bookingsArray = responseData.data;
        console.log(
          "🔍 Returning bookings array. Length:",
          bookingsArray.length,
          "Type:",
          typeof bookingsArray,
          "IsArray:",
          Array.isArray(bookingsArray)
        );
        return bookingsArray; // This should return the array directly
      }

      // Fallback: if the response itself is an array
      if (Array.isArray(responseData)) {
        console.log(
          "✅ Response is direct array:",
          responseData.length,
          "items"
        );
        return responseData;
      }

      console.log(
        "⚠️ No bookings array found in response, returning empty array"
      );
      console.log("Response structure:", JSON.stringify(responseData, null, 2));
      return [];
    } catch (error) {
      console.error("❌ Error in getUserBookings:", error);
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
