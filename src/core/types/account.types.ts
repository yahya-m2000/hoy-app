/**
 * Account Types
 * 
 * Comprehensive type definitions for account management features including:
 * - Settings configuration
 * - User actions
 * - Profile management
 * - Service dependencies
 * 
 * @module @core/types/account
 * @author Hoy Development Team
 * @version 1.0.0
 */

import type { User } from './user.types';

/**
 * Base interface for settings menu items
 */
export interface SettingsItem {
  /** Unique identifier for the item */
  id: string;
  /** Icon name for the item */
  icon: string;
  /** Display title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Action handler function */
  action?: () => void;
  /** Optional custom element to render on the right */
  rightElement?: React.ReactNode;
  /** Whether this item represents a dangerous action */
  isDanger?: boolean;
}

/**
 * Settings section with grouped items
 */
export interface SettingsSection {
  /** Section title */
  title: string;
  /** Items in this section */
  items: SettingsItem[];
}

/**
 * All possible account-related actions
 * Unified for both host and traveler modes
 */
export type AccountAction =
  // Common actions
  | "edit-profile"
  | "personal-info"
  | "notifications"
  | "payment-methods"
  | "privacy"
  | "security"
  | "language"
  | "currency"
  | "support"
  | "about"
  | "terms"
  | "privacy-policy"
  | "logout"
  | "delete-account"
  // Host-specific actions
  | "switch-to-traveler"
  | "host-profile"
  | "policies"
  | "properties"
  | "calendar"
  | "pricing"
  | "payouts"
  | "taxes"
  | "host-resources"
  | "show-qr-code"
  // Traveler-specific actions
  | "switch-to-host"
  | "booking-history"
  | "wishlist"
  | "reviews"
  | "travel-preferences";

/**
 * Props for profile header component
 * Shows QR code button for all authenticated users
 */
export interface ProfileHeaderProps {
  /** Current user object */
  user: User | null;
  /** Loading state */
  loading: boolean;
  /** Whether user is in host mode */
  isHost: boolean;
  /** Handler for QR code display */
  onQRCodePress: () => void;
}

/**
 * Props for QR code screen
 */
export interface QRCodeScreenProps {
  /** User object containing data for QR code */
  user: User | null;
}

/**
 * Dependencies required by AccountActionService
 */
export interface ActionServiceDependencies {
  /** Translation function */
  t: (key: string) => string;
  /** Function to toggle between host/traveler roles */
  toggleUserRole: () => Promise<void>;
  /** Toast notification function */
  showToast: (params: {
    type: "success" | "error" | "info";
    message: string;
  }) => void;
  /** Whether user is currently in host mode */
  isHost: boolean;
}

/**
 * Dependencies required by AccountConfigService
 */
export interface ConfigServiceDependencies {
  /** Translation function */
  t: (key: string) => string;
  /** Function to get action handler for specific action */
  getActionHandler: (action: AccountAction) => () => void;
  /** Whether user is currently in host mode */
  isHost: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
} 