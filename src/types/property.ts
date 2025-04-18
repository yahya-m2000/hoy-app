/**
 * Property type definitions for the Hoy application
 */

export interface PropertyType {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency?: string;
  location: string;
  city?: string;
  country?: string;
  rating: number;
  reviewCount: number;
  isSuperHost?: boolean;
  isWishlisted?: boolean;
  amenities?: string[];
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  maxGuests?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hostId?: string;
  hostName?: string;
  hostImage?: string;
}

export interface BookingType {
  id: string;
  propertyId: string;
  property?: PropertyType;
  startDate: string;
  endDate: string;
  guestCount: number;
  totalPrice: number;
  currency?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewType {
  id: string;
  propertyId: string;
  bookingId?: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
  hostResponse?: {
    comment: string;
    createdAt: string;
  };
  ratings?: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
}
