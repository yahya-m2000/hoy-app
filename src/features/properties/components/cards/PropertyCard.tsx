/**
 * PropertyCard component
 * Unified property card with size variants (small, medium, large)
 * All variants use column layout: image on top, content below
 */

import React, { useState, useCallback } from "react";

// Shared components
import {
  BookingStatusBadge,
  BaseCard,
  Container,
  Text,
} from "@shared/components";

// Hooks and utilities
import { useTheme } from "@core/hooks";
import { useDateSelection } from "@features/calendar/context/DateSelectionContext";
import { spacing, fontSize, radius } from "@core/design";
import {
  formatPrice,
  calculateStayDetails,
  formatBookingDate,
  calculateBookingNights,
} from "src/features/properties/utils/propertyUtils";

// Types
import { PropertyCardProps } from "@core/types";
import CollectionsModal from "src/features/properties/modals/collections/CollectionsModal";
import WishlistButton from "../shared/WishlistButton";
import { PropertyImageContainer } from "../details";
import RatingDisplay from "../shared/RatingDisplay";
import { t } from "i18next";

export const PropertyCard: React.FC<PropertyCardProps> = ({
  _id,
  name,
  address,
  price,
  currency = "USD",
  imageUrl,
  images,
  onPress,
  style,
  rating,
  reviewCount,
  variant = "large",
  // Animation props
  isLoading = false,
  animateOnMount = false,
  fadeInDuration = 300,
  // Booking-related props
  booking,
  showBookingInfo = false,
  // Property and host details
  type,
  propertyType,
  hostType,
  // Legacy props
  title,
  location,
  city,
  country,
}) => {
  const { theme } = useTheme();
  const { searchDates } = useDateSelection();

  // Collections modal state
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Get display data based on mode
  const getDisplayData = () => {
    if (showBookingInfo && booking) {
      const property = booking.property;
      return {
        propertyData: property || { name, address, images },
        checkIn: formatBookingDate(booking.checkIn),
        checkOut: formatBookingDate(booking.checkOut),
        nights: calculateBookingNights(booking.checkIn, booking.checkOut),
        totalPrice: booking.totalPrice,
        isBookingMode: true,
        status: booking.bookingStatus,
      };
    } else {
      const { nights, totalPrice } = calculateStayDetails(price, searchDates);
      return {
        propertyData: { name, address, images, _id },
        nights,
        totalPrice,
        isBookingMode: false,
        status: null,
      };
    }
  };
  const displayData = getDisplayData();

  // Helper functions for display formatting
  const getPropertyTypeDisplay = () => {
    const propType = propertyType || type || "Property";
    const cityName = address?.city || city || "";

    // Capitalize first letter of property type
    const formattedType =
      propType.charAt(0).toUpperCase() + propType.slice(1).toLowerCase();

    if (cityName) {
      return `${formattedType} ${t("home.in")} ${cityName}`;
    }
    return formattedType;
  };

  const getHostTypeDisplay = () => {
    if (!hostType) return t("home.individualHost");

    switch (hostType.toLowerCase()) {
      case "individual":
        return t("home.individualHost");
      case "business":
        return t("home.businessHost");
      case "organization":
        return t("home.organizationHost");
      default:
        return t("home.individualHost");
    }
  };

  // Handle collections
  const handleShowCollections = useCallback(() => {
    setShowCollectionsModal(true);
  }, []);

  const handleCloseCollections = useCallback(() => {
    setShowCollectionsModal(false);
  }, []);

  const handleCollectionToggle = useCallback(
    (collectionId: string, isAdded: boolean) => {
      // Property toggled in collection
    },
    []
  );

  // Variant configuration - all styling properties defined in one place
  const variantConfig = {
    small: {
      // Container
      width: 120,
      marginBottom: undefined,

      // Image
      imageHeight: 120,
      aspectRatio: 1,
      imageVariant: "small" as const,

      // Content
      contentPaddingTop: "xs" as const,
      contentPaddingHorizontal: undefined,

      // Text styling
      propertyTypeVariant: "caption" as const,
      propertyTypeSize: undefined,
      hostTypeSize: "xs" as const,
      priceVariant: "caption" as const,
      priceSize: undefined,

      // Rating
      ratingVariant: "small" as const,
      ratingIconSize: 10,
      ratingFontSize: fontSize.xs,

      // Wishlist button
      wishlistVariant: "small" as const,
    },

    large: {
      // Container
      width: 200,
      marginBottom: undefined,

      // Image
      imageHeight: 200,
      aspectRatio: 1,
      imageVariant: "large" as const,

      // Content
      contentPaddingTop: "xs" as const,
      contentPaddingHorizontal: undefined,

      // Text styling
      propertyTypeVariant: "body" as const,
      propertyTypeSize: "sm" as const,
      hostTypeSize: "xs" as const,
      priceVariant: "body2" as const,
      priceSize: undefined,

      // Rating
      ratingVariant: "large" as const,
      ratingIconSize: 12,
      ratingFontSize: fontSize.xs,

      // Wishlist button
      wishlistVariant: "large" as const,
    },

    collection: {
      // Container
      width: 180,
      marginBottom: undefined,

      // Image
      imageHeight: 180,
      aspectRatio: 1,
      imageVariant: "small" as const,

      // Content
      contentPaddingTop: "xs" as const,
      contentPaddingHorizontal: undefined,

      // Text styling
      propertyTypeVariant: "caption" as const,
      propertyTypeSize: undefined,
      hostTypeSize: "xs" as const,
      priceVariant: "caption" as const,
      priceSize: undefined,

      // Rating
      ratingVariant: "small" as const,
      ratingIconSize: 10,
      ratingFontSize: fontSize.xs,

      // Wishlist button
      wishlistVariant: "small" as const,
    },

    fullWidth: {
      // Container
      width: undefined, // Let it fill parent width
      marginBottom: "xl" as const,

      // Image
      imageHeight: 240,
      aspectRatio: 16 / 9,
      imageVariant: "large" as const,

      // Text styling
      propertyTypeVariant: "body" as const,
      propertyTypeSize: "md" as const,
      hostTypeSize: "sm" as const,
      priceVariant: "body2" as const,
      priceSize: "xl" as const,

      // Rating
      ratingVariant: "large" as const,
      ratingIconSize: 16,
      ratingFontSize: fontSize.sm,

      // Wishlist button
      wishlistVariant: "large" as const,
    },
  };

  // Get current variant config
  const config = variantConfig[variant];

  // Column layout for all variants
  return (
    <Container marginBottom={config.marginBottom}>
      <BaseCard
        variant="vertical"
        style={{
          ...(config.width && { width: config.width }),
          ...style,
        }}
        onPress={onPress}
        isLoading={isLoading}
        animateOnMount={animateOnMount}
        fadeInDuration={fadeInDuration}
        accessibilityRole="button"
        accessibilityLabel={`Property: ${
          name || title
        }, ${getPropertyTypeDisplay()}, ${formatPrice(
          price,
          currency
        )} per night`}
      >
        {/* Image Container */}
        <Container
          style={{ position: "relative" }}
          borderRadius="lg"
          height={config.imageHeight}
        >
          <PropertyImageContainer
            imageUrl={imageUrl}
            images={displayData.propertyData?.images || images}
            variant={config.imageVariant}
            containerStyle={{
              borderRadius: radius.lg,
              aspectRatio: config.aspectRatio,
            }}
            resizeMode="cover"
          >
            {displayData.isBookingMode && displayData.status && (
              <BookingStatusBadge
                status={displayData.status}
                type="booking"
                size="small"
              />
            )}
            {!displayData.isBookingMode && (
              <WishlistButton
                propertyId={_id}
                variant={config.wishlistVariant}
                onShowCollections={handleShowCollections}
                onCollectionToggle={handleCollectionToggle}
              />
            )}
          </PropertyImageContainer>
        </Container>

        {/* Content Container */}
        <Container
          paddingTop={config.contentPaddingTop}
          paddingHorizontal={config.contentPaddingHorizontal}
        >
          {/* Property Type and Location */}
          <Container>
            <Text
              variant={config.propertyTypeVariant}
              weight="medium"
              size={config.propertyTypeSize}
              color={theme.text.primary}
            >
              {getPropertyTypeDisplay()}
            </Text>
          </Container>

          {/* Host Type */}
          {getHostTypeDisplay() && (
            <Container marginBottom="xs">
              <Text
                variant="caption"
                weight="normal"
                size={config.hostTypeSize}
                color={theme.text.secondary}
                numberOfLines={1}
              >
                {getHostTypeDisplay()}
              </Text>
            </Container>
          )}

          {/* Price and Rating Row */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Text
              variant={config.priceVariant}
              weight="semibold"
              size={config.priceSize}
              color={theme.text.primary}
            >
              {`${formatPrice(price, currency)} ${t("home.perNight")}`}
            </Text>
            <RatingDisplay
              rating={rating || 0}
              reviewCount={reviewCount || 0}
              variant={config.ratingVariant}
              iconSize={config.ratingIconSize}
              ratingStyle={{
                fontSize: config.ratingFontSize,
                color: theme.text.primary,
              }}
              reviewCountStyle={{
                fontSize: config.ratingFontSize,
                color: theme.text.secondary,
              }}
            />
          </Container>
        </Container>
      </BaseCard>
      <CollectionsModal
        visible={showCollectionsModal}
        onClose={handleCloseCollections}
        propertyId={_id}
        onCollectionToggle={handleCollectionToggle}
      />
    </Container>
  );
};

export default PropertyCard;
