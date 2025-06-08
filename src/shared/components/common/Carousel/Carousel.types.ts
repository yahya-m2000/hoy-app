/**
 * Carousel component types
 */

import { PropertyType } from "@shared/types/property";

export interface CategoryListingsCarouselProps {
  city?: string;
  categoryType?: PropertyType;
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
}

export interface BaseCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}
