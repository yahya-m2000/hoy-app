/**
 * Calendar-specific utilities
 * 
 * Utilities that are specific to calendar functionality and use
 * the generic date utilities from @core/utils/date
 * 
 * @module @features/calendar/utils/calendarUtils
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { CalendarBookingData } from '@core/types/booking.types';
import { dateUtils } from '@core/utils';

// Types
export interface DayMeta {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  price?: number;
  isAvailable: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
}

export interface MonthData {
  month: Date;
  totalEarnings: number;
  bookingDensity: number; // 0-1 scale
  hasBookings: boolean;
  isBlocked: boolean;
}

export interface MonthViewData {
  month: Date;
  matrix: DayMeta[][];
  bookings: CalendarBookingData[];
  key: string;
}

// Global cache for month data to prevent regeneration
const monthDataCache = new Map<string, MonthViewData>();
const monthsArrayCache = { months: null as Date[] | null };
const monthPositionsCache = new Map<string, any[]>();

/**
 * Generate array of months with stable reference (heavily cached)
 * Uses current date as center, expanded range to ensure all navigable months are covered
 */
export const generateStableMonthsArray = (): Date[] => {
  // Return cached months if available
  if (monthsArrayCache.months) {
    return monthsArrayCache.months;
  }

  const now = new Date();
  const baseMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const months = [];
  for (let i = -12; i <= 12; i++) {
    // 25 months total
    const month = new Date(
      baseMonth.getFullYear(),
      baseMonth.getMonth() + i,
      1
    );
    months.push(month);
  }

  // Cache the result
  monthsArrayCache.months = months;
  return months;
};

/**
 * Generate month data with matrix and bookings (heavily cached)
 */
export const generateMonthsData = async (
  months: Date[],
  propertyId?: string,
  getBookingsForPropertyMonth?: (month: Date, propertyId: string) => Promise<CalendarBookingData[]>,
  getBookingsForMonth?: (month: Date) => CalendarBookingData[]
): Promise<MonthViewData[]> => {
  const monthDataPromises = months.map(async (month) => {
    const key = `month-${month.getFullYear()}-${month.getMonth()}-${
      propertyId || "all"
    }`;

    // Return cached data if available
    if (monthDataCache.has(key)) {
      return monthDataCache.get(key)!;
    }

    // Generate new data
    const matrix = generateCleanMonthMatrix(month);
    const bookings = propertyId && getBookingsForPropertyMonth
      ? await getBookingsForPropertyMonth(month, propertyId)
      : getBookingsForMonth 
        ? getBookingsForMonth(month)
        : [];

    const monthData: MonthViewData = {
      month,
      matrix,
      bookings,
      key,
    };

    // Cache the result
    monthDataCache.set(key, monthData);
    return monthData;
  });

  return Promise.all(monthDataPromises);
};

/**
 * Calculate month positions for header updates during free scroll (cached)
 */
export const calculateMonthPositions = (
  monthsData: MonthViewData[],
  dayHeight: number,
  monthSpacing: number
) => {
  const cacheKey = `${monthsData.length}_${dayHeight}_${monthSpacing}`;

  // Return cached positions if available
  if (monthPositionsCache.has(cacheKey)) {
    return monthPositionsCache.get(cacheKey)!;
  }

  const monthTitleHeight = 40; // Should match the title height in MemoizedMonth
  let cumulativeHeight = 0;

  const positions = monthsData.map((monthData) => {
    const totalMonthHeight =
      monthData.matrix.length * dayHeight + monthTitleHeight + monthSpacing;

    const position = cumulativeHeight;
    cumulativeHeight += totalMonthHeight;

    return {
      position,
      height: totalMonthHeight,
    };
  });

  // Cache the result
  monthPositionsCache.set(cacheKey, positions);
  return positions;
};

/**
 * Clear all caches for memory management
 */
export const clearCalendarCaches = () => {
  monthDataCache.clear();
  monthsArrayCache.months = null;
  monthPositionsCache.clear();
};

/**
 * Generate a clean month matrix with DayMeta objects
 */
export function generateCleanMonthMatrix(date: Date): DayMeta[][] {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("generateCleanMonthMatrix: Invalid date provided", date);
    const fallbackDate = new Date();
    return generateCleanMonthMatrixSafe(fallbackDate);
  }

  return generateCleanMonthMatrixSafe(date);
}

/**
 * Safe internal function to generate clean month matrix
 */
function generateCleanMonthMatrixSafe(date: Date): DayMeta[][] {
  try {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // Get all days in the current month
    const monthDays = dateUtils.getDatesInRange(monthStart, monthEnd);

    // Find which day of week the month starts on (0 = Sunday)
    const startDayOfWeek = monthStart.getDay();

    // Create matrix with proper 7-day week structure
    const matrix: DayMeta[][] = [];
    let currentWeek: DayMeta[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(
          monthStart.getTime() - (startDayOfWeek - i) * 24 * 60 * 60 * 1000
        ),
        isCurrentMonth: false,
        isToday: false,
        isAvailable: false,
        price: 0,
      });
    }

    // Add all days of the current month
    for (const day of monthDays) {
      currentWeek.push({
        date: day,
        isCurrentMonth: true,
        isToday: dateUtils.isDateToday(day),
        isAvailable: true,
        price: 120,
      });

      // If week is complete, add it to matrix and start new week
      if (currentWeek.length === 7) {
        matrix.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Fill remaining days of last week with next month days
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length;
      for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(
          monthEnd.getTime() + i * 24 * 60 * 60 * 1000
        );
        currentWeek.push({
          date: nextMonthDay,
          isCurrentMonth: false,
          isToday: false,
          isAvailable: false,
          price: 0,
        });
      }
      matrix.push([...currentWeek]);
    }

    return matrix;
  } catch (error) {
    console.error("Error generating clean month matrix:", error);
    return [];
  }
}

/**
 * Check if a date is within a booking range
 */
export function isDateInBooking(date: Date, booking: CalendarBookingData): boolean {
  if (!date || !booking.startDate || !booking.endDate) return false;
  
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  
  return date >= startDate && date <= endDate;
}

/**
 * Calculate booking pill layout for visual representation
 */
export function calculateBookingPillLayout(
  booking: CalendarBookingData,
  monthMatrix: DayMeta[][],
  dayWidth: number,
  dayHeight: number
) {
  if (!booking.startDate || !booking.endDate) return null;

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  // Find the positions of start and end dates in the matrix
  let startWeek = -1;
  let startDay = -1;
  let endWeek = -1;
  let endDay = -1;

  for (let week = 0; week < monthMatrix.length; week++) {
    for (let day = 0; day < monthMatrix[week].length; day++) {
      const cellDate = monthMatrix[week][day].date;
      
      if (dateUtils.isSameDate(cellDate, startDate)) {
        startWeek = week;
        startDay = day;
      }
      
      if (dateUtils.isSameDate(cellDate, endDate)) {
        endWeek = week;
        endDay = day;
      }
    }
  }

  if (startWeek === -1 || startDay === -1) return null;

  // Calculate layout properties
  const isMultiWeek = startWeek !== endWeek;
  const width = isMultiWeek 
    ? (7 - startDay) * dayWidth 
    : (endDay - startDay + 1) * dayWidth;
  
  const height = dayHeight * 0.6; // 60% of day height
  const left = startDay * dayWidth;
  const top = startWeek * dayHeight + dayHeight * 0.2; // 20% from top

  return {
    width,
    height,
    left,
    top,
    isMultiWeek,
    startWeek,
    endWeek,
  };
}

/**
 * Generate year data for year view
 */
export function generateYearData(
  year: number,
  propertyId?: string,
  getBookingsForPropertyMonth?: (month: Date, propertyId: string) => Promise<CalendarBookingData[]>,
  getBookingsForMonth?: (month: Date) => CalendarBookingData[]
): MonthData[] {
  const months: MonthData[] = [];
  
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1);
    
    // Default values - these would be calculated from actual booking data
    const monthData: MonthData = {
      month: monthDate,
      totalEarnings: 0,
      bookingDensity: 0,
      hasBookings: false,
      isBlocked: false,
    };
    
    months.push(monthData);
  }
  
  return months;
} 