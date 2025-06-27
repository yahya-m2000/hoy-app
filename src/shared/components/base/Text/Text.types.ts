/**
 * Base Text component types
 */

export interface BaseTextProps {
  children: React.ReactNode;
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle"
    | "body"
    | "body2"
    | "caption"
    | "label"
    | "button"
    | "buttonSmall";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?:
    | string
    | "primary"
    | "secondary"
    | "tertiary"
    | "disabled"
    | "inverse"
    | "subtitle";
  align?: "left" | "center" | "right";
  style?: any;
  numberOfLines?: number;
}

export interface HeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?:
    | string
    | "primary"
    | "secondary"
    | "tertiary"
    | "disabled"
    | "inverse"
    | "subtitle";
  align?: "left" | "center" | "right";
  style?: any;
}
