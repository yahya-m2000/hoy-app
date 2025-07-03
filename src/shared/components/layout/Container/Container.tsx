import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

import {
  ContainerProps,
  SpacingSize,
  RadiusSize,
  BackgroundColorVariant,
} from "./Container.types";
import { spacing, radius } from "@core/design";
import { useTheme } from "src/core/hooks/useTheme";

/**
 * Background color variant mappings
 * Maps semantic background color names to theme values
 */
const BACKGROUND_COLOR_VARIANTS: Record<BackgroundColorVariant, string> = {
  background: "background",
  surface: "surface",
  card: "surface", // Card uses surface color
  primary: "colors.primary",
  secondary: "colors.secondary",
  tertiary: "colors.tertiary",
  success: "colors.success",
  error: "colors.error",
  warning: "colors.warning",
  info: "colors.info",
  transparent: "transparent",
} as const;

/**
 * Container - Flexible layout component with comprehensive styling options
 * Features: responsive padding/margin, borders, shadows, semantic background colors, and layout controls
 */
const Container: React.FC<ContainerProps> = ({
  children,
  style,
  backgroundColor = "transparent",

  // Padding
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,

  // Margin
  margin,
  marginHorizontal,
  marginVertical,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,

  // Border radius
  borderRadius,
  borderTopLeftRadius,
  borderTopRightRadius,
  borderBottomLeftRadius,
  borderBottomRightRadius,

  // Border
  borderWidth,
  borderColor,
  borderTopWidth,
  borderBottomWidth,
  borderLeftWidth,
  borderRightWidth,
  // Layout
  flex,
  width,
  height,
  alignItems,
  justifyContent,
  flexDirection,
  flexWrap,

  // Shadows
  elevation,
  shadowColor,
  shadowOffset,
  shadowOpacity,
  shadowRadius,

  // Overflow
  overflow,
}) => {
  const { theme } = useTheme();

  // Helper function to resolve background color
  const resolveBackgroundColor = (
    color: BackgroundColorVariant | string
  ): string => {
    // If it's a raw color (contains # or rgba), return as-is
    if (
      typeof color === "string" &&
      (color.includes("#") ||
        color.includes("rgba") ||
        color.includes("rgb") ||
        color === "transparent")
    ) {
      return color;
    }

    // Check if it's a known variant
    const variant = BACKGROUND_COLOR_VARIANTS[color as BackgroundColorVariant];
    if (variant) {
      // Handle nested theme properties (e.g., "colors.primary")
      if (variant.includes(".")) {
        const [parent, child] = variant.split(".");
        const parentObj = theme[parent as keyof typeof theme];
        if (parentObj && typeof parentObj === "object" && child in parentObj) {
          return (parentObj as any)[child] as string;
        }
      } else {
        // Direct theme property
        if (variant in theme) {
          return theme[variant as keyof typeof theme] as string;
        }
      }
    }

    // Fallback colors for each variant
    const fallbacks: Record<BackgroundColorVariant, string> = {
      background: "#FFFFFF",
      surface: "#F9FAFB",
      card: "#F9FAFB",
      primary: "#F56320",
      secondary: "#3B82F6",
      tertiary: "#6B7280",
      success: "#16A34A",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0BA5EC",
      transparent: "transparent",
    };

    return fallbacks[color as BackgroundColorVariant] || color;
  };
  // Helper function to get spacing value
  const getSpacingValue = (size?: SpacingSize): number => {
    if (!size || size === "none") return 0;
    return spacing[size] || 0;
  };

  // Helper function to get radius value
  const getRadiusValue = (size?: RadiusSize): number => {
    if (!size || size === "none") return 0;
    return radius[size] || 0;
  };
  // Build dynamic styles
  const dynamicStyles: ViewStyle = {
    backgroundColor: resolveBackgroundColor(backgroundColor),

    // Padding
    ...(padding && { padding: getSpacingValue(padding) }),
    ...(paddingHorizontal && {
      paddingHorizontal: getSpacingValue(paddingHorizontal),
    }),
    ...(paddingVertical && {
      paddingVertical: getSpacingValue(paddingVertical),
    }),
    ...(paddingTop && { paddingTop: getSpacingValue(paddingTop) }),
    ...(paddingBottom && { paddingBottom: getSpacingValue(paddingBottom) }),
    ...(paddingLeft && { paddingLeft: getSpacingValue(paddingLeft) }),
    ...(paddingRight && { paddingRight: getSpacingValue(paddingRight) }),

    // Margin
    ...(margin && { margin: getSpacingValue(margin) }),
    ...(marginHorizontal && {
      marginHorizontal: getSpacingValue(marginHorizontal),
    }),
    ...(marginVertical && { marginVertical: getSpacingValue(marginVertical) }),
    ...(marginTop && { marginTop: getSpacingValue(marginTop) }),
    ...(marginBottom && { marginBottom: getSpacingValue(marginBottom) }),
    ...(marginLeft && { marginLeft: getSpacingValue(marginLeft) }),
    ...(marginRight && { marginRight: getSpacingValue(marginRight) }),

    // Border radius
    ...(borderRadius && { borderRadius: getRadiusValue(borderRadius) }),
    ...(borderTopLeftRadius && {
      borderTopLeftRadius: getRadiusValue(borderTopLeftRadius),
    }),
    ...(borderTopRightRadius && {
      borderTopRightRadius: getRadiusValue(borderTopRightRadius),
    }),
    ...(borderBottomLeftRadius && {
      borderBottomLeftRadius: getRadiusValue(borderBottomLeftRadius),
    }),
    ...(borderBottomRightRadius && {
      borderBottomRightRadius: getRadiusValue(borderBottomRightRadius),
    }),

    // Border
    ...(borderWidth && { borderWidth }),
    ...(borderColor && { borderColor }),
    ...(borderTopWidth && { borderTopWidth }),
    ...(borderBottomWidth && { borderBottomWidth }),
    ...(borderLeftWidth && { borderLeftWidth }),
    ...(borderRightWidth && { borderRightWidth }),
    // Layout
    ...(flex !== undefined && { flex }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(alignItems && { alignItems }),
    ...(justifyContent && { justifyContent }),
    ...(flexDirection && { flexDirection }),
    ...(flexWrap && { flexWrap }),

    // Shadows
    ...(elevation && { elevation }),
    ...(shadowColor && { shadowColor }),
    ...(shadowOffset && { shadowOffset }),
    ...(shadowOpacity && { shadowOpacity }),
    ...(shadowRadius && { shadowRadius }),

    // Overflow
    ...(overflow && { overflow }),
  };

  return (
    <View style={[styles.container, dynamicStyles, style]}>{children}</View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Default styles - minimal base
  },
});

export { Container };
export default Container;
