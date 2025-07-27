/**
 * Utility functions for reservation calculations and formatting
 * 
 * @module @features/properties/components/reservation/utils/reservationUtils
 */

import { format } from 'date-fns';
import type { PropertyType } from '@core/types';

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) return "";
  try {
    return format(date, "EEE, MMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;
  try {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, daysDiff);
  } catch (error) {
    console.error("Error calculating nights:", error);
    return 0;
  }
}

/**
 * Get safe property price from various price formats
 */
export function getSafePropertyPrice(property: PropertyType | null, unit?: any): number {
  const propertyPrice = unit?.price || property?.price || 0;
  
  if (typeof propertyPrice === "number" && !isNaN(propertyPrice)) {
    return propertyPrice;
  }
  
  if (typeof propertyPrice === "object" && propertyPrice?.amount) {
    return propertyPrice.amount;
  }
  
  return 0;
}

/**
 * Calculate total price for the stay
 */
export function calculateTotalPrice(
  property: PropertyType | null,
  unit: any,
  startDate: Date | null,
  endDate: Date | null
): number {
  const safePropertyPrice = getSafePropertyPrice(property, unit);
  const nights = calculateNights(startDate, endDate);
  return safePropertyPrice * nights;
}

/**
 * Check if current step can proceed based on validation rules
 */
export function canProceedToNextStep(
  step: number,
  startDate: Date | null,
  endDate: Date | null,
  isAvailable: boolean | null,
  adults: number,
  selectedPaymentMethod: any
): boolean {
  switch (step) {
    case 1: // Guest Details
      return Boolean(startDate && endDate && isAvailable && adults > 0);
    case 2: // Payment Method
      return Boolean(selectedPaymentMethod);
    case 3: // Confirmation
      return true;
    default:
      return false;
  }
}

/**
 * Get modal title based on current step
 */
export function getModalTitle(step: number, t: (key: string) => string): string {
  switch (step) {
    case 1: // Guest Details
      return t("features.booking.flow.guestDetails");
    case 2: // Payment Method
      return t("features.booking.flow.paymentMethod");
    case 3: // Confirmation
      return t("features.booking.flow.confirmReservation");
    default:
      return t("features.booking.flow.reservation");
  }
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Get confirmation route based on tab context
 */
export function getConfirmationRoute(currentTabContext: string): string {
  switch (currentTabContext) {
    case "home":
      return "/(tabs)/traveler/home/property/confirmation";
    case "search":
      return "/(tabs)/traveler/search/property/confirmation";
    case "wishlist":
      return "/(tabs)/traveler/wishlist/property/confirmation";
    case "bookings":
      return "/(tabs)/traveler/bookings/property/confirmation";
    case "properties":
      return "/(tabs)/traveler/properties/property/confirmation";
    default:
      return "/(tabs)/traveler/properties/property/confirmation";
  }
} 