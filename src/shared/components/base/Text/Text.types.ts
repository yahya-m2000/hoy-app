/**
 * Base Text component types
 */

export interface BaseTextProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption" | "label";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string;
  align?: "left" | "center" | "right";
  style?: any;
  numberOfLines?: number;
}

export interface HeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string;
  align?: "left" | "center" | "right";
  style?: any;
}
