/**
 * Color palette for the Hoy application
 * Following a wireframe aesthetic with grayscale, low-fidelity look
 *
 * @module @core/design/colors
 * @author Hoy Development Team
 * @version 1.0.0
 */

// Import typography and spacing constants
import { fontSize, fontWeight } from "./typography";
import { spacing } from "./spacing";

// Primary brand colors - Green (#53E09C)
export const primary = {
  50: "#F0FDF4",
  100: "#DCFCE7",
  200: "#BBF7D0",
  300: "#86EFAC",
  400: "#4ADE80",
  500: "#53E09C",
  600: "#16A34A",
  700: "#15803D",
  800: "#166534",
  900: "#14532D",
};

// Secondary brand colors - Teal (#0D9488) - Close to green on color wheel
export const secondary = {
  50: "#F0FDFA",
  100: "#CCFBF1",
  200: "#99F6E4",
  300: "#5EEAD4",
  400: "#2DD4BF",
  500: "#0D9488",
  600: "#0F766E",
  700: "#115E59",
  800: "#134E4A",
  900: "#134E4A",
};

// Tertiary brand colors - Blue-Green (#0891B2) - Complementary accent
export const tertiary = {
  50: "#ECFEFF",
  100: "#CFFAFE",
  200: "#A5F3FC",
  300: "#67E8F9",
  400: "#22D3EE",
  500: "#0891B2",
  600: "#0E7490",
  700: "#155E75",
  800: "#164E63",
  900: "#164E63",
};

// Grayscale palette
export const gray = {
  50: "#F9FAFB",
  100: "#F3F4F6",
  200: "#E5E7EB",
  300: "#D1D5DB",
  400: "#9CA3AF",
  500: "#6B7280",
  600: "#4B5563",
  700: "#374151",
  800: "#1F2937",
  900: "#111827",
};

// Status colors
export const success = {
  50: "#ECFDF3",
  100: "#D1FADF",
  200: "#A6F4C5",
  300: "#6CE9A6",
  400: "#32D583",
  500: "#12B76A",
  600: "#039855",
  700: "#027A48",
  800: "#05603A",
  900: "#054F31",
};

export const error = {
  50: "#FEF3F2",
  100: "#FEE4E2",
  200: "#FECDCA",
  300: "#FDA29B",
  400: "#F97066",
  500: "#F04438",
  600: "#D92D20",
  700: "#B42318",
  800: "#912018",
  900: "#7A271A",
};

export const warning = {
  50: "#FFFAEB",
  100: "#FEF0C7",
  200: "#FEDF89",
  300: "#FEC84B",
  400: "#FDB022",
  500: "#F79009",
  600: "#DC6803",
  700: "#B54708",
  800: "#93370D",
  900: "#7A2E0E",
};

export const info = {
  50: "#F0F9FF",
  100: "#E0F2FE",
  200: "#B9E6FE",
  300: "#7CD4FD",
  400: "#36BFFA",
  500: "#0BA5EC",
  600: "#0086C9",
  700: "#026AA2",
  800: "#065986",
  900: "#0B4A6F",
};

// For a wireframe aesthetic, we'll use these colors predominantly
export const wireframe = {
  background: "#FFFFFF",
  surface: gray[100],
  skeleton: gray[200],
  border: gray[200],
  text: {
    primary: gray[800],
    secondary: gray[600],
    tertiary: gray[500],
    disabled: gray[400],
    inverse: "#FFFFFF",
  },
  divider: gray[200],
};

// Dark mode colors
export const darkMode = {
  background: gray[900],
  surface: gray[800],
  skeleton: gray[800],

  border: gray[700],
  text: {
    primary: gray[50],
    secondary: gray[300],
    tertiary: gray[500],
    disabled: gray[600],
    inverse: gray[900],
  },
  divider: gray[700],
};

// Export the theme
export const theme = {
  light: {
    ...wireframe,
    primary: primary[500],
    primaryLight: primary[100],
    secondary: secondary[500],
    secondaryLight: secondary[100],
    tertiary: tertiary[500],
    tertiaryLight: tertiary[100],
    success: success[600],
    error: error[600],
    warning: warning[600],
    info: info[600],
    white: "#FFFFFF",
    black: "#000000",
    text: {
      primary: wireframe.text.primary,
      secondary: wireframe.text.secondary,
      tertiary: wireframe.text.tertiary,
      disabled: wireframe.text.disabled,
      inverse: wireframe.text.inverse,
      subtitle: wireframe.text.secondary, // Subtitle uses secondary text color
    },
    colors: {
      primary: primary[500],
      secondary: secondary[500],
      tertiary: tertiary[500],
      success: success[600],
      error: error[600],
      warning: warning[600],
      info: info[600],
      white: "#FFFFFF",
      black: "#000000",
      skeletonBackground: gray[200],
      skeletonHighlight: "#FFFFFF",
      // Color palettes for advanced usage
      gray,
      primaryPalette: primary,
      secondaryPalette: secondary,
      tertiaryPalette: tertiary,
      successPalette: success,
      errorPalette: error,
      warningPalette: warning,
      infoPalette: info,
    },
    fontSize,
    fontWeight,
    spacing,
  },
  dark: {
    ...darkMode,
    primary: primary[400],
    primaryLight: primary[900],
    secondary: secondary[400],
    secondaryLight: secondary[900],
    tertiary: tertiary[400],
    tertiaryLight: tertiary[900],
    success: success[400],
    error: error[400],
    warning: warning[400],
    info: info[400],
    white: "#FFFFFF",
    black: "#000000",
    text: {
      primary: darkMode.text.primary,
      secondary: darkMode.text.secondary,
      tertiary: darkMode.text.tertiary,
      disabled: darkMode.text.disabled,
      inverse: darkMode.text.inverse,
      subtitle: darkMode.text.secondary, // Subtitle uses secondary text color
    },
    colors: {
      primary: primary[400],
      secondary: secondary[400],
      tertiary: tertiary[400],
      success: success[400],
      error: error[400],
      warning: warning[400],
      info: info[400],
      white: "#FFFFFF",
      black: "#000000",
      skeletonBackground: gray[700],
      skeletonHighlight: gray[600],
      // Color palettes for advanced usage
      gray,
      primaryPalette: primary,
      secondaryPalette: secondary,
      tertiaryPalette: tertiary,
      successPalette: success,
      errorPalette: error,
      warningPalette: warning,
      infoPalette: info,
    },
    fontSize,
    fontWeight,
    spacing,
  },
};

export default theme;
