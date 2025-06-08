/**
 * Loading component types
 */

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
}

export interface LoadingSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  marginBottom?: number;
  animated?: boolean;
}
