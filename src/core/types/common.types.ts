/**
 * Common Types
 * 
 * Shared type definitions used across the application including:
 * - Base component interfaces
 * - Navigation utilities
 * - Form validation
 * - Loading states
 * - UI components
 * 
 * @module @core/types/common
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ExtendedUser } from './user.types';

// ========================================
// NAVIGATION TYPES
// ========================================

/**
 * Navigation state for route tracking
 */
export interface NavigationState {
  /** Current route name */
  routeName: string;
  /** Route parameters */
  params?: Record<string, string | number | boolean>;
  /** Navigation history */
  history?: string[];
}

/**
 * Screen options for navigation
 */
export interface ScreenOptions {
  /** Screen title */
  title?: string;
  /** Whether to show header */
  headerShown?: boolean;
  /** Header background color */
  headerStyle?: ViewStyle;
  /** Header title style */
  headerTitleStyle?: TextStyle;
}

/**
 * Navigation parameters type
 */
export interface NavigationParams {
  /** Screen name */
  screen?: string;
  /** Route parameters */
  params?: Record<string, string | number | boolean>;
}

// ========================================
// FORM & VALIDATION TYPES
// ========================================

/**
 * Form field validation error
 */
export interface FormValidationError {
  /** Field identifier */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  /** Field name/key */
  name: string;
  /** Field label */
  label: string;
  /** Field type */
  type: 'text' | 'email' | 'password' | 'number' | 'phone' | 'select' | 'checkbox' | 'radio';
  /** Field placeholder */
  placeholder?: string;
  /** Whether field is required */
  required?: boolean;
  /** Field default value */
  defaultValue?: string | number | boolean;
  /** Field options for select/radio */
  options?: Array<{
    label: string;
    value: string | number;
  }>;
  /** Field validation rules */
  validation?: {
    /** Minimum length */
    minLength?: number;
    /** Maximum length */
    maxLength?: number;
    /** Regular expression pattern */
    pattern?: RegExp;
    /** Custom validator function */
    validator?: (value: string | number | boolean) => boolean;
  };
}

// ========================================
// COMPONENT BASE TYPES
// ========================================

/**
 * Base interface for section component props
 */
export interface BaseSectionProps {
  /** Custom styles */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
  /** Whether section is disabled */
  disabled?: boolean;
  /** Custom class names */
  className?: string;
}

/**
 * Base interface for section components that handle loading states
 */
export interface BaseLoadingSectionProps extends BaseSectionProps {
  /** Loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * Base props for components with data
 */
export interface BaseDataProps<T> extends BaseLoadingSectionProps {
  /** Component data */
  data: T | null;
  /** Error state */
  error?: string | null;
  /** Refresh handler */
  onRefresh?: () => void;
}

// ========================================
// UI COMPONENT TYPES
// ========================================

/**
 * Theme variants for components
 */
export type ThemeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Component size variants
 */
export type SizeVariant = 'small' | 'medium' | 'large' | 'xl';

/**
 * Button component props
 */
export interface BaseButtonProps {
  /** Button text */
  title: string;
  /** Click handler */
  onPress: () => void;
  /** Button variant */
  variant?: ThemeVariant;
  /** Button size */
  size?: SizeVariant;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon name */
  icon?: string;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Modal component props
 */
export interface BaseModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Whether modal is dismissible */
  dismissible?: boolean;
  /** Animation type */
  animationType?: 'slide' | 'fade' | 'none';
}

/**
 * Header configuration interface
 */
export interface HeaderConfig {
  /** Header title */
  title?: string;
  /** Header style */
  headerStyle?: ViewStyle;
  /** Header background color */
  headerTintColor?: string;
  /** Header title style */
  headerTitleStyle?: TextStyle;
  /** Whether to show back button */
  headerBackVisible?: boolean;
  /** Custom back button */
  headerLeft?: () => React.ReactNode;
  /** Header right component */
  headerRight?: () => React.ReactNode;
}

// ========================================
// DATA & STATE TYPES
// ========================================

/**
 * Generic ID type for entities
 */
export type EntityId = string | number;

/**
 * Timestamp fields for entities
 */
export interface Timestamps {
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Soft delete fields
 */
export interface SoftDelete {
  /** Deletion timestamp */
  deletedAt?: string | null;
  /** Whether entity is deleted */
  isDeleted?: boolean;
}

/**
 * Base entity interface
 */
export interface BaseEntity extends Timestamps {
  /** Entity ID */
  id: EntityId;
  /** Legacy ID field */
  _id?: EntityId;
}

/**
 * Coordinate pair for geographic locations
 */
export interface Coordinates {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

/**
 * Address information
 */
export interface Address {
  /** Street address */
  street?: string;
  /** City */
  city: string;
  /** State/province */
  state?: string;
  /** Country */
  country: string;
  /** Postal code */
  postalCode?: string;
  /** Geographic coordinates */
  coordinates?: Coordinates;
}

// ========================================
// NOTIFICATION & TOAST TYPES
// ========================================

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast notification options
 */
export interface ToastOptions {
  /** Toast message */
  message: string;
  /** Toast type/severity */
  type: ToastType;
  /** Display duration in milliseconds */
  duration?: number;
  /** Action button configuration */
  action?: {
    /** Action button label */
    label: string;
    /** Action button press handler */
    onPress: () => void;
  };
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  /** Default duration for toasts */
  defaultDuration: number;
  /** Maximum number of toasts to show */
  maxToasts: number;
  /** Position of toast on screen */
  position: 'top' | 'bottom' | 'center';
  /** Animation settings */
  animation: {
    /** Animation duration */
    duration: number;
    /** Animation type */
    type: 'slide' | 'fade' | 'scale';
  };
}

/**
 * Component styling interface
 */
export interface ComponentStyle {
  /** Container style */
  container?: ViewStyle;
  /** Content style */
  content?: ViewStyle;
  /** Text style */
  text?: TextStyle;
  /** Additional styles */
  style?: ViewStyle | TextStyle;
}

// ========================================
// PROPERTY MODAL TYPES (from features/properties)
// ========================================

/**
 * Props for MessageHostModal component
 */
export interface MessageHostModalProps {
  visible: boolean;
  onClose: () => void;
  host: ExtendedUser | null;
  propertyTitle: string;
  messageContent: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
}

/**
 * Props for CollectionsModal component
 */
export interface CollectionsModalProps {
  visible: boolean;
  propertyId?: string; // Made optional for general collection management
  onClose: () => void;
  onCollectionToggle?: (collectionId: string, isAdded: boolean) => void;
}

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

// ========================================
// POLICY TYPES (from features/properties/modal.types)
// ========================================

/**
 * Props for PolicyNavigationItem component
 */
export interface PolicyNavigationItemProps extends BaseSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  withDivider?: boolean;
  route?: string;
}

/**
 * Props for PolicyScreen component
 */
export interface PolicyScreenProps {
  title: string;
  icon?: string;
  leftIcon?: string;
  children: React.ReactNode;
  onClose: () => void;
}

/**
 * Props for PolicySection component
 */
export interface PolicySectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Props for PolicyItem component
 */
export interface PolicyItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
}
