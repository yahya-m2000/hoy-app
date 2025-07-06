/**
 * Real booking data utilities
 * Fetches and transforms actual booking data from the API
 */

import { CalendarBookingData } from "@core/types";
import { fetchHostBookings } from "@core/api/services/host";
import { logErrorWithContext } from "@core/utils/sys/error";

// Cache for booking data: propertyId-year => CalendarBookingData[]
const yearlyBookingCache = new Map<string, CalendarBookingData[]>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
let lastCacheTime = 0;

// Track in-flight fetch promises so that concurrent requests can share the same promise
const inFlightFetches = new Map<string, Promise<CalendarBookingData[]>>();

/**
 * Transform booking data for calendar display
 */
const transformBookingForCalendar = (booking: any): CalendarBookingData => {
  console.log('🔄 Transforming booking:', booking);
  
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const currentDate = new Date();
  
  console.log('📅 Booking dates:', {
    checkIn: checkInDate.toISOString(),
    checkOut: checkOutDate.toISOString(),
    current: currentDate.toISOString()
  });
  
  // Determine booking status based on dates
  let status: "past" | "active" | "upcoming" = "upcoming";
  if (checkInDate <= currentDate && checkOutDate > currentDate) {
    status = "active";
  } else if (checkOutDate <= currentDate) {
    status = "past";
  }

  // Extract guest name from the new API structure
  let guestName = "Guest";
  if (booking.userId && booking.userId.email) {
    // Use email as fallback if no name is available
    guestName = booking.userId.email;
  }
  if (booking.contactInfo && booking.contactInfo.name) {
    guestName = booking.contactInfo.name;
  }

  const transformed = {
    id: booking._id,
    startDate: checkInDate,
    endDate: checkOutDate,
    guestName,
    guestAvatar: undefined, // Not available in current API response
    status,
    totalPrice: booking.totalPrice || 0,
  };
  
  console.log('✅ Transformed booking result:', transformed);
  
  return transformed;
};

/**
 * Clear cache if expired
 */
function clearCacheIfExpired() {
  const now = Date.now();
  if (now - lastCacheTime > CACHE_EXPIRY) {
    yearlyBookingCache.clear();
    lastCacheTime = now;
  }
}

/**
 * Get bookings for a specific property and month
 */
export async function getBookingsForPropertyMonth(
  date: Date,
  propertyId?: string
): Promise<CalendarBookingData[]> {
  console.log('🔍 getBookingsForPropertyMonth called:', {
    date: date.toISOString(),
    propertyId,
    dateMonth: date.getMonth(),
    dateYear: date.getFullYear()
  });

  clearCacheIfExpired();
  
  // Return empty array if no property ID
  if (!propertyId) {
    console.log('❌ No property ID provided, returning empty bookings');
    return [];
  }

  const year = date.getFullYear();
  const cacheKey = `${propertyId}-${year}`;
  
  console.log('📦 Cache check:', { cacheKey, hasCached: yearlyBookingCache.has(cacheKey) });
  
  // Check cache first
  if (yearlyBookingCache.has(cacheKey)) {
    const allBookings = yearlyBookingCache.get(cacheKey)!;
    console.log('✅ Using cached bookings:', { count: allBookings.length });
    const filteredBookings = filterBookingsForMonth(allBookings, date);
    console.log('📅 Filtered bookings for month:', { 
      month: date.getMonth() + 1, 
      year: date.getFullYear(),
      count: filteredBookings.length,
      bookings: filteredBookings 
    });
    return filteredBookings;
  }

  // If another request is already fetching this data, await it
  if (inFlightFetches.has(cacheKey)) {
    console.log('⏳ Waiting for existing fetch...');
    const existingPromise = inFlightFetches.get(cacheKey)!;
    const allBookings = await existingPromise;
    const filteredBookings = filterBookingsForMonth(allBookings, date);
    console.log('📅 Filtered bookings from existing fetch:', { 
      month: date.getMonth() + 1, 
      year: date.getFullYear(),
      count: filteredBookings.length,
      bookings: filteredBookings 
    });
    return filteredBookings;
  }

  // Create a fetch promise and store it in the in-flight map
  const fetchPromise = (async (): Promise<CalendarBookingData[]> => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd   = new Date(year, 11, 31);
    
    const params = {
      propertyId,
      startDate: yearStart.toISOString().split('T')[0],
      endDate:   yearEnd.toISOString().split('T')[0],
    };
    
    console.log('🌐 Making API call to fetchHostBookings:', params);
    
    try {
      const response = await fetchHostBookings(params);
      console.log('✅ API response received:', {
        bookingsCount: response.bookings?.length || 0,
        total: response.total,
        rawBookings: response.bookings
      });
      
      const allBookings = (response.bookings || []).map(transformBookingForCalendar);
      console.log('🔄 Transformed bookings:', {
        originalCount: response.bookings?.length || 0,
        transformedCount: allBookings.length,
        transformedBookings: allBookings
      });
      
      yearlyBookingCache.set(cacheKey, allBookings);
      console.log('💾 Cached bookings for key:', cacheKey);
      
      return allBookings;
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      logErrorWithContext("getBookingsForPropertyMonth", error);
      return [];
    } finally {
      // Clean up the in-flight map so future calls can initiate a new fetch after completion
      inFlightFetches.delete(cacheKey);
    }
  })();

  inFlightFetches.set(cacheKey, fetchPromise);

  const allBookings = await fetchPromise;
  const filteredBookings = filterBookingsForMonth(allBookings, date);
  console.log('📅 Final filtered bookings:', { 
    month: date.getMonth() + 1, 
    year: date.getFullYear(),
    count: filteredBookings.length,
    bookings: filteredBookings 
  });
  
  return filteredBookings;
}

function filterBookingsForMonth(bookings: CalendarBookingData[], date: Date): CalendarBookingData[] {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return bookings.filter(booking => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    return bookingStart <= monthEnd && bookingEnd >= monthStart;
  });
}

/**
 * Get monthly earnings for a property
 */
export async function getMonthlyEarnings(
  date: Date,
  propertyId?: string
): Promise<number> {
  try {
    const bookings = await getBookingsForPropertyMonth(date, propertyId);
    return bookings.reduce((total, booking) => total + booking.totalPrice, 0);
  } catch (error) {
    logErrorWithContext("getMonthlyEarnings", error);
    return 0;
  }
}

/**
 * Get month booking density (percentage of days with bookings)
 */
export async function getMonthBookingDensity(
  date: Date,
  propertyId?: string
): Promise<number> {
  try {
    const bookings = await getBookingsForPropertyMonth(date, propertyId);
    if (bookings.length === 0) return 0;

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const bookedDays = new Set<string>();

    bookings.forEach(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()) {
          bookedDays.add(d.toDateString());
        }
      }
    });

    return (bookedDays.size / daysInMonth) * 100;
  } catch (error) {
    logErrorWithContext("getMonthBookingDensity", error);
    return 0;
  }
}

/**
 * Test function to verify API connectivity and data structure
 */
export async function testBookingAPI(propertyId: string): Promise<void> {
  console.log('🧪 Testing booking API with propertyId:', propertyId);
  
  try {
    const response = await fetchHostBookings({
      propertyId,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });
    
    console.log('🧪 Test API Response:', {
      success: true,
      bookingsCount: response.bookings?.length || 0,
      total: response.total,
      pagination: response,
      sampleBooking: response.bookings?.[0]
    });
    
    if (response.bookings && response.bookings.length > 0) {
      console.log('🧪 Testing transformation of first booking...');
      const transformed = transformBookingForCalendar(response.bookings[0]);
      console.log('🧪 Transformed result:', transformed);
    }
    
  } catch (error) {
    console.error('🧪 Test API Error:', error);
  }
}

// Export for external testing
(window as any).testBookingAPI = testBookingAPI; 