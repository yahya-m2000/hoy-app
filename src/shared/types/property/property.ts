/**
 * Property type definitions for the Hoy application
 * These types match the backend Property model/schema
 */

// Define interfaces for nested objects
export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface IPrice {
  amount: number;
  currency: string;
  period: "night" | "week" | "month";
}

export interface ISocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface IPermissions {
  canManageBookings?: boolean;
  canCheckInGuests?: boolean;
  canManageUnits?: boolean;
  canHandleFinances?: boolean;
}

export interface ICalendarEvent {
  startDate: Date;
  endDate: Date;
  isBooked: boolean;
}

export interface Property {
  title: string;
  // Core identifiers
  _id: string; // MongoDB ObjectId as string
  id?: string; // Compatibility alias for _id
  hostId: string; // ObjectId as string
  organisationId?: string; // ObjectId as string
  // Basic property information
  name: string; // Standardized to "name" (not "title")
  type: string;
  propertyType: string;
  status: string;
  description: string;

  // Location information
  address: IAddress;
  coordinates: ICoordinates;
  // Property details
  images: string[];
  price: IPrice;
  currency: string;
  amenities: string[];
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;

  // Rating and reviews
  rating: number;
  reviewCount: number;
  reviews?: string[]; // Array of ObjectIds as strings
  // Host information
  host?: string;
  hostName?: string;
  hostImage?: string;
  // Status flags
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil?: Date;
  isSuperHost: boolean;
  isWishlisted?: boolean;

  // Contact information
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  socialLinks?: ISocialLinks;

  // Management
  units?: string[]; // Array of ObjectIds as strings
  permissions?: IPermissions;
  calendar?: ICalendarEvent[];
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Legacy type alias for backward compatibility (prefer using Property)
export type PropertyType = Property;

export interface PropertyUIState {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
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
