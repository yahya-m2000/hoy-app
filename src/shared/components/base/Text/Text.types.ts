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
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "black";
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
  margin?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginBottom?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginTop?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginLeft?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginRight?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginHorizontal?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  marginVertical?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export interface HeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold" | "black";
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
