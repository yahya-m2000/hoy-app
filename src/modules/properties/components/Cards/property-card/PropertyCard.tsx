/**
 * PropertyCard component
 * Unified property card with size variants (small, medium, large)
 * All variants use column layout: image on top, content below
 */

import React, { useState, useCallback } from "react";

// Base components
import { BaseCard, Container, Text } from "@shared/components/base";

// Shared components
import {
  PropertyImageContainer,
  RatingDisplay,
  WishlistButton,
  BookingStatusBadge,
} from "@shared/components/common";

// Hooks and utilities
import { useTheme } from "@shared/hooks";
import { useDateSelection } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";
import {
  formatPrice,
  calculateStayDetails,
  formatBookingDate,
  calculateBookingNights,
} from "@shared/utils/propertyUtils";

// Types
import { PropertyCardProps } from "@modules/properties/types/cards";
import CollectionsModal from "@modules/properties/modals/collections/CollectionsModal";

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
      return `${formattedType} in ${cityName}`;
    }
    return formattedType;
  };

  const getHostTypeDisplay = () => {
    if (!hostType) return "Individual host";

    switch (hostType.toLowerCase()) {
      case "individual":
        return "Individual host";
      case "business":
        return "Business host";
      case "organization":
        return "Organization host";
      default:
        return "Individual host";
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
  // Get size-specific dimensions for column layout
  const getDimensions = () => {
    switch (variant) {
      case "small":
        return {
          width: 120,
          height: 120,
          imageHeight: 120,
        };
      case "large":
        return {
          width: 200,
          height: 200,
          imageHeight: 200,
        };
      case "collection":
        return {
          width: 180,
          height: 180,
          imageHeight: 180,
        };
      default:
        return {
          width: 180,
          height: 180,
          imageHeight: 180,
        };
    }
  };

  const dimensions = getDimensions();

  // Column layout for all variants
  return (
    <Container>
      <BaseCard
        variant="vertical"
        style={{
          width: dimensions.width,
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
          height={dimensions.imageHeight}
        >
          <PropertyImageContainer
            imageUrl={imageUrl}
            images={displayData.propertyData?.images || images}
            variant={variant === "large" ? "large" : "small"}
            containerStyle={{
              borderRadius: radius.lg,
              aspectRatio: 1, // 1:1 aspect ratio
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
                variant={variant === "large" ? "large" : "small"}
                onShowCollections={handleShowCollections}
                onCollectionToggle={handleCollectionToggle}
              />
            )}
          </PropertyImageContainer>
        </Container>

        {/* Content Container */}
        <Container paddingTop="xs">
          {/* Property Type and Location */}
          <Container>
            <Text
              variant={variant === "large" ? "body" : "caption"}
              weight="medium"
              size="sm"
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
                size="xs"
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
              variant={variant === "large" ? "body2" : "caption"}
              weight="semibold"
              color={theme.text.primary}
            >
              {`${formatPrice(price, currency)}/night`}
            </Text>
            <RatingDisplay
              rating={rating || 0}
              reviewCount={reviewCount || 0}
              variant={variant === "large" ? "large" : "small"}
              iconSize={variant === "large" ? 12 : 10}
              ratingStyle={{
                fontSize: fontSize.xs,
                color: theme.text.primary,
              }}
              reviewCountStyle={{
                fontSize: fontSize.xs,
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
