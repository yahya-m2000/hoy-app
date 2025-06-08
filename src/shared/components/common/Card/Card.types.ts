/**
 * Card component types
 */

import { ContainerProps } from "../../base/Container/Container.types";
import type { IPrice } from "../../../types/property/property";

// Base Card extends Container props since cards are containers
export interface BaseCardProps
  extends Pick<ContainerProps, "style" | "padding"> {
  title?: string;
  icon?: string;
  isLoading?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "plain";
  disabled?: boolean;
  testID?: string;
}

// Property Card extends Base Card but overrides onPress
export interface PropertyCardProps extends Omit<BaseCardProps, "onPress"> {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number | IPrice;
  currency?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  amenities?: string[];
  isWishlisted?: boolean;
  onPress?: (id: string) => void;
  onWishlistToggle?: (id: string) => void;
}

// Collection Card extends Base Card but overrides onPress
export interface CollectionCardProps extends Omit<BaseCardProps, "onPress"> {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  propertyCount?: number;
  onPress?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
