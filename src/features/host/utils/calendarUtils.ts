/**
 * Calendar Utility Functions
 * Helper functions for calendar operations and date management
 */

import { CalendarDay ,CalendarMonth, CalendarBooking } from "src/core/types/calendar.types";
import { Booking } from "src/core";

/**
 * Convert a regular Booking to CalendarBooking
 */
const convertToCalendarBooking = (booking: Booking): CalendarBooking => ({
  id: booking._id,
  propertyId: booking.propertyId,
  guest: {
    id: booking.guestId,
    firstName: 'Guest', // Default since Booking doesn't have guest name
    lastName: '',
    avatar: undefined, // Not available in Booking interface
    email: '', // Not available in Booking interface
  },
  checkIn: booking.checkIn,
  checkOut: booking.checkOut,
  status: (booking.status as "confirmed" | "pending" | "cancelled") || "pending",
  totalAmount: booking.totalAmount,
  currency: booking.currency
});

/**
 * Generate calendar days for a specific month
 */
export const generateCalendarMonth = (
  year: number,
  month: number,
  basePrice: number,
  currency: string,
  bookings: Booking[] = []
): CalendarMonth => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateString = formatDateToISO(currentDate);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // Find booking for this date
    const booking = bookings.find((b) =>
      isDateInRange(dateString, b.checkIn, b.checkOut)
    );

    const calendarDay: CalendarDay = {
      date: dateString,
      isAvailable: !booking && !isPastDate(currentDate),
      price: basePrice,
      currency,
      booking: booking ? convertToCalendarBooking(booking) : undefined,
      isWeekend,
    };

    days.push(calendarDay);
  }

  return {
    year,
    month,
    days,
  };
};

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Parse ISO date string to Date object
 */
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString + "T00:00:00");
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if a date is within a booking range
 */
export const isDateInRange = (
  date: string,
  startDate: string,
  endDate: string
): boolean => {
  const targetDate = parseISODate(date);
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);

  return targetDate >= start && targetDate < end; // Exclude checkout date
};

/**
 * Get date range between two dates
 */
export const getDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);

  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(formatDateToISO(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (checkIn: string, checkOut: string): number => {
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get month name from month number
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[month - 1];
};

/**
 * Get abbreviated month name
 */
export const getMonthAbbreviation = (month: number): string => {
  const monthAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthAbbr[month - 1];
};

/**
 * Get day of week abbreviation
 */
export const getDayAbbreviation = (dayOfWeek: number): string => {
  const dayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayAbbr[dayOfWeek];
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency.toUpperCase()} ${price}`;
  }
};

/**
 * Calculate weekend price with multiplier
 */
export const calculateWeekendPrice = (
  basePrice: number,
  weekendMultiplier: number = 1.2
): number => {
  return Math.round(basePrice * weekendMultiplier);
};

/**
 * Apply promotion discount to price
 */
export const applyPromotion = (
  price: number,
  promotionPercentage: number
): number => {
  return Math.round(price * (1 - promotionPercentage / 100));
};

/**
 * Validate date selection for minimum nights requirement
 */
export const validateMinimumNights = (
  selectedDates: string[],
  minimumNights: number
): boolean => {
  return selectedDates.length >= minimumNights;
};

/**
 * Sort dates in ascending order
 */
export const sortDates = (dates: string[]): string[] => {
  return dates.sort(
    (a, b) => parseISODate(a).getTime() - parseISODate(b).getTime()
  );
};

/**
 * Generate calendar days for a specific month with basic pricing
 */
export const generateCalendarDays = (
  year: number,
  month: number,
  basePrice: number = 100,
  currency: string = "USD",
  bookings: Booking[] = []
): CalendarDay[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const dateString = formatDateToISO(currentDate);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    // Find booking for this date
    const booking = bookings.find((b) =>
      isDateInRange(dateString, b.checkIn, b.checkOut)
    );

    const calendarDay: CalendarDay = {
      date: dateString,
      isAvailable: !booking && !isPastDate(currentDate),
      price: isWeekend ? calculateWeekendPrice(basePrice) : basePrice,
      currency,
      booking: booking ? convertToCalendarBooking(booking) : undefined,
      isWeekend,
    };

    days.push(calendarDay);
  }

  return days;
};

/**
 * Format date for API requests (alias for formatDateToISO)
 */
export const formatDateForAPI = formatDateToISO;
