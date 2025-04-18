/**
 * Typography definitions for the Hoy application
 * Provides consistent text styling throughout the app
 */

import { Platform } from "react-native";

// Base font families
const fontFamily = Platform.OS === "ios" ? "System" : "Roboto";

// Font size scale
export const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  giant: 48,
};

// Font weights
export const fontWeight = {
  thin: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
};

// Line heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
};

// Text styles
export const text = {
  heading1: {
    fontFamily,
    fontSize: fontSize.giant,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  heading2: {
    fontFamily,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  heading3: {
    fontFamily,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },
  heading4: {
    fontFamily,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  heading5: {
    fontFamily,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  heading6: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  body1: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  body2: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  caption: {
    fontFamily,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontFamily,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  buttonSmall: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
  },
  label: {
    fontFamily,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
  },
};

export default {
  fontSize,
  fontWeight,
  lineHeight,
  text,
};
