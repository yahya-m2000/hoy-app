/**
 * Common component types for Properties module
 * Contains shared types and interfaces used across multiple property components
 */

import { ViewStyle } from "react-native";

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
