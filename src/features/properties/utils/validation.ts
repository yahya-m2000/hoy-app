/**
 * Property Validation Utilities
 * Functions for validating property-related data
 */

import { PropertyFilters, ReservationRequest } from "@core/types";

/**
 * Validate a date string is in the correct format (YYYY-MM-DD)
 * @param dateString The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate check-in and check-out dates
 * @param checkIn Check-in date string
 * @param checkOut Check-out date string
 * @returns True if the dates are valid, false otherwise
 */
export const validateDateRange = (checkIn: string, checkOut: string): boolean => {
  if (!isValidDateString(checkIn) || !isValidDateString(checkOut)) {
    return false;
  }
  
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Check-out must be after check-in
  return checkOutDate > checkInDate;
};

/**
 * Validate property filters
 * @param filters The filters to validate
 * @returns An object with validation results
 */
export const validatePropertyFilters = (filters: PropertyFilters): { 
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // Validate dates if provided
  if (filters.checkIn && filters.checkOut) {
    if (!validateDateRange(filters.checkIn, filters.checkOut)) {
      errors.dates = "Check-out date must be after check-in date";
    }
  } else if (filters.checkIn && !filters.checkOut) {
    errors.checkOut = "Check-out date is required when check-in is provided";
  } else if (!filters.checkIn && filters.checkOut) {
    errors.checkIn = "Check-in date is required when check-out is provided";
  }
  
  // Validate price range if provided
  if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
    if (filters.priceMin > filters.priceMax) {
      errors.price = "Minimum price cannot be greater than maximum price";
    }
  }
  
  // Validate guests if provided
  if (filters.guests !== undefined && filters.guests < 1) {
    errors.guests = "Number of guests must be at least 1";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate a reservation request
 * @param request The reservation request to validate
 * @returns An object with validation results
 */
export const validateReservationRequest = (request: ReservationRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // Validate property ID
  if (!request.propertyId) {
    errors.propertyId = "Property ID is required";
  }
  
  // Validate dates
  if (!request.checkIn || !request.checkOut) {
    errors.dates = "Both check-in and check-out dates are required";
  } else if (!validateDateRange(request.checkIn, request.checkOut)) {
    errors.dates = "Check-out date must be after check-in date";
  }
  
  // Validate guests
  const totalGuests = (request.guests?.adults || 0) + 
                     (request.guests?.children || 0);
  
  if (totalGuests < 1) {
    errors.guests = "At least one guest is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 