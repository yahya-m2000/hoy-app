import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isToday,
  isSameDay,
} from "date-fns";
import { useTranslation } from "react-i18next";
import {
  getMonthlyEarnings,
  getMonthBookingDensity,
  getBookingsForPropertyMonth,
} from "./mockData";
import { adaptBookingData, adaptBookingsData } from "./adapters";

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

import { DetailedBookingData, CalendarBookingData } from "@core/types/booking.types";

export interface MonthData {
  month: Date;
  totalEarnings: number;
  bookingDensity: number; // 0-1 scale
  hasBookings: boolean;
  isBlocked: boolean;
}

/**
 * Generate a month matrix containing only the current month's days
 * No padding with previous/next month days
 */
export function generateCurrentMonthOnlyMatrix(date: Date): DayMeta[][] {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("generateCurrentMonthOnlyMatrix: Invalid date provided", date);
    const fallbackDate = new Date();
    return generateCurrentMonthOnlyMatrixSafe(fallbackDate);
  }

  return generateCurrentMonthOnlyMatrixSafe(date);
}

/**
 * Safe internal function to generate current month only matrix
 */
function generateCurrentMonthOnlyMatrixSafe(date: Date): DayMeta[][] {
  try {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Get all days in the current month
    const monthDays = eachDayOfInterval({
      start: monthStart,
      end: monthEnd,
    });

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
        isCurrentMonth: false, // Mark as not current month
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
        isToday: isToday(day),
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
          isCurrentMonth: false, // Mark as not current month
          isToday: false,
          isAvailable: false,
          price: 0,
        });
      }
      matrix.push([...currentWeek]);
    }

    return matrix;
  } catch (error) {
    console.error("Error generating current month only matrix:", error);
    return [];
  }
}

/**
 * Generate a 6x7 matrix for a month view
 * Includes days from previous/next month to fill the grid
 */
export function generateMonthMatrix(date: Date): DayMeta[][] {
  // Enhanced validation
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("generateMonthMatrix: Invalid date provided", date);
    // Return a valid matrix with current month as fallback
    const fallbackDate = new Date();
    return generateMonthMatrixSafe(fallbackDate);
  }

  return generateMonthMatrixSafe(date);
}

/**
 * Safe internal function to generate month matrix
 */
function generateMonthMatrixSafe(date: Date): DayMeta[][] {
  try {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // 0 = Sunday

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    // Ensure we have exactly 42 days (6 weeks x 7 days)
    while (days.length < 42) {
      const lastDay = days[days.length - 1];
      const nextDay = new Date(lastDay);
      nextDay.setDate(nextDay.getDate() + 1);
      days.push(nextDay);
    }

    // Create 6 weeks of 7 days each
    const matrix: DayMeta[][] = [];
    for (let week = 0; week < 6; week++) {
      const weekDays: DayMeta[] = [];
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day;
        const currentDate = days[dayIndex];

        if (
          !currentDate ||
          !(currentDate instanceof Date) ||
          isNaN(currentDate.getTime())
        ) {
          // Fallback for invalid dates
          const fallbackDate = new Date(date.getFullYear(), date.getMonth(), 1);
          weekDays.push({
            date: fallbackDate,
            isCurrentMonth: false,
            isToday: false,
            isAvailable: false,
            price: 0,
          });
        } else {
          weekDays.push({
            date: currentDate,
            isCurrentMonth: isSameMonth(currentDate, date),
            isToday: isToday(currentDate),
            isAvailable: true, // Default to available
            price: 120, // Default price
          });
        }
      }
      matrix.push(weekDays);
    }

    return matrix;
  } catch (error) {
    console.error("Error generating month matrix:", error);
    // Return empty but valid matrix as fallback
    return Array(6)
      .fill(null)
      .map(() =>
        Array(7)
          .fill(null)
          .map((_, index) => ({
            date: new Date(date.getFullYear(), date.getMonth(), index + 1),
            isCurrentMonth: false,
            isToday: false,
            isAvailable: false,
            price: 0,
          }))
      );
  }
}

/**
 * Generate a clean month matrix showing only current month days
 * Maintains proper week structure but filters out non-current month days
 */
export function generateCleanMonthMatrix(date: Date): DayMeta[][] {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("generateCleanMonthMatrix: Invalid date provided", date);
    const fallbackDate = new Date();
    return generateCleanMonthMatrixSafe(fallbackDate);
  }

  return generateCleanMonthMatrixSafe(date);
}

function generateCleanMonthMatrixSafe(date: Date): DayMeta[][] {
  try {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }); // 0 = Sunday

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    // Create matrix with all 7-day weeks but mark non-current month days
    const matrix: DayMeta[][] = [];
    for (let week = 0; week < Math.ceil(days.length / 7); week++) {
      const weekDays: DayMeta[] = [];
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day;
        if (dayIndex < days.length) {
          const currentDate = days[dayIndex];
          const isCurrentMonth = isSameMonth(currentDate, date);

          weekDays.push({
            date: currentDate,
            isCurrentMonth,
            isToday: isToday(currentDate),
            isAvailable: isCurrentMonth, // Only current month days are available
            price: isCurrentMonth ? 120 : 0,
          });
        }
      }
      // Add the week if it has 7 days
      if (weekDays.length === 7) {
        matrix.push(weekDays);
      }
    }

    return matrix;
  } catch (error) {
    console.error("Error generating clean month matrix:", error);
    return [];
  }
}

/**
 * Get the number of weeks needed for a given month
 */
export function getWeeksInMonth(date: Date): number {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 6; // fallback
  }

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return Math.ceil(days.length / 7);
}

// Cache for year data to avoid regenerating on every render
const yearDataCache = new Map<string, MonthData[]>();

/**
 * Clear the year data cache (useful when property changes or data updates)
 */
export function clearYearDataCache() {
  yearDataCache.clear();
  console.log("Year data cache cleared");
}

/**
 * Generate year view data with monthly summaries (cached)
 */
export function generateYearData(
  year: number,
  propertyId?: string
): MonthData[] {
  if (!year || isNaN(year) || year < 1900 || year > 2100) {
    console.warn("generateYearData: Invalid year provided", year);
    return []; // Return empty array for invalid year
  }

  // Update cache key to include propertyId
  const cacheKey = `${year}-${propertyId || "all"}`;

  // Check cache first
  if (yearDataCache.has(cacheKey)) {
    return yearDataCache.get(cacheKey)!;
  }

  try {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));

    const months = eachMonthOfInterval({
      start: yearStart,
      end: yearEnd,
    });

    const result = months.map((month) => {
      // Ensure each month is a valid Date object
      if (!month || !(month instanceof Date) || isNaN(month.getTime())) {
        console.warn("Invalid month generated for year", year, month);
        return {
          month: new Date(year, 0, 1), // Fallback to January
          totalEarnings: 0,
          bookingDensity: 0,
          hasBookings: false,
          isBlocked: false,
        };
      }
      console.log("Calculating data for month:", month);
      return {
        month,
        totalEarnings: getMonthlyEarnings(month, propertyId),
        bookingDensity: getMonthBookingDensity(month, propertyId),
        hasBookings: getBookingsForPropertyMonth(month, propertyId).length > 0,
        isBlocked: false, // Could be enhanced with real blocked dates logic
      };
    });
    // Cache the result for future use
    yearDataCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error generating year data:", error);
    return []; // Return empty array on error
  }
}

/**
 * Check if a date is within a booking range
 */
export function isDateInBooking(date: Date, booking: CalendarBookingData): boolean {
  return date >= booking.startDate && date <= booking.endDate;
}

/**
 * Get all dates in a range
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  if (!startDate || !endDate) return [];

  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
}

/**
 * Calculate booking pill position and width for a specific month
 */
export function calculateBookingPillLayout(
  booking: CalendarBookingData,
  monthMatrix: DayMeta[][],
  dayWidth: number,
  dayHeight: number
) {
  const pills: {
    top: number;
    left: number;
    width: number;
    isFirst: boolean;
    isLast: boolean;
    isFirstInMonth: boolean;
    isLastInMonth: boolean;
  }[] = [];

  // Track if this is the overall first/last day of the booking
  let hasFoundFirstDay = false;
  let hasFoundLastDay = false;

  for (let weekIndex = 0; weekIndex < monthMatrix.length; weekIndex++) {
    const week = monthMatrix[weekIndex];
    let startDayIndex = -1;
    let endDayIndex = -1;

    // Find booking days in this week that belong to the current month
    for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
      const day = week[dayIndex];

      // Only include days that belong to the current month AND are part of the booking
      if (day.isCurrentMonth && isDateInBooking(day.date, booking)) {
        if (startDayIndex === -1) startDayIndex = dayIndex;
        endDayIndex = dayIndex;
      }
    }

    // Create pill for this week if booking exists in current month
    if (startDayIndex !== -1) {
      const pillWidth = (endDayIndex - startDayIndex + 1) * dayWidth;
      const pillLeft = startDayIndex * dayWidth;
      const pillTop = weekIndex * dayHeight;

      const isActualFirst = isSameDay(
        week[startDayIndex].date,
        booking.startDate
      );
      const isActualLast = isSameDay(week[endDayIndex].date, booking.endDate);

      if (isActualFirst) hasFoundFirstDay = true;
      if (isActualLast) hasFoundLastDay = true;

      pills.push({
        top: pillTop,
        left: pillLeft,
        width: pillWidth,
        isFirst: isActualFirst,
        isLast: isActualLast,
        isFirstInMonth: startDayIndex === 0 || !hasFoundFirstDay, // First in month or overall first
        isLastInMonth: endDayIndex === week.length - 1 || !hasFoundLastDay, // Last in month or overall last
      });
    }
  }

  return pills;
}

/**
 * Format month name for display using translation keys
 */
export function formatMonthName(date: Date, short: boolean = false): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("formatMonthName: Invalid date provided", date);
    return "Invalid Date";
  }

  try {
    // Get month index (0-11)
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    
    // Month names array for translation keys
    const monthKeys = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    
    const monthShortKeys = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    
    // Return the translation key that can be used with t() function
    const monthKey = short ? monthShortKeys[monthIndex] : monthKeys[monthIndex];
    const translationKey = short ? `calendar.monthsShort.${monthKey}` : `calendar.months.${monthKey}`;
    
    // For now, return the key - the actual translation will be handled by the component using this function
    return short ? `${translationKey} ${year}` : `${translationKey} ${year}`;
  } catch (error) {
    console.error("Error formatting month name:", error);
    return "Invalid Date";
  }
}

/**
 * Format day number
 */
export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

/**
 * Get weekday headers using translation keys (Sunday first to match calendar grid)
 */
export function getWeekdayHeaders(short: boolean = true): string[] {
  if (short) {
    return [
      "calendar.weekdaysShort.sun",
      "calendar.weekdaysShort.mon", 
      "calendar.weekdaysShort.tue",
      "calendar.weekdaysShort.wed",
      "calendar.weekdaysShort.thu",
      "calendar.weekdaysShort.fri",
      "calendar.weekdaysShort.sat"
    ];
  } else {
    return [
      "calendar.weekdays.sunday",
      "calendar.weekdays.monday",
      "calendar.weekdays.tuesday", 
      "calendar.weekdays.wednesday",
      "calendar.weekdays.thursday",
      "calendar.weekdays.friday",
      "calendar.weekdays.saturday"
    ];
  }
}

// Cache for calendar cells generation
const calendarCellsCache = new Map<
  string,
  {
    cells: {
      dayNumber: number | null;
      isValidDay: boolean;
      isToday: boolean;
      date: Date | null;
    }[][];
    daysInMonth: number;
    firstDayWeekday: number;
  }
>();

/**
 * Generate calendar cell data for a month thumbnail view (cached)
 * Returns a 6x7 grid with proper day mapping and validity checks
 */
export function generateCalendarCells(date: Date): {
  cells: {
    dayNumber: number | null;
    isValidDay: boolean;
    isToday: boolean;
    date: Date | null;
  }[][];
  daysInMonth: number;
  firstDayWeekday: number;
} {
  // Create cache key from date
  const cacheKey = `${date.getFullYear()}-${date.getMonth()}`;

  // Check if we have cached result
  if (calendarCellsCache.has(cacheKey)) {
    return calendarCellsCache.get(cacheKey)!;
  }

  if (!date || isNaN(date.getTime())) {
    // Return empty structure for invalid dates
    const emptyCells = Array(6)
      .fill(null)
      .map(() =>
        Array(7)
          .fill(null)
          .map(() => ({
            dayNumber: null,
            isValidDay: false,
            isToday: false,
            date: null,
          }))
      );
    return { cells: emptyCells, daysInMonth: 0, firstDayWeekday: 0 };
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth();
  const currentDayOfMonth = today.getDate();
  // Get calendar info for the month
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekdayJS = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  // Convert to Monday-based: Monday = 0, Tuesday = 1, ..., Sunday = 6
  const firstDayWeekday = firstDayWeekdayJS === 0 ? 6 : firstDayWeekdayJS - 1;
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  const cells = [];
  const numRows = 6;
  const numCols = 7;

  for (let row = 0; row < numRows; row++) {
    const rowCells = [];
    for (let col = 0; col < numCols; col++) {
      const cellIndex = row * numCols + col;
      const dayNumber = cellIndex - firstDayWeekday + 1;
      const isValidDay = dayNumber >= 1 && dayNumber <= daysInMonth;
      const isToday =
        isCurrentMonth && isValidDay && dayNumber === currentDayOfMonth;

      // Create actual date for valid days
      const cellDate = isValidDay
        ? new Date(date.getFullYear(), date.getMonth(), dayNumber)
        : null;

      rowCells.push({
        dayNumber: isValidDay ? dayNumber : null,
        isValidDay,
        isToday,
        date: cellDate,
      });
    }
    cells.push(rowCells);
  }
  const result = {
    cells,
    daysInMonth,
    firstDayWeekday,
  };

  // Cache the result
  calendarCellsCache.set(cacheKey, result);

  return result;
}

// Adapter functions moved to adapters.ts to avoid circular dependencies
// Import from './adapters' instead
