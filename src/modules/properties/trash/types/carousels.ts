/**
 * Carousel component types for Properties module
 * Extends base carousel types with property-specific functionality
 */

import { ViewStyle } from "react-native";
import {
  BaseImageCarouselProps,
  BaseListCarouselProps,
} from "@shared/components/common/Carousel/Carousel.types";
import { Property, PropertyType } from "@shared/types";
import { Reservation as SharedReservation } from "@shared/types/booking/reservation";

/**
 * Generic property carousel for displaying property listings
 */
export interface PropertyCarouselProps extends BaseListCarouselProps<Property> {
  city?: string;
  categoryType?: PropertyType;
  maxPrice?: number;
  minPrice?: number;
  searchQuery?: string;
}

/**
 * Category-specific property listings carousel
 * Matches the existing CategoryListingsCarousel implementation
 */
export interface CategoryListingsCarouselProps {
  city: string;
  maxItems?: number;
  title?: string;
  onViewAll?: () => void;
  style?: ViewStyle;
}

/**
 * Property image carousel for individual property galleries
 * Extends base image carousel with property-specific features
 */
export interface PropertyImageCarouselProps
  extends Omit<BaseImageCarouselProps, "images"> {
  property: Property;
  showPropertyInfo?: boolean;
  overlayGradient?: boolean;
  fallbackImage?: string;
}

/**
 * Simple image carousel props for basic image display
 * Matches the existing Carousel component implementation
 */
export interface SimpleImageCarouselProps extends BaseImageCarouselProps {
  borderRadius?: number;
  aspectRatio?: number;
}

/**
 * Filter option interface for filter carousel
 */
export interface FilterOption {
  key: string;
  label: string;
  id?: string; // Alternative key for compatibility
  icon?: string;
  count?: number;
  selected?: boolean;
}

/**
 * Filter carousel for property search filters
 */
export interface FilterCarouselProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  selectedFilters?: string[];
  onFilterSelect?: (filterId: string) => void;
  onFilterDeselect?: (filterId: string) => void;
  multiSelect?: boolean;
}

/**
 * Review interface for reviews carousel
 * Matches the existing ReviewsCarousel implementation
 */
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

/**
 * Enhanced review interface for future use
 */
export interface EnhancedReview extends Review {
  userId: string;
  verified?: boolean;
  helpfulCount?: number;
  propertyId?: string;
}

/**
 * Reviews carousel for displaying property reviews
 * Matches the existing ReviewsCarousel implementation
 */
export interface ReviewsCarouselProps {
  reviews: Review[];
  onShowAllReviews: () => void;
}

/**
 * Reservation/booking carousel for user bookings
 * Uses the existing shared Reservation type
 */
export interface ReservationCarouselProps {
  reservations: SharedReservation[];
  emptyMessage?: string;
  onReservationPress?: (reservation: SharedReservation) => void;
}

// Re-export the shared Reservation type for convenience
export type Reservation = SharedReservation;
