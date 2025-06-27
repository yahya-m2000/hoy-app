/**
 * Card component types
 */

import { ContainerProps } from "../../base/Container/Container.types";
// Base Card extends Container props since cards are containers
export interface BaseCardProps
  extends Pick<ContainerProps, "style" | "padding"> {
  title?: string;
  icon?: string;
  isLoading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "plain";
  disabled?: boolean;
  testID?: string;
}
