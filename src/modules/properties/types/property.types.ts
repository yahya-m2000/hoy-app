/**
 * Property Types
 * Type definitions for property-related entities
 */

// Import any needed types from existing files
import { User } from "../../../shared/types/user";

// Basic property type
export interface Property {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  hostId: string;
  host?: User;
  price: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Property list item (used in search results, etc.)
export interface PropertyListItem {
  id: string;
  title: string;
  location: {
    city: string;
    country: string;
  };
  price: number;
  mainImage: string;
  rating?: number;
  reviewCount?: number;
}

// Property filter options
export interface PropertyFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  propertyType?: string[];
} 