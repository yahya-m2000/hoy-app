/**
 * Reservation type definitions
 */

export interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  guestPhoto?: string;
  hostId: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected";
  paymentStatus: "pending" | "paid" | "refunded" | "partial";
  createdAt: string;
  updatedAt: string;
  // Additional properties that components expect
  guests?: number; // Alias for guestCount
  isPaid?: boolean; // Derived from paymentStatus
}

export interface ReservationFilter {
  status?:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "rejected"
    | "all";
  propertyId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  rejected: number;
  revenue: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
}
