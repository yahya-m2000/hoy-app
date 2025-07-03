/**
 * Base Carousel component types
 * These types serve as the foundation for all carousel implementations
 */

import { ViewStyle, ScrollViewProps } from "react-native";

/**
 * Base props for all carousel components
 * Generic type T represents the data type being displayed
 */
export interface BaseCarouselProps<T = any> {
  // Data and rendering
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;

  // ScrollView behavior
  horizontal?: boolean;
  pagingEnabled?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;

  // Styling
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;

  // Loading states
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;

  // Empty states
  emptyComponent?: React.ReactNode;

  // Callbacks
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onScroll?: ScrollViewProps["onScroll"];
}

/**
 * Props for image-based carousels (photo galleries, etc.)
 */
export interface BaseImageCarouselProps {
  images: string[];
  style?: ViewStyle;
  imageStyle?: ViewStyle;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onImagePress?: (imageUrl: string, index: number) => void;
}

/**
 * Props for list-based carousels (property listings, etc.)
 */
export interface BaseListCarouselProps<T = any> extends BaseCarouselProps<T> {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}
