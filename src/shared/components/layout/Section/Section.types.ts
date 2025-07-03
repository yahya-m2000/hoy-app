/**
 * Types for Section component
 */

import { BaseSectionProps } from "src/core/types/common.types";

export interface SectionProps extends BaseSectionProps {
  title?: string;
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
}
