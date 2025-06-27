import { Ionicons } from "@expo/vector-icons";
import { ViewStyle } from "react-native";

export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: ViewStyle;
  background?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
}
