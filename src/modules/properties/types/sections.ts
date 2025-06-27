/**
 * Section component types for Properties module
 * Contains types for property section-related components
 */

import { BaseLoadingSectionProps } from "@shared/types/common";
import { ExtendedUser } from "@shared/types/user";

/**
 * Props for HostHeader component
 */
export interface HostHeaderProps {
  user: any; // TODO: Replace with proper User type
}

/**
 * Props for SafetyAndProperty component
 */
export interface SafetyAndPropertyProps {
  safetyFeatures?: string[];
  propertyFeatures?: string[];
}

/**
 * Props for CancellationPolicy component
 */
export interface CancellationPolicyProps {
  policyType?: string;
  policyDescription?: string;
}

/**
 * Props for HouseRules component
 */
export interface HouseRulesProps {
  rules?: string[];
  additionalRules?: string[];
}

/**
 * Props for LocationMapSection component
 */
export interface LocationMapSectionProps {
  location: string;
  onShowMap: () => void;
}

/**
 * Props for MeetHostSection component
 */
export interface MeetHostSectionProps {
  host: ExtendedUser | null;
  onContactHost: () => void;
}

/**
 * Props for RatingsReviewsSection component
 */
export interface RatingsReviewsSectionProps {
  rating?: number;
  totalReviews?: number;
  reviews?: any[]; // TODO: Replace with proper Review type
  onShowAllReviews?: () => void;
}

/**
 * Props for DescriptionSection component
 */
export interface DescriptionSectionProps {
  description?: string;
  maxLines?: number;
  expandable?: boolean;
}

/**
 * Props for ContactSection component
 */
export interface ContactSectionProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

/**
 * Props for AmenitiesSection component
 */
export interface AmenitiesSectionProps {
  amenities: string[];
  maxVisible?: number;
  onShowAll?: () => void;
}

/**
 * Props for the HostSection component
 * Extends base loading section props and handles host-specific functionality
 */
export interface HostSectionProps extends BaseLoadingSectionProps {
  host: ExtendedUser | null;
  hostLoading: boolean;
  property?: any; // Add property to access it in the component
  onMessageHost: (
    property: any,
    host: any,
    setMessageModalVisible: (visible: boolean) => void
  ) => void;
}

/**
 * Props for the DatesSection component
 * Extends base section props and handles date selection functionality
 */
export interface DatesSectionProps extends BaseLoadingSectionProps {
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  propertyPrice: number;
  onChangeDates: () => void;
}
