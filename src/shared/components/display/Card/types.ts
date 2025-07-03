/**
 * Base Card component types
 * Defines the fundamental card structure and props
 */

import {
  ViewStyle,
  ImageStyle,
  TextStyle,
  AccessibilityRole,
} from "react-native";
import { ReactNode } from "react";

// Base card variants
export type CardVariant = "horizontal" | "vertical" | "collection";

// Base card size options
export type CardSize = "small" | "medium" | "large";

// Card interaction states
export type CardState = "default" | "pressed" | "focused" | "disabled";

// Base card props
export interface BaseCardProps {
  // Layout & Styling
  variant?: CardVariant;
  size?: CardSize;
  style?: ViewStyle;
  containerStyle?: ViewStyle;

  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;

  // Animation
  isLoading?: boolean;
  animateOnMount?: boolean;
  fadeInDuration?: number;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;

  // Content
  children?: ReactNode;
  testID?: string;
}

// Card section props
export interface CardImageProps {
  imageUrl?: string;
  images?: string[];
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  placeholder?: ReactNode;
  overlay?: ReactNode;
  aspectRatio?: number;
}

export interface CardContentProps {
  style?: ViewStyle;
  children?: ReactNode;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  rightContent?: ReactNode;
}

export interface CardFooterProps {
  style?: ViewStyle;
  children?: ReactNode;
}

// Card dimensions for different variants and sizes
export interface CardDimensions {
  width?: number;
  height?: number;
  imageHeight?: number;
  contentHeight?: number;
}

// Card theme/appearance
export interface CardTheme {
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}
