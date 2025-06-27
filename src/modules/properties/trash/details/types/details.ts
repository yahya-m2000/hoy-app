/**
 * Details component types for Properties module
 * Contains types for property detail-related components
 */

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BaseSectionProps } from "@shared/types/common";
import { SectionProps, ListItemProps } from "src/shared";

/**
 * Base interface for navigation items with icons
 */
export interface BaseNavigationItemProps extends BaseSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route?: string;
}

/**
 * Props for PolicyNavigationItem component
 */
export interface PolicyNavigationItemProps extends BaseNavigationItemProps {
  subtitle: string;
  onPress: () => void;
  withDivider?: boolean;
}

/**
 * Props for PolicyScreen component - extends HeaderProps for consistency
 */
export interface PolicyScreenProps {
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap; // Keep as MaterialIcons for Header compatibility
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
  onClose: () => void;
}

/**
 * Props for PolicySection component - alias to SectionProps for clarity
 */
export type PolicySectionProps = SectionProps;

/**
 * Props for PolicyItem component - alias to ListItemProps for clarity
 */
export type PolicyItemProps = ListItemProps;

/**
 * Props for PropertyTab component
 */
export interface PropertyTabProps {
  price: number;
  totalPrice?: number;
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onReserve?: () => void; // Made optional since we're adding navigation
  propertyId?: string; // Added to support navigation to calendar
  onDateSelectionPress?: () => void; // Added to support opening date selection modal
}

/**
 * Props for Amenity component
 */
export interface AmenityProps {
  name: string;
}
