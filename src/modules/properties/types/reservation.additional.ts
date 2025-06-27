/**
 * Types for Property Reservation Module
 */

export interface ReservationFormData {
  startDate: Date | null;
  endDate: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  paymentMethod: any | null;
  specialRequests: string;
}

export type ReservationStep = "dates" | "guests" | "payment" | "confirmation";

export interface ReservationStepProps {
  onNext: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export interface DateSelectionStepProps extends ReservationStepProps {
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateChange: (startDate: Date, endDate: Date) => void;
  propertyId?: string;
  isAvailable?: boolean | null;
  isCheckingAvailability?: boolean;
}

export interface GuestDetailsStepProps extends ReservationStepProps {
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  guests: ReservationFormData["guests"];
  onGuestChange: (
    guestType: keyof ReservationFormData["guests"],
    value: number
  ) => void;
  maxGuests?: number;
  onDateChangeRequested: () => void;
}

export interface PaymentMethodStepProps extends ReservationStepProps {
  selectedMethod: any | null;
  onSelectMethod: (method: any) => void;
}

export interface ConfirmationStepProps extends ReservationStepProps {
  property: any;
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  guests: ReservationFormData["guests"];
  priceDetails: any | null;
  paymentMethod: any | null;
  propertyPrice: number;
  onConfirm: () => void;
}

export interface PriceDetails {
  totalPrice: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  basePrice: number;
  nights: number;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "zaad" | "cash";
  name: string;
  icon?: string;
  details?: any;
}

export interface Reservation {
  id: string;
  propertyId: string;
  unitId?: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  guests: ReservationFormData["guests"];
  paymentMethod: PaymentMethod;
  priceDetails: PriceDetails;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}
