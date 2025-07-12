/**
 * PropertyCard component
 * Displays property as a card with image on top and content below
 * Styled to match BookingCard design with responsive sizing
 */

import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";
import { useCalendarDateSelection } from "@features/calendar/context/CalendarContext";

// Shared Components
import { Text, BookingStatusBadge } from "@shared/components";
import { PropertyImageContainer } from "../details";
import RatingDisplay from "../shared/RatingDisplay";
import WishlistButton from "../shared/WishlistButton";

// Shared Constants
import { radius, fontSize, spacing } from "@core/design";
import {
  formatPrice,
  calculateStayDetails,
  formatBookingDate,
  calculateBookingNights,
} from "src/features/properties/utils/propertyUtils";

// Types
import { PropertyCardProps } from "@core/types";
import CollectionsModal from "src/features/properties/modals/collections/CollectionsModal";
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
  const { theme, isDark } = useTheme();
  const { searchDates } = useCalendarDateSelection();

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

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Property: ${
        name || title
      }, ${getPropertyTypeDisplay()}, ${formatPrice(
        price,
        currency
      )} per night`}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <PropertyImageContainer
          imageUrl={imageUrl}
          images={displayData.propertyData?.images || images}
          containerStyle={styles.image}
          variant="small"
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
              variant="small"
              onShowCollections={handleShowCollections}
              onCollectionToggle={handleCollectionToggle}
            />
          )}
        </PropertyImageContainer>
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        {/* Property Type and Location */}
        <Text
          size="sm"
          weight="semibold"
          color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
          style={styles.propertyType}
        >
          {getPropertyTypeDisplay()}
        </Text>

        {/* Host Type */}
        {getHostTypeDisplay() && (
          <Text
            size="xs"
            weight="normal"
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
            style={styles.hostType}
          >
            {getHostTypeDisplay()}
          </Text>
        )}

        {/* Price and Rating Row */}
        <View style={styles.priceRatingRow}>
          <Text
            style={[
              styles.price,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {`${formatPrice(price, currency)} ${t("home.perNight")}`}
          </Text>
          <RatingDisplay
            rating={rating || 0}
            reviewCount={reviewCount || 0}
            variant="small"
            iconSize={10}
            ratingStyle={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
            }}
            reviewCountStyle={{
              fontSize: fontSize.sm,
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
            }}
          />
        </View>
      </View>

      <CollectionsModal
        visible={showCollectionsModal}
        onClose={handleCloseCollections}
        propertyId={_id}
        onCollectionToggle={handleCollectionToggle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ===== MAIN CONTAINER =====
  container: {
    paddingBottom: spacing.lg,
    backgroundColor: "transparent",
  },

  // ===== IMAGE SECTION =====
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1, // 1:1 ratio for square image like BookingCard
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },

  // ===== CONTENT SECTION =====
  detailsContainer: {
    // Match BookingCard structure
  },

  // ===== PROPERTY TYPE =====
  propertyType: {
    fontSize: fontSize.sm,
    fontWeight: "600", // semibold equivalent
    marginBottom: spacing.xs,
  },

  // ===== HOST TYPE =====
  hostType: {
    fontSize: fontSize.xs,
    fontWeight: "400", // normal
    marginBottom: spacing.xs,
  },

  // ===== PRICE AND RATING SECTION =====
  priceRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: "600", // semibold equivalent
  },
});

export default PropertyCard;
