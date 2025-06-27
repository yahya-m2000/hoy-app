import { ViewStyle, ScrollViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ScreenPadding = "none" | "small" | "medium" | "large";

export type HeaderVariant = "transparent" | "solid" | "minimal" | "none";

export interface HeaderContent {
  children?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  onPress?: () => void;
}

export interface ScreenHeaderProps {
  variant?: HeaderVariant;
  title?: string;
  left?: HeaderContent;
  right?: HeaderContent;
  backgroundColor?: string;
  showDivider?: boolean;
  scrollThreshold?: number; // Scroll position where header becomes solid
}

export interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
  backgroundColor?: string;
  padding?: ScreenPadding;

  // Header props
  header?: ScreenHeaderProps;

  // Scroll props - when provided, Screen becomes a ScrollView
  scrollable?: boolean;
  scrollProps?: Omit<ScrollViewProps, "children">;
  onScroll?: (scrollY: number) => void;

  // Common screen states
  loading?: boolean;
  error?: string | null;
  emptyState?: {
    title: string;
    subtitle?: string;
    action?: {
      label: string;
      onPress: () => void;
    };
  };
}
