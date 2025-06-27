/**
 * Utility functions for Property Reservation Module
 */

import type { ReservationFormData, Reservation, PriceDetails } from "../types";
import type { PropertyType } from "@shared/types/property";

/**
 * Parse initial dates from route parameters
 */
export const parseInitialDates = (params: any) => {
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let hasInitialDates = false;

  try {
    if (params.startDate) {
      startDate = new Date(params.startDate as string);
      hasInitialDates = true;
    }
    if (params.endDate) {
      endDate = new Date(params.endDate as string);
      hasInitialDates = true;
    }
  } catch (error) {
    console.warn("Failed to parse initial dates:", error);
    startDate = null;
    endDate = null;
    hasInitialDates = false;
  }

  return { startDate, endDate, hasInitialDates };
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (
  startDate: Date | null,
  endDate: Date | null
): number => {
  if (!startDate || !endDate) return 0;

  const timeDiff = endDate.getTime() - startDate.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return Math.max(0, dayDiff);
};

/**
 * Calculate total guest count
 */
export const calculateTotalGuests = (
  guests: ReservationFormData["guests"]
): number => {
  return guests.adults + guests.children + guests.infants + guests.pets;
};

/**
 * Format reservation data for API submission
 */
export const formatReservationData = (
  formData: ReservationFormData,
  property: PropertyType,
  unit: any,
  user: any,
  priceDetails: PriceDetails | null,
  paymentMethod: any,
  specialRequests: string
) => {
  return {
    propertyId: property._id,
    unitId: unit?._id,
    userId: user?.id || user?._id,
    checkIn: formData.startDate?.toISOString(),
    checkOut: formData.endDate?.toISOString(),
    guests: formData.guests,
    paymentMethod,
    priceDetails,
    specialRequests,
    totalAmount: priceDetails?.totalPrice || 0,
    currency: "USD",
    status: "pending",
  };
};

/**
 * Create mock reservation for testing
 */
export const createMockReservation = (
  formData: ReservationFormData,
  property: PropertyType,
  unit: any,
  paymentMethod: any,
  reservationData: any
): Reservation => {
  const now = new Date();

  return {
    id: `mock-${Date.now()}`,
    propertyId: property._id || "mock-property",
    unitId: unit?._id,
    userId: "mock-user",
    startDate: formData.startDate || now,
    endDate: formData.endDate || new Date(now.getTime() + 24 * 60 * 60 * 1000),
    guests: formData.guests,
    paymentMethod,
    priceDetails: {
      totalPrice: reservationData.totalAmount || 0,
      cleaningFee: 0,
      serviceFee: 0,
      taxes: 0,
      basePrice: reservationData.totalAmount || 0,
      nights: calculateNights(formData.startDate, formData.endDate),
    },
    status: "confirmed",
    specialRequests: formData.specialRequests,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Format date for display
 */
export const formatDate = (
  date: Date | null,
  locale: string = "en-US"
): string => {
  if (!date) return "";

  return date.toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date range for display
 */
export const formatDateRange = (
  startDate: Date | null,
  endDate: Date | null,
  locale: string = "en-US"
): string => {
  if (!startDate || !endDate) return "";

  const start = formatDate(startDate, locale);
  const end = formatDate(endDate, locale);
  const nights = calculateNights(startDate, endDate);

  return `${start} - ${end} (${nights} ${nights === 1 ? "night" : "nights"})`;
};

/**
 * Format price for display
 */
export const formatPrice = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Validate reservation form data
 */
export const validateReservationData = (
  formData: ReservationFormData
): string[] => {
  const errors: string[] = [];

  if (!formData.startDate) {
    errors.push("Check-in date is required");
  }

  if (!formData.endDate) {
    errors.push("Check-out date is required");
  }

  if (
    formData.startDate &&
    formData.endDate &&
    formData.startDate >= formData.endDate
  ) {
    errors.push("Check-out date must be after check-in date");
  }

  if (formData.guests.adults < 1) {
    errors.push("At least one adult guest is required");
  }

  if (!formData.paymentMethod) {
    errors.push("Payment method is required");
  }

  return errors;
};
