/**
 * Reservation Types
 * Type definitions for reservation-related entities
 */

import { Property } from "./property.types";
import { User } from "../../../shared/types/user";

// Reservation status enum
export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  COMPLETED = "completed"
}

// Basic reservation type
export interface Reservation {
  id: string;
  propertyId: string;
  property?: Property;
  guestId: string;
  guest?: User;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Reservation creation request
export interface ReservationRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
}

// Availability data
export interface AvailabilityData {
  date: string;
  available: boolean;
  price?: number;
}

// Calendar data
export interface CalendarData {
  propertyId: string;
  availabilityMap: Record<string, AvailabilityData>;
  minStay: number;
  maxStay: number;
} 