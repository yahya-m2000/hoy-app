/**
 * Booking utility functions
 */

import { format } from 'date-fns';
import type { BookingGuestInfo, BookingDates } from '../types';

/**
 * Format date for display
 */
export const formatDate = (date: Date | null): string => {
  if (!date) return '';
  try {
    return format(date, 'EEE, MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate number of nights between two dates
 */
export const calculateNights = (startDate: Date | null, endDate: Date | null): number => {
  if (!startDate || !endDate) return 0;
  try {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 0;
  } catch (error) {
    console.error('Error calculating nights:', error);
    return 0;
  }
};

/**
 * Validate date selection
 */
export const validateDates = (startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate || !endDate) return false;
  return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate;
};

/**
 * Format guest count for display
 */
export const formatGuestCount = (guests: BookingGuestInfo): string => {
  const parts: string[] = [];
  
  if (guests.adults > 0) {
    parts.push(`${guests.adults} adult${guests.adults !== 1 ? 's' : ''}`);
  }
  
  if (guests.children > 0) {
    parts.push(`${guests.children} child${guests.children !== 1 ? 'ren' : ''}`);
  }
  
  if (guests.infants > 0) {
    parts.push(`${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`);
  }
  
  if (guests.pets > 0) {
    parts.push(`${guests.pets} pet${guests.pets !== 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
};

/**
 * Get total guest count (excluding infants for booking purposes)
 */
export const getTotalGuestCount = (guests: BookingGuestInfo): number => {
  return guests.adults + guests.children;
};

/**
 * Check if dates are valid for booking
 */
export const areValidBookingDates = (dates: BookingDates): boolean => {
  return validateDates(dates.startDate, dates.endDate);
};

/**
 * Parse date safely from string
 */
export const parseDateSafely = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Generate ZAAD payment method
 */
export const createZaadPaymentMethod = () => ({
  id: 'zaad_payment_method',
  type: 'zaad' as const,
  isDefault: false,
  details: {
    name: 'ZAAD Mobile',
    phone: '123456789',
  },
});

/**
 * Check if payment method is test payment
 */
export const isTestPayment = (paymentMethod: any): boolean => {
  return !!(
    paymentMethod?.id &&
    (paymentMethod.id.includes('test') ||
      paymentMethod.id === 'test-payment-method' ||
      paymentMethod.id === 'zaad_payment_method')
  );
};

/**
 * Validate MongoDB ObjectId format
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Parse initial dates from route parameters
 */
export const parseInitialDates = (params: any) => {
  const parseDate = (paramDate: any): Date | null => {
    try {
      if (paramDate) {
        const date = new Date(paramDate as string);
        return !isNaN(date.getTime()) ? date : null;
      }
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  const startDate = parseDate(params.startDate);
  const endDate = parseDate(params.endDate);

  return {
    startDate,
    endDate,
    hasInitialDates: !!(startDate && endDate),
  };
};

/**
 * Format booking data for API submission
 */
export const formatBookingData = (formData: any, property: any, unit: any, currentUser: any, priceDetails: any, paymentMethod: any, specialRequests: string = '') => {
  const { startDate, endDate, guests } = formData;
  const nights = calculateNights(startDate, endDate);
  const propertyPrice = unit?.price || property?.price || 0;

  return {
    propertyId: property._id,
    unitId: unit?._id || property._id,
    checkIn: startDate ? startDate.toISOString() : '',
    checkOut: endDate ? endDate.toISOString() : '',
    guestCount: guests.adults + guests.children,
    guests: {
      adults: guests.adults || 1,
      children: guests.children || 0,
      infants: guests.infants || 0,
      pets: guests.pets || 0,
    },
    totalPrice: priceDetails?.totalPrice || propertyPrice * nights,
    specialRequests,
    contactInfo: {
      name:
        currentUser?.firstName && currentUser?.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser?.email?.split('@')[0] || 'Guest',
      email: currentUser?.email || '',
      phone: currentUser?.phoneNumber || '',
    },
    paymentType: paymentMethod?.type || 'card',
    paymentStatus: paymentMethod?.type === 'zaad' ? 'pending' : 'confirmed',
    ...(isTestPayment(paymentMethod)
      ? {}
      : paymentMethod?.id && isValidObjectId(paymentMethod.id)
      ? { paymentId: paymentMethod.id }
      : {}),
  };
};

/**
 * Create mock booking result for testing
 */
export const createMockBooking = (formData: any, property: any, unit: any, paymentMethod: any, bookingData: any) => {
  return {
    _id: 'mock_' + Math.random().toString(36).substring(2, 15),
    propertyId: property._id,
    unitId: unit?._id || property._id,
    checkIn: formData.startDate?.toISOString(),
    checkOut: formData.endDate?.toISOString(),
    bookingStatus: 'confirmed',
    paymentStatus: paymentMethod?.type === 'zaad' ? 'pending' : 'paid',
    totalPrice: bookingData.totalPrice,
    guests: bookingData.guests,
    contactInfo: bookingData.contactInfo,
    paymentId: bookingData.paymentId,
    paymentType: paymentMethod?.type || 'card',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
