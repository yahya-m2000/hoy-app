/**
 * Booking module types
 */

export interface BookingGuestInfo {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface BookingDates {
  startDate: Date | null;
  endDate: Date | null;
}

export interface BookingPriceDetails {
  totalPrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  taxes?: number;
}

export interface BookingContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface PaymentMethodDetails {
  brand?: string;
  last4?: string;
  expiry?: string;
  name?: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'zaad' | 'test';
  isDefault: boolean;
  details: PaymentMethodDetails;
}

// Form data used in the confirmation modal
export interface BookingFormData {
  startDate: Date | null;
  endDate: Date | null;
  guests: BookingGuestInfo;
  paymentMethod: PaymentMethod | null;
  specialRequests: string;
}

// API booking data structure
export interface BookingApiData {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guests: BookingGuestInfo;
  totalPrice: number;
  specialRequests?: string;
  contactInfo: BookingContactInfo;
  paymentType: string;
  paymentStatus: string;
  paymentId?: string;
}

export interface BookingAvailabilityParams {
  propertyId: string;
  unitId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
}

export type BookingPriceParams = BookingAvailabilityParams;

export interface BookingStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export type BookingStep = 'dates' | 'guests' | 'payment' | 'confirmation';

export interface BookingState {
  step: BookingStep;
  dates: BookingDates;
  guests: BookingGuestInfo;
  paymentMethod: PaymentMethod | null;
  priceDetails: BookingPriceDetails | null;
  isAvailable: boolean | null;
  isCheckingAvailability: boolean;
  loading: boolean;
  specialRequests: string;
}
