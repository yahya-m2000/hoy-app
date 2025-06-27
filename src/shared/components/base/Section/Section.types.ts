/**
 * Types for Section component
 */

import { BaseSectionProps } from "@shared/types/common";

export interface SectionProps extends BaseSectionProps {
  title?: string;
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
}
