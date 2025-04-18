/**
 * Color palette for the Hoy application
 * Following a wireframe aesthetic with grayscale, low-fidelity look
 */

// Import typography and spacing constants
import { fontSize, fontWeight } from "./typography";
import spacing from "./spacing";

// Primary brand colors
export const primary = {
  50: "#F0F7FF",
  100: "#E0F0FF",
  200: "#BAE0FF",
  300: "#91CAFF",
  400: "#52A9FF",
  500: "#2E90FA",
  600: "#1570EF",
  700: "#175CD3",
  800: "#1849A9",
  900: "#194185",
};

// Secondary brand colors
export const secondary = {
  50: "#F9F5FF",
  100: "#F4EBFF",
  200: "#E9D7FE",
  300: "#D6BBFB",
  400: "#B692F6",
  500: "#9E77ED",
  600: "#7F56D9",
  700: "#6941C6",
  800: "#53389E",
  900: "#42307D",
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
  surface: gray[50],
  border: gray[200],
  text: {
    primary: gray[900],
    secondary: gray[600],
    tertiary: gray[400],
    disabled: gray[300],
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
    primary: primary[600],
    primaryLight: primary[100],
    secondary: secondary[600],
    secondaryLight: secondary[100],
    success: success[600],
    error: error[600],
    warning: warning[600],
    info: info[600],
    // Include all color palettes for component usage
    colors: {
      gray,
      primary,
      secondary,
      success,
      error,
      warning,
      info,
    },
    // Include typography and spacing
    fontSize,
    fontWeight,
    spacing,
    // Basic colors
    white: "#FFFFFF",
    black: "#000000",
  },
  dark: {
    ...darkMode,
    primary: primary[400],
    primaryLight: primary[900],
    secondary: secondary[400],
    secondaryLight: secondary[900],
    success: success[400],
    error: error[400],
    warning: warning[400],
    info: info[400],
    // Include all color palettes for component usage
    colors: {
      gray,
      primary,
      secondary,
      success,
      error,
      warning,
      info,
    },
    // Include typography and spacing
    fontSize,
    fontWeight,
    spacing,
    // Basic colors
    white: "#FFFFFF",
    black: "#000000",
  },
};

export default theme;
