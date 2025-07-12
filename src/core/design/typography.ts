/**
 * Typography definitions for the Hoy application
 * Provides consistent text styling throughout the app
 *
 * @module @core/design/typography
 * @author Hoy Development Team
 * @version 1.0.0
 */

import { Platform } from "react-native";

// Detect if we're in Expo Go (custom fonts won't work)
const isExpoGo = false; // Disable Expo Go detection for now to use custom fonts

// Custom font families
export const fontFamily = {
  primary: "Satoshi-Regular",
  system: Platform.OS === "ios" ? "System" : "Roboto",
} as const;

// Helper function to get font family with robust Expo Go fallback
export const getFontFamily = (
  weight: string = "normal",
  italic: boolean = false
): string => {
  // In Expo Go, use system fonts with different families for visual distinction
  if (isExpoGo) {
    return getSystemFontFamily(weight, italic);
  }

  // For development builds, use custom Satoshi fonts
  const weightMap: { [key: string]: string } = {
    thin: "Light", // Using Light as closest to thin
    light: "Light",
    normal: "Regular",
    regular: "Regular",
    medium: "Medium",
    semibold: "Medium", // Map semibold to Medium since we don't have SemiBold
    bold: "Bold",
    heavy: "Black", // Using Black as heavy
    black: "Black",
  };

  const fontWeight = weightMap[weight] || "Regular";
  const suffix = italic ? "Italic" : "";

  // For static fonts with expo-font config plugin:
  return Platform.select({
    ios: `Satoshi-${fontWeight}${suffix}`,
    android: `Satoshi-${fontWeight}${suffix}`,
    default: `Satoshi-${fontWeight}${suffix}`,
  });
};

// System font fallback with better visual distinction for Expo Go
const getSystemFontFamily = (
  weight: string,
  italic: boolean = false
): string => {
  // Use different system font families to create visual distinction
  if (Platform.OS === "ios") {
    switch (weight) {
      case "thin":
      case "light":
        return "HelveticaNeue-Light";
      case "medium":
        return "HelveticaNeue-Medium";
      case "semibold":
        return "HelveticaNeue-Medium"; // iOS doesn't have semibold in system
      case "bold":
      case "heavy":
      case "black":
        return "HelveticaNeue-Bold";
      default:
        return "HelveticaNeue";
    }
  } else {
    // Android system fonts
    switch (weight) {
      case "thin":
      case "light":
        return "sans-serif-light";
      case "medium":
        return "sans-serif-medium";
      case "semibold":
      case "bold":
      case "heavy":
      case "black":
        return "sans-serif-black"; // Use black for better distinction
      default:
        return "sans-serif";
    }
  }
};

// Font size scale - improved hierarchy for mobile accessibility
export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  large: 36,
  huge: 42,
  giant: 48,
};

// Font weights - using numeric values for variable fonts
export const fontWeight = {
  thin: "200" as const,
  light: "300" as const,
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
  black: "900" as const,
};

// Line heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

// icon sizes
export const iconSize = {
  xxs: 12,
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
};

// Text styles - optimized hierarchy for mobile accessibility
export const text = {
  h1: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.giant, // 48px
    lineHeight: 56, // 48px + 8px for breathing room
  },
  h2: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.huge, // 42px
    lineHeight: 50, // 42px + 8px for breathing room
  },
  h3: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.large, // 36px
    lineHeight: 44, // 36px + 8px for breathing room
  },
  h4: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.display, // 32px
    lineHeight: 40, // 32px + 8px for breathing room
  },
  h5: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.xxxl, // 28px
    lineHeight: 36, // 28px + 8px for breathing room
  },
  h6: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.xl, // 24px
    lineHeight: 32, // 24px + 8px for breathing room
  },
  heading1: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.giant, // 48px
    lineHeight: 56, // 48px + 8px for breathing room
  },
  heading2: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.huge, // 42px
    lineHeight: 50, // 42px + 8px for breathing room
  },
  heading3: {
    fontFamily: getFontFamily("bold"),
    fontSize: fontSize.large, // 36px
    lineHeight: 44, // 36px + 8px for breathing room
  },
  heading4: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.display, // 32px
    lineHeight: 40, // 32px + 8px for breathing room
  },
  heading5: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.xxxl, // 28px
    lineHeight: 36, // 28px + 8px for breathing room
  },
  heading6: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.xl, // 24px
    lineHeight: 32, // 24px + 8px for breathing room
  },
  subtitle: {
    fontFamily: getFontFamily("medium"),
    fontSize: fontSize.lg, // 18px
    lineHeight: 24, // 18px + 6px for comfortable reading
  },
  body: {
    fontFamily: getFontFamily("normal"),
    fontSize: fontSize.md, // 16px
    lineHeight: 24, // 16px + 8px for comfortable reading spacing
  },
  body1: {
    fontFamily: getFontFamily("normal"),
    fontSize: fontSize.md, // 16px
    lineHeight: 24, // 16px + 8px for comfortable reading spacing
  },
  body2: {
    fontFamily: getFontFamily("normal"),
    fontSize: fontSize.sm, // 14px
    lineHeight: 20, // 14px + 6px for comfortable reading spacing
  },
  caption: {
    fontFamily: getFontFamily("normal"),
    fontSize: fontSize.xs, // 12px
    lineHeight: 16, // 12px + 4px for minimal spacing
  },
  button: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.md, // 16px
    lineHeight: 20, // 16px + 4px for tight spacing in buttons
  },
  buttonSmall: {
    fontFamily: getFontFamily("semibold"),
    fontSize: fontSize.sm, // 14px
    lineHeight: 18, // 14px + 4px for tight spacing for small buttons
  },
  label: {
    fontFamily: getFontFamily("medium"),
    fontSize: fontSize.sm, // 14px
    lineHeight: 18, // 14px + 4px for tight spacing for labels
  },
};

export default {
  fontSize,
  fontWeight,
  lineHeight,
  text,
  iconSize,
  fontFamily,
  getFontFamily,
};
