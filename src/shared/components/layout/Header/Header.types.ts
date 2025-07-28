/**
 * Types for Header component
 */

import { ReactNode } from "react";
import { TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseSectionProps } from "src/core/types/common.types";

export type HeaderVariant =
  | "solid"
  | "transparent"
  | "minimal"
  | "modal"
  | "none";

export interface HeaderContent {
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  onPress?: () => void;
  children?: ReactNode;
}

export interface HeaderProps extends BaseSectionProps {
  title?: string;
  titleStyle?: TextStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showDivider?: boolean;
  // New props for Screen integration
  variant?: HeaderVariant;
  left?: HeaderContent;
  right?: HeaderContent;
  backgroundColor?: string;
  scrollThreshold?: number;
  isTransparent?: boolean;
  useSafeArea?: boolean;
  safeAreaTop?: number;
  scrolled?: boolean; // For scroll-aware icon backgrounds
  scrollPosition?: number; // Actual scroll position for smooth transitions
}
