/**
 * Property type definitions for the Hoy application
 * These types match the backend Property model/schema
 */

import { ViewStyle } from "react-native";
import type { ExtendedUser } from "./user.types";
import type { BaseLoadingSectionProps } from "./common.types";
import { RecentReservation } from "./host-dashboard.types";

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
  bookingId?: string;
  guestName?: string;
}

export interface ICancellationPolicy {
  policyType: "flexible" | "moderate" | "strict" | "custom";
  description: string;
  refundPercentages: {
    immediate: number; // 0-100
    beforeDays: number;
    percentage: number;
  }[];
  nonRefundableFees: string[];
}

export interface IHouseRules {
  checkInTime: {
    from: string; // e.g., "15:00"
    to: string; // e.g., "22:00"
  };
  checkOutTime: string; // e.g., "11:00"
  quietHours: {
    from: string;
    to: string;
  };
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  additionalRules: string[];
}

export interface ISafetyFeatures {
  smokeDetector: boolean;
  carbonMonoxideDetector: boolean;
  fireExtinguisher: boolean;
  firstAidKit: boolean;
  securityCameras: {
    exterior: boolean;
    interior: boolean;
    description?: string;
  };
  weaponsOnProperty: boolean;
  dangerousAnimals: boolean;
  additionalSafetyInfo: string[];
}

export interface ICheckInExperience {
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

export interface IHost {
  id: string;
  rating: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isSuperHost: boolean;
  hostingSince: Date | string;
  hostingYears: number;
  totalProperties: number;
  activeProperties: number;
  totalReviews: number;
  location?: string;
  phoneNumber?: string; // Contact information from user model
  properties: {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date | string;
  }[];
}

export interface Property {
  // Core identifiers
  _id: string; // MongoDB ObjectId as string
  id?: string; // Compatibility alias for _id
  hostId: string; // ObjectId as string
  organisationId?: string; // ObjectId as string

  // Basic property information
  name: string;
  type: string;
  propertyType: string;
  description: string;
  
  // New fields for enhanced listing flow
  status: "draft" | "published";
  guestAccessType: "entire_place" | "private_room" | "shared_space";
  hostType: "individual" | "business";
  tags: string[];

  // Location information
  address: IAddress;
  coordinates: ICoordinates;

  // Property details
  images: string[];
  price: number | IPrice; // Support both formats for backward compatibility
  weekdayPrice: number;
  weekendPrice: number;
  currency: string;
  
  // Discounts
  discounts: {
    newListingPromo: boolean;
    lastMinuteDiscount: boolean;
    weeklyDiscount: { enabled: boolean; percentage: number };
    monthlyDiscount: { enabled: boolean; percentage: number };
  };
  
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
  host?: IHost | string; // Can be enriched host object or just ID
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

  // Policies and Rules
  cancellationPolicy?: ICancellationPolicy;
  houseRules?: IHouseRules;
  safetyFeatures?: ISafetyFeatures;
  checkInExperiences?: ICheckInExperience[];

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;

  // Mongoose version key (for backend compatibility)
  __v?: number;

  // Deprecated - remove `title` if `name` is the standard
  title?: string;
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
  response?: {
    text: string;
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

// ========================================
// ADDITIONAL PROPERTY TYPES
// ========================================

/**
 * Property list item (used in search results, etc.)
 */
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



/**
 * Props for ReservationsList component
 */
export interface ReservationsListProps {
  isLoading: boolean;
  reservations: RecentReservation[] | undefined;
}


/**
 * Property filter options
 */
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

/**
 * Base props that many property components might extend from
 */
export interface BasePropertyComponentProps {
  style?: ViewStyle;
  testID?: string;
}

/**
 * Common action handler interfaces
 */
export interface PropertyActionHandlers {
  onPress?: () => void;
  onLongPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onFavorite?: () => void;
}

/**
 * Common loading and error state props
 */
export interface LoadingAndErrorProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// ========================================
// PROPERTY COMPONENT TYPES
// ========================================

/**
 * Property collection interface
 */
export interface PropertyCollection {
  name: string;
  propertyCount: number;
  previewImages: string[];
  isLoading?: boolean;
}

/**
 * Property card component props
 */
export interface PropertyCardProps extends Omit<Partial<Property>, "price"> {
  // Required props
  _id: string;
  name: string;
  price: number;

  // Component-specific props
  onPress?: () => void;
  style?: ViewStyle;
  onMessagePress?: () => void;
  variant?: "large" | "small" | "collection" | "fullWidth";

  // Animation props
  isLoading?: boolean;
  animateOnMount?: boolean;
  fadeInDuration?: number;

  // Booking-related props
  booking?: any;
  showBookingInfo?: boolean;

  // Collection-specific props
  collection?: PropertyCollection;

  // Additional property details
  hostType?: "individual" | "business";

  // Override currency to be optional string
  currency?: string;

  // Simplified image props for component use
  imageUrl?: string;
  images?: string[];

  // Legacy props for backward compatibility (deprecated)
  title?: string;
  location?: string | unknown;
  city?: string;
  country?: string;
}

/**
 * Filter option interface
 */
export interface FilterOption {
  key: string;
  label: string;
  id?: string;
  icon?: string;
  count?: number;
  selected?: boolean;
}

/**
 * Enhanced review interface
 */
export interface EnhancedReview extends Omit<ReviewType, 'propertyId'> {
  userId: string;
  verified?: boolean;
  helpfulCount?: number;
  propertyId: string;
}

// ========================================
// PROPERTY COMPONENT UI TYPES
// ========================================

/**
 * Props for HostSection component
 */
export interface HostSectionProps extends BaseLoadingSectionProps {
  host: ExtendedUser | null;
  hostLoading: boolean;
  property?: Property;
  onMessageHost: (
    property: Property,
    host: ExtendedUser,
    setMessageModalVisible: (visible: boolean) => void
  ) => void;
}

/**
 * Props for DatesSection component
 */
export interface DatesSectionProps extends BaseLoadingSectionProps {
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  propertyPrice: number;
  onChangeDates: () => void;
}

/**
 * Props for PropertyList component
 */
export interface PropertyListProps {
  properties: PropertyType[];
  refreshing: boolean;
  onRefresh: () => void;
  onPropertyPress: (property: PropertyType) => void;
}

/**
 * Props for various property section components
 */
export interface HostHeaderProps {
  user: ExtendedUser;
}

export interface SafetyAndPropertyProps {
  safetyFeatures?: string[];
  propertyFeatures?: string[];
}

export interface CancellationPolicyProps {
  policyType?: string;
  policyDescription?: string;
}

export interface HouseRulesProps {
  rules?: string[];
  additionalRules?: string[];
}

export interface LocationMapSectionProps {
  location: string;
  onShowMap: () => void;
}

export interface MeetHostSectionProps {
  host: ExtendedUser | null;
  onContactHost: () => void;
}

export interface RatingsReviewsSectionProps {
  rating?: number;
  totalReviews?: number;
  reviews?: ReviewType[];
  onShowAllReviews?: () => void;
}

export interface DescriptionSectionProps {
  description?: string;
  maxLines?: number;
  expandable?: boolean;
}

export interface ContactSectionProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

export interface AmenitiesSectionProps {
  amenities: string[];
  maxVisible?: number;
  onShowAll?: () => void;
}

/**
 * Carousel component props
 */
export interface PropertyCarouselProps {
  properties: Property[];
  city?: string;
  categoryType?: PropertyType;
  maxPrice?: number;
  minPrice?: number;
  searchQuery?: string;
  style?: ViewStyle;
}

export interface CategoryListingsCarouselProps {
  city: string;
  maxItems?: number;
  title?: string;
  onViewAll?: () => void;
  style?: ViewStyle;
}

export interface PropertyImageCarouselProps {
  images?: string[];
  property: Property;
  showPropertyInfo?: boolean;
  overlayGradient?: boolean;
  fallbackImage?: string;
  style?: ViewStyle;
  onImagePress?: (index: number) => void;
}

export interface SimpleImageCarouselProps {
  images: string[];
  borderRadius?: number;
  aspectRatio?: number;
  style?: ViewStyle;
}

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
 * Collection card component props
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
