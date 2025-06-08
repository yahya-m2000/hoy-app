/**
 * Property Components
 * Common reusable components for property displays
 */

// Core property components
export { default as PropertyImageContainer } from "./ImageContainer";
export { default as WishlistButton } from "./WishlistButton";
export { default as RatingDisplay } from "./RatingDisplay";
export { default as PriceDisplay } from "./PriceDisplay";
export { default as PropertyLocationDisplay } from "./PropertyLocationDisplay";
export { default as PropertyCollectionPreview } from "./PropertyCollectionPreview";
export { default as CollectionPreview } from "./CollectionPreview";
export { default as LocationDisplay } from "./LocationDisplay";
export { default as PropertyAvailability } from "./PropertyAvailability";

// Export types - these need to be imported from each component file individually
export type { PropertyImageContainerProps } from "./ImageContainer";
export type { WishlistButtonProps } from "./WishlistButton";
export type { RatingDisplayProps } from "./RatingDisplay";
export type { PriceDisplayProps } from "./PriceDisplay";
export type { PropertyLocationDisplayProps } from "./PropertyLocationDisplay";
export type { PropertyCollectionPreviewProps } from "./PropertyCollectionPreview";
export type { CollectionPreviewProps } from "./CollectionPreview";
export type { LocationDisplayProps } from "./LocationDisplay";
export type { PropertyAvailabilityProps } from "./PropertyAvailability";
