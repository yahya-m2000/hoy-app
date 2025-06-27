/**
 * Color palette for the Hoy application
 * Following a wireframe aesthetic with grayscale, low-fidelity look
 */

// Import typography and spacing constants
import { fontSize, fontWeight } from "./typography";
import { spacing } from "./spacing";

// Primary brand colors - Orange (#F56320)
export const primary = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F56320",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
};

// Secondary brand colors - Blue (#3B82F6) - Complementary to orange
export const secondary = {
  50: "#EFF6FF",
  100: "#DBEAFE",
  200: "#BFDBFE",
  300: "#93C5FD",
  400: "#60A5FA",
  500: "#3B82F6",
  600: "#2563EB",
  700: "#1D4ED8",
  800: "#1E40AF",
  900: "#1E3A8A",
};

// Tertiary brand colors - Yellow (#FDE047) - Complementary accent to orange and blue
export const tertiary = {
  50: "#FEFCE8",
  100: "#FEF9C3",
  200: "#FEF08A",
  300: "#FDE047",
  400: "#FACC15",
  500: "#EAB308",
  600: "#CA8A04",
  700: "#A16207",
  800: "#854D0E",
  900: "#713F12",
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
