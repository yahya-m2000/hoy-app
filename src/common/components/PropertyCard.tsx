/**
 * PropertyCard component for the Hoy application
 * Displays property information in a card layout with Airbnb-style design
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@common/context/ThemeContext";
import { useDateSelection } from "@common/context/DateSelectionContext";
import { useWishlist } from "@common/hooks/useWishlist";

import { spacing } from "@constants/spacing";
import { radius } from "@constants/radius";
import { fontSize, fontWeight } from "@constants/typography";

interface PropertyCardProps {
  _id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  onPress?: () => void;
  style?: ViewStyle;
  city?: string;
  address?: string;
  hostId?: string;
  hostName?: string;
  hostImage?: string;
  onMessagePress?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  _id,
  title,
  location,
  price,
  currency = "USD",
  imageUrl,
  images,
  rating,
  reviewCount,
  onPress,
  style,
  city,
  address,
  hostId,
  hostName,
  hostImage,
  onMessagePress,
}) => {
  const { theme, isDark } = useTheme();
  const { searchDates } = useDateSelection();
  const { toggleWishlist, isPropertyWishlisted, isToggling } = useWishlist();

  // Calculate nights and total price
  const calculateStayDetails = () => {
    let nights = 3; // Default 3 nights
    let startDate = searchDates.startDate;
    let endDate = searchDates.endDate;

    // If we have search dates, use them to calculate nights
    if (startDate && endDate) {
      nights = Math.max(
        1,
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
    }

    const totalPrice = price * nights;
    return { nights, totalPrice };
  };

  const { nights, totalPrice } = calculateStayDetails();

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine the image source
  const getImageSource = () => {
    if (images && images.length > 0 && images[0]) {
      return { uri: images[0] };
    }
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return require("../assets/placeholder-property.png");
  };

  // Format location for display
  const locationLine =
    typeof location === "string" ? location : `${city || ""}, ${address || ""}`;

  // Handle wishlist toggle
  const handleWishlistPress = (e: any) => {
    e.stopPropagation();
    toggleWishlist(_id);
  };

  const isWishlisted = isPropertyWishlisted(_id);

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Property: ${title} in ${locationLine}, ${formatPrice(
        price
      )} per night`}
    >
      {/* Image Container with Heart Button */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Heart/Wishlist Button - Always visible */}
        <TouchableOpacity
          style={[
            styles.heartButton,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.9)",
            },
          ]}
          onPress={handleWishlistPress}
          disabled={isToggling}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={18}
            color={
              isWishlisted
                ? "#ff385c"
                : isDark
                ? theme.colors.gray[50]
                : theme.colors.gray[900]
            }
          />
        </TouchableOpacity>
      </View>

      {/* Property Details */}
      <View style={styles.detailsContainer}>
        {/* Location and Rating Row */}
        <View style={styles.locationRatingRow}>
          <Text
            style={[
              styles.location,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
                flex: 1,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {locationLine}
          </Text>

          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons
                name="star"
                size={12}
                color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
              />
              <Text
                style={[
                  styles.ratingText,
                  {
                    color: isDark
                      ? theme.colors.gray[50]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {rating.toFixed(1)}
              </Text>
              {reviewCount !== undefined && reviewCount > 0 && (
                <Text
                  style={[
                    styles.reviewCount,
                    {
                      color: isDark
                        ? theme.colors.gray[300]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  ({reviewCount})
                </Text>
              )}
            </View>
          )}
        </View>
        {/* Property Title */}
        <Text
          style={[
            styles.title,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {/* Availability Text */}
        <Text
          style={[
            styles.availability,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
            },
          ]}
        >
          {searchDates.startDate && searchDates.endDate
            ? `${searchDates.startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - ${searchDates.endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : "Available year round"}
        </Text>
        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
          >
            {formatPrice(price)}{" "}
            <Text
              style={[
                styles.perNight,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              night
            </Text>
          </Text>

          {nights > 1 && (
            <Text
              style={[
                styles.totalPrice,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              · {formatPrice(totalPrice)} total
            </Text>
          )}
        </View>
      </View>
    </Pressable>
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
    aspectRatio: 1, // 1:1 ratio for square image
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },
  heartButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // ===== CONTENT SECTION =====
  detailsContainer: {
    // paddingHorizontal: spacing.xs,
  },

  // ===== LOCATION & RATING ROW =====
  locationRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.semibold) as any,
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.medium) as any,
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: 2,
  },

  // ===== PROPERTY TITLE =====
  title: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    lineHeight: fontSize.sm * 1.2,
  },

  // ===== AVAILABILITY =====
  availability: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginBottom: spacing.xs,
  },

  // ===== PRICE SECTION =====
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.semibold) as any,
  },
  perNight: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
  },
  totalPrice: {
    fontSize: fontSize.sm,
    fontWeight: String(fontWeight.normal) as any,
    marginLeft: spacing.xs,
  },

  // ===== LEGACY/UNUSED STYLES (kept for compatibility) =====
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  reviews: {
    fontSize: fontSize.xs,
  },
  datesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  datesText: {
    fontSize: fontSize.xs,
    marginLeft: 4,
    fontWeight: String(fontWeight.medium) as any,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  messageButtonText: {
    color: "white",
    fontSize: fontSize.sm,
    marginLeft: 4,
    fontWeight: String(fontWeight.medium) as any,
  },
});

export default PropertyCard;
