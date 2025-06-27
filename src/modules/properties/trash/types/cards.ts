/**
 * Card component types for Properties module
 * Extends from shared Property type and adds component-specific props
 */

import { ViewStyle } from "react-native";
import { Property } from "@shared/types";
import { PopulatedBooking, BookingStatus } from "@shared/types/booking";

/**
 * Collection-specific interface
 */
export interface PropertyCollection {
  name: string;
  propertyCount: number;
  previewImages: string[];
  isLoading?: boolean;
}

/**
 * PropertyCard component props interface extending from shared Property type
 */
export interface PropertyCardProps extends Omit<Partial<Property>, "price"> {
  // Required props
  _id: string;
  name: string;
  price: number; // Simplified price as number (component handles currency formatting)

  // Component-specific props
  onPress?: () => void;
  style?: ViewStyle;
  onMessagePress?: () => void;
  variant?: "large" | "small" | "collection";

  // Animation props
  isLoading?: boolean;
  animateOnMount?: boolean;
  fadeInDuration?: number;

  // Collection-specific props
  collection?: PropertyCollection;

  // Additional property details
  hostType?: string;

  // Override currency to be optional string (component handles formatting)
  currency?: string;

  // Simplified image props for component use
  imageUrl?: string;
  images?: string[];

  // Booking-related props (for when used as BookingCard replacement)
  booking?: PopulatedBooking;
  isUpcoming?: boolean;
  showBookingInfo?: boolean; // Flag to render booking-specific information
  bookingStatus?: BookingStatus;

  // Legacy props for backward compatibility (deprecated)
  title?: string;
  location?: string | any;
  city?: string;
  country?: string;

  // Note: rating and reviewCount are now fetched dynamically using usePropertyReviews hook
}

/**
 * Collection Card props - independent interface
 */
export interface CollectionCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  propertyCount?: number;
  onPress?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: "large" | "small" | "collection";
  isLoading?: boolean;
  animateOnMount?: boolean;
  fadeInDuration?: number;
  style?: ViewStyle;
  testID?: string;
}
