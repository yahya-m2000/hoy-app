import { ViewStyle } from "react-native";

export type ScreenPadding = "none" | "small" | "medium" | "large";

export interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
  backgroundColor?: string;
  padding?: ScreenPadding;
}
