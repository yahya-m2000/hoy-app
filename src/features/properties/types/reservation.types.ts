/**
 * Types for reservation components
 * 
 * @module @features/properties/types/reservation.types
 */

import type { PropertyType } from '@core/types';

export interface ReservationModalProps {
  onClose: () => void;
  property: PropertyType | null;
  currentTabContext?: string;
  unit?: any;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export interface ReservationStepProps {
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  selectedPaymentMethod: any;
  property: PropertyType | null;
  unit?: any;
  onEditDates: () => void;
  onEditGuests?: () => void;
  formatDate: (date: Date | null) => string;
  calculateNights: () => number;
}

export interface DateStepProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelectRange: (start: Date, end: Date) => void;
  propertyId?: string;
  isCheckingAvailability: boolean;
  isAvailable: boolean | null;
  formatDate: (date: Date | null) => string;
  onAvailabilityChange: (available: boolean | null, checking: boolean) => void;
}

export interface GuestStepProps {
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  onChangeAdults: (count: number) => void;
  onChangeChildren: (count: number) => void;
  onChangeInfants: (count: number) => void;
  onChangePets: (count: number) => void;
  maxGuests: number;
  formatDate: (date: Date | null) => string;
  calculateNights: () => number;
  onEditDates: () => void;
}

export interface PaymentStepProps {
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  pets: number;
  selectedPaymentMethod: any;
  onSelectPaymentMethod: (method: any) => void;
  formatDate: (date: Date | null) => string;
  onEditDates: () => void;
  onEditGuests: () => void;
}

export interface ConfirmationStepProps {
  property: PropertyType | null;
  startDate: Date | null;
  endDate: Date | null;
  adults: number;
  childrenCount: number;
  infants: number;
  pets: number;
  selectedPaymentMethod: any;
  priceDetails: any;
  safePropertyPrice: number;
  formatDate: (date: Date | null) => string;
  calculateNights: () => number;
}

export interface StepNavigationProps {
  showBackButton: boolean;
  onBackPress: () => void;
  nextButtonTitle: string;
  onNextPress: () => void;
  nextButtonDisabled: boolean;
  nextButtonLoading: boolean;
  spacing?: number;
}

export interface BookingData {
  propertyId: string;
  unitId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  totalPrice: number;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentId?: string;
  specialRequests: string;
}