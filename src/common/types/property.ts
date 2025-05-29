/**
 * Property type definitions for the Hoy application
 */

export interface PropertyType {
  _id: string;
  id?: string; // Compatibility alias for _id
  title: string;
  description: string;
  images: string[];
  image?: string; // Compatibility alias for images[0]
  price: number;
  currency?: string;
  location: string | any; // Can be a string or an object
  locationString?: string; // Added locationString property
  city?: string;
  country?: string;
  address?: string;
  rating: number;
  reviewCount: number;
  reviews?: number; // Compatibility alias for reviewCount
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
  // Additional properties that components expect
  isActive?: boolean;
  occupancyRate?: number;
  propertyType?: string;
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

// Alias for compatibility
export type Property = PropertyType;
