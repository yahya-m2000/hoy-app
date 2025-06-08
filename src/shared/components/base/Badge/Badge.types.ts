/**
 * Base Badge component types
 */

export interface BaseBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  style?: any;
}
