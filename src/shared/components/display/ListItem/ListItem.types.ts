/**
 * Types for ListItem component
 */

import { MaterialIcons } from "@expo/vector-icons";
import { BaseSectionProps } from "src/core/types/common.types";

export interface ListItemProps extends BaseSectionProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  highlight?: boolean;
  spacing?: "sm" | "md" | "lg";
}
