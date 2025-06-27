import { ViewStyle, DimensionValue } from "react-native";

// Spacing types
export type SpacingSize =
  | "xxxs"
  | "xxs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "xxxl"
  | "none";
export type RadiusSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "pill"
  | "circle"
  | "none";

// Background color variants
export type BackgroundColorVariant =
  | "background" // Main app background
  | "surface" // Card/container surfaces
  | "card" // Card backgrounds
  | "primary" // Primary brand color
  | "secondary" // Secondary brand color
  | "tertiary" // Tertiary color
  | "success" // Success state
  | "error" // Error state
  | "warning" // Warning state
  | "info" // Info state
  | "transparent"; // Transparent background

export interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | readonly ViewStyle[];

  // Background - can be semantic variant or raw color
  backgroundColor?: BackgroundColorVariant | string;

  // Padding options
  padding?: SpacingSize;
  paddingHorizontal?: SpacingSize;
  paddingVertical?: SpacingSize;
  paddingTop?: SpacingSize;
  paddingBottom?: SpacingSize;
  paddingLeft?: SpacingSize;
  paddingRight?: SpacingSize;

  // Margin options
  margin?: SpacingSize;
  marginHorizontal?: SpacingSize;
  marginVertical?: SpacingSize;
  marginTop?: SpacingSize;
  marginBottom?: SpacingSize;
  marginLeft?: SpacingSize;
  marginRight?: SpacingSize;

  // Border radius
  borderRadius?: RadiusSize;
  borderTopLeftRadius?: RadiusSize;
  borderTopRightRadius?: RadiusSize;
  borderBottomLeftRadius?: RadiusSize;
  borderBottomRightRadius?: RadiusSize;

  // Border
  borderWidth?: number;
  borderColor?: string;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  // Layout
  flex?: number;
  width?: DimensionValue;
  height?: DimensionValue;
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";

  // Shadows
  elevation?: number; // Android
  shadowColor?: string; // iOS
  shadowOffset?: { width: number; height: number }; // iOS
  shadowOpacity?: number; // iOS
  shadowRadius?: number; // iOS

  // Overflow
  overflow?: "visible" | "hidden" | "scroll";
}
