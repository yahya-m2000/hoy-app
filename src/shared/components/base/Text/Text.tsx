/**
 * Text component for the Hoy application
 * Provides consistent text styles with variant and size support
 */

// React
import React from "react";

// React Native
import { Text as RNText } from "react-native";

// Context
import { useTheme } from "src/core/hooks/useTheme";
import { text, getFontFamily } from "@core/design/typography";

// Types
import { BaseTextProps } from "./Text.types";
import { spacing } from "src/core/design";

const Text: React.FC<BaseTextProps> = ({
  children,
  variant = "body",
  size = "md",
  margin,
  marginBottom,
  marginTop,
  marginLeft,
  marginRight,
  marginHorizontal,
  marginVertical,
  weight,
  color,
  align = "left",
  style,
  numberOfLines,
  ...props
}) => {
  const { theme } = useTheme();

  const getTextStyle = () => {
    // If weight is explicitly provided, use it to override the variant's font
    if (weight) {
      const baseVariantStyle = getBaseVariantStyle();
      return {
        ...baseVariantStyle,
        fontFamily: getFontFamily(weight, false),
        // Only include fontWeight for system font fallback if needed
        fontWeight: undefined, // Let fontFamily handle the weight
      };
    }

    // Otherwise use the predefined variant styles
    return getBaseVariantStyle();
  };
  const getBaseVariantStyle = () => {
    switch (variant) {
      case "h1":
        return text.heading1;
      case "h2":
        return text.heading2;
      case "h3":
        return text.heading3;
      case "h4":
        return text.heading4;
      case "h5":
        return text.heading5;
      case "h6":
        return text.heading6;
      case "subtitle":
        return text.subtitle;
      case "body":
        return text.body1;
      case "body2":
        return text.body2;
      case "caption":
        return text.caption;
      case "label":
        return text.label;
      case "button":
        return text.button;
      case "buttonSmall":
        return text.buttonSmall;
      default:
        return text.body1;
    }
  };
  const getSizeOverride = () => {
    // Only apply size overrides for body variant to maintain flexibility
    if (variant !== "body") return {};

    switch (size) {
      case "xs":
        return { fontSize: 12, lineHeight: 16 };
      case "sm":
        return { fontSize: 14, lineHeight: 20 };
      case "md":
        return { fontSize: 16, lineHeight: 24 };
      case "lg":
        return { fontSize: 18, lineHeight: 28 };
      case "xl":
        return { fontSize: 20, lineHeight: 28 };
      case "2xl":
        return { fontSize: 24, lineHeight: 32 };
      default:
        return {};
    }
  };
  const baseStyle = getTextStyle();
  const sizeOverride = getSizeOverride(); // Get the default color based on variant
  const getDefaultColor = () => {
    // If color is provided, check if it's a theme variant or raw color
    if (color) {
      // Handle theme color variants
      const themeColors = theme.text || {};

      switch (color) {
        case "primary":
          return themeColors.primary || "#000000";
        case "secondary":
          return themeColors.secondary || "#666666";
        case "tertiary":
          return themeColors.tertiary || "#999999";
        case "disabled":
          return themeColors.disabled || "#cccccc";
        case "inverse":
          return themeColors.inverse || "#ffffff";
        case "subtitle":
          return themeColors.subtitle || themeColors.secondary || "#666666";
        default:
          // If it's not a theme variant, treat it as a raw color value
          return color;
      }
    }

    // Use theme text colors with fallback, based on variant
    const themeColors = theme.text || {};

    switch (variant) {
      case "subtitle":
        return themeColors.subtitle || themeColors.secondary || "#666666";
      case "caption":
        return themeColors.secondary || "#666666";
      case "label":
        return themeColors.secondary || "#666666";
      default:
        return themeColors.primary || "#000000";
    }
  };
  const getMargin = () => {
    const marginStyles: any = {};

    if (margin !== undefined) {
      marginStyles.margin = getMarginValue(margin);
    }
    if (marginBottom !== undefined) {
      marginStyles.marginBottom = getMarginValue(marginBottom);
    }
    if (marginTop !== undefined) {
      marginStyles.marginTop = getMarginValue(marginTop);
    }
    if (marginLeft !== undefined) {
      marginStyles.marginLeft = getMarginValue(marginLeft);
    }
    if (marginRight !== undefined) {
      marginStyles.marginRight = getMarginValue(marginRight);
    }
    if (marginHorizontal !== undefined) {
      marginStyles.marginHorizontal = getMarginValue(marginHorizontal);
    }
    if (marginVertical !== undefined) {
      marginStyles.marginVertical = getMarginValue(marginVertical);
    }

    return marginStyles;
  };
  const getMarginValue = (
    value: "none" | "sm" | "md" | "lg" | "xl" | "2xl"
  ) => {
    switch (value) {
      case "none":
        return 0;
      case "sm":
        return spacing.sm;
      case "md":
        return spacing.md;
      case "lg":
        return spacing.lg;
      case "xl":
        return spacing.xl;
      case "2xl":
        return spacing.xxl;
      default:
        return 0;
    }
  };

  return (
    <RNText
      style={[
        baseStyle,
        sizeOverride,
        {
          color: getDefaultColor(),
          textAlign: align,
        },
        getMargin(),
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
