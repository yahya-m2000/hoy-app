import { ViewStyle } from "react-native";

export type ContainerPadding = "none" | "small" | "medium" | "large";

export interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | readonly ViewStyle[];
  padding?: ContainerPadding;
  backgroundColor?: string;
}
