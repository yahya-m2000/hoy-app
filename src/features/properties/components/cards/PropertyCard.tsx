/**
 * PropertyCard component
 * Displays property as a card with image on top and content below
 * Styled to match BookingCard design with responsive sizing
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";
import { useCalendarDateSelection } from "@features/calendar/context/CalendarContext";
import { useWishlistState } from "@features/properties/context/PropertyContext";

// Shared Components
import { Text, BookingStatusBadge, Icon } from "@shared/components";
import { PropertyImageContainer } from "../details";
import RatingDisplay from "../shared/RatingDisplay";
import WishlistButton from "../shared/WishlistButton";
import { useTranslation } from "react-i18next";

// Shared Constants
import { radius, fontSize, spacing } from "@core/design";
import {
  formatPrice,
  calculateStayDetails,
  formatBookingDate,
  calculateBookingNights,
} from "src/features/properties/utils/propertyUtils";

// Types
import type { PropertyCardProps as BasePropertyCardProps } from "@core/types/property.types";
import CollectionsModal from "src/features/properties/modals/collections/CollectionsModal";
import { t } from "i18next";

interface HostPropertyCardProps {
  isHost?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  isDeleting?: boolean;
  hostStatus?: "active" | "inactive" | "draft";
}

type CombinedPropertyCardProps = BasePropertyCardProps & HostPropertyCardProps;

export const PropertyCard: React.FC<CombinedPropertyCardProps> = ({
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
  isHost = false,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting = false,
  hostStatus,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  const { searchDates } = useCalendarDateSelection();
  const {
    isPropertyWishlisted,
    showCollectionsModalAction,
    hideCollectionsModal,
    showCollectionsModal: showCollectionsModalState,
  } = useWishlistState();
  const { t } = useTranslation();

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
      return `${formattedType} ${t("features.property.details.common.general.in")} ${cityName}`;
    }
    return formattedType;
  };

  const getHostTypeDisplay = () => {
    if (!hostType) return t("features.property.details.common.general.individualHost");

    switch (hostType.toLowerCase()) {
      case "individual":
        return t("features.property.details.common.general.individualHost");
      case "business":
        return t("features.property.details.common.general.businessHost");
      case "organization":
        return t("features.property.details.common.general.organizationHost");
      default:
        return t("features.property.details.common.general.individualHost");
    }
  };

  // Handle collections
  const handleShowCollections = useCallback(() => {
    console.log(
      "PropertyCard: handleShowCollections called for property:",
      _id
    );
    showCollectionsModalAction(_id);
  }, [_id, showCollectionsModalAction]);

  const handleCloseCollections = useCallback(() => {
    console.log("PropertyCard: handleCloseCollections called");
    hideCollectionsModal();
  }, [hideCollectionsModal]);

  const handleCollectionToggle = useCallback(
    (collectionId: string, isAdded: boolean) => {
      // Property toggled in collection
    },
    []
  );

  // Host status badge
  const renderHostStatus = () => {
    if (!isHost || !hostStatus) return null;
    let color = "#aaa";
    let label = hostStatus.charAt(0).toUpperCase() + hostStatus.slice(1);
    if (hostStatus === "active") color = "#22c55e";
    if (hostStatus === "inactive") color = "#f59e42";
    if (hostStatus === "draft") color = "#64748b";
    return (
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            marginRight: 6,
          }}
        />
        <Text size="xs" color={color} style={{ fontWeight: "bold" }}>
          {label}
        </Text>
      </View>
    );
  };

  // Host actions via ellipsis
  const handleHostActions = () => {
    if (isDeleting) return;
    const buttons = [
      onEdit
        ? {
            text: t("common.edit"),
            onPress: onEdit,
          }
        : undefined,
      onToggleStatus
        ? {
            text:
              hostStatus === "active"
                ? t("features.property.management.actions.deactivate")
                : t("features.property.management.actions.activate"),
            onPress: onToggleStatus,
          }
        : undefined,
      onDelete
        ? {
            text: t("features.property.management.actions.delete"),
            style: "destructive" as const,
            onPress: () => {
              Alert.alert(t("features.property.management.actions.delete"), t("features.property.management.actions.deleteConfirm"), [
                { text: t("common.cancel"), style: "cancel" as const },
                {
                  text: t("features.property.management.actions.delete"),
                  style: "destructive" as const,
                  onPress: onDelete,
                },
              ]);
            },
          }
        : undefined,
      {
        text: t("common.cancel"),
        style: "cancel" as const,
      },
    ].filter(Boolean);
    Alert.alert(t("features.property.management.general.title"), undefined, buttons as any);
  };

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
      disabled={isHost && (!onPress || isDeleting)}
    >
      {/* Ellipsis for host actions */}
      {isHost && (
        <TouchableOpacity
          style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
          onPress={handleHostActions}
          disabled={isDeleting}
        >
          <View
            style={{
              backgroundColor: theme.background,
              borderRadius: 16,
              padding: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#e11d48" />
            ) : (
              <Icon name="ellipsis-horizontal" size={22} color="#64748b" />
            )}
          </View>
        </TouchableOpacity>
      )}
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
          {!displayData.isBookingMode && !isHost && (
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
        {/* Host status badge */}
        {renderHostStatus()}
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
            {`${formatPrice(price, currency)} ${t("features.property.details.pricing.perNight")}`}
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
        {/* Host status badge remains */}
      </View>

      <CollectionsModal
        visible={showCollectionsModalState}
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
