/**
 * Date Utilities
 * 
 * Generic date manipulation and formatting utilities that can be used
 * across the entire application, not specific to any feature.
 * 
 * @module @core/utils/date
 * @author Hoy Development Team
 * @version 1.0.0
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth as dateFnsIsSameMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isToday,
  isSameDay,
} from "date-fns";

/**
 * Generate a 6x7 matrix for a month view
 * Includes days from previous/next month to fill the grid
 */
export function generateMonthMatrix(date: Date): Array<Array<{
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isAvailable: boolean;
  price?: number;
}>> {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("generateMonthMatrix: Invalid date provided", date);
    const fallbackDate = new Date();
    return generateMonthMatrixSafe(fallbackDate);
  }

  return generateMonthMatrixSafe(date);
}

/**
 * Safe internal function to generate month matrix
 */
function generateMonthMatrixSafe(date: Date) {
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
    const matrix = [];
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
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
            isCurrentMonth: dateFnsIsSameMonth(currentDate, date),
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
    return [];
  }
}

/**
 * Generate a clean month matrix (current month only)
 */
export function generateCleanMonthMatrix(date: Date) {
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
function generateCleanMonthMatrixSafe(date: Date) {
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
    const matrix = [];
    let currentWeek = [];

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
 * Get the number of weeks in a month
 */
export function getWeeksInMonth(date: Date): number {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("getWeeksInMonth: Invalid date provided", date);
    return 0;
  }

  try {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return Math.ceil(days.length / 7);
  } catch (error) {
    console.error("Error calculating weeks in month:", error);
    return 0;
  }
}

/**
 * Get all dates in a range
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    console.warn("getDatesInRange: Invalid dates provided", { startDate, endDate });
    return [];
  }

  try {
    return eachDayOfInterval({ start: startDate, end: endDate });
  } catch (error) {
    console.error("Error getting dates in range:", error);
    return [];
  }
}

/**
 * Format month name
 */
export function formatMonthName(date: Date, short: boolean = false): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("formatMonthName: Invalid date provided", date);
    return "Invalid Date";
  }

  try {
    const formatString = short ? "MMM" : "MMMM";
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting month name:", error);
    return "Invalid Date";
  }
}

/**
 * Format day number
 */
export function formatDayNumber(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("formatDayNumber: Invalid date provided", date);
    return "0";
  }

  try {
    return format(date, "d");
  } catch (error) {
    console.error("Error formatting day number:", error);
    return "0";
  }
}

/**
 * Get weekday headers
 */
export function getWeekdayHeaders(short: boolean = true): string[] {
  try {
    const formatString = short ? "EEE" : "EEEE";
    const baseDate = new Date(2024, 0, 1); // January 1, 2024 (Monday)
    
    const headers = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + i);
      headers.push(format(day, formatString));
    }
    
    return headers;
  } catch (error) {
    console.error("Error generating weekday headers:", error);
    return short ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : 
                   ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  }
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date): boolean {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  return isToday(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
    return false;
  }
  return isSameDay(date1, date2);
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
    return false;
  }
  return dateFnsIsSameMonth(date1, date2);
} 