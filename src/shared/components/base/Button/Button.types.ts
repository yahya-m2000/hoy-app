/**
 * Base Button component types
 */

export interface BaseButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: any;
  textStyle?: any;
  accessibilityLabel?: string;
}
