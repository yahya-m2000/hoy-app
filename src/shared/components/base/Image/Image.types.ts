/**
 * Base Image component types
 */

import { ImageSourcePropType, ImageStyle, DimensionValue } from "react-native";

export interface BaseImageProps {
  source: ImageSourcePropType | string;
  style?: ImageStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  fallback?: ImageSourcePropType;
  onLoad?: () => void;
  onError?: () => void;
}
