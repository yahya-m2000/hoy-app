/**
 * BookingCard Component
 * Displays individual booking item with property details, dates, and status
 * Styled to match PropertyCard design
 */

// React and React Native
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

// External Libraries
import { format } from "date-fns";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// Shared Context and Hooks
import { useTheme } from "@shared/context";

// Shared Constants
import { radius, fontSize, spacing } from "@shared/constants";

// Types
import type { PopulatedBooking } from "@shared/types/booking";

interface BookingCardProps {
  booking: PopulatedBooking;
  isUpcoming: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, isUpcoming }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Format date to display
  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  // Get status colors and background
  const getStatusColors = (status: PopulatedBooking["bookingStatus"]) => {
    switch (status) {
      case "confirmed":
        return {
          textColor: "#059669", // green-600
          backgroundColor: "#dcfce7", // green-100
          darkBackgroundColor: "#064e3b", // green-900
        };
      case "pending":
        return {
          textColor: "#d97706", // amber-600
          backgroundColor: "#fef3c7", // amber-100
          darkBackgroundColor: "#92400e", // amber-800
        };
      case "completed":
        return {
          textColor: "#2563eb", // blue-600
          backgroundColor: "#dbeafe", // blue-100
          darkBackgroundColor: "#1e3a8a", // blue-900
        };
      case "cancelled":
        return {
          textColor: "#dc2626", // red-600
          backgroundColor: "#fee2e2", // red-100
          darkBackgroundColor: "#7f1d1d", // red-900
        };
      default:
        return {
          textColor: theme.colors.gray[600],
          backgroundColor: theme.colors.gray[100],
          darkBackgroundColor: theme.colors.gray[800],
        };
    }
  };

  // Get status text
  const getStatusText = (status: PopulatedBooking["bookingStatus"]) => {
    switch (status) {
      case "confirmed":
        return t("booking.confirmed") || "Confirmed";
      case "pending":
        return t("booking.pending") || "Pending";
      case "completed":
        return t("booking.completed") || "Completed";
      case "cancelled":
        return t("booking.cancelled") || "Cancelled";
      default:
        return status;
    }
  };

  // Navigate to booking details
  const navigateToBookingDetails = () => {
    router.push(`/(tabs)/traveler/bookings/${booking._id}`);
  };

  // Calculate nights
  const calculateNights = () => {
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Get the property data from the populated booking
  const property = booking.property;
  const checkIn = formatBookingDate(booking.checkIn);
  const checkOut = formatBookingDate(booking.checkOut);
  const nights = calculateNights();
  const statusColors = getStatusColors(booking.bookingStatus);

  // Helper function to get the first available image
  const getPropertyImage = () => {
    if (!property) return null;

    // Use the images array from Property type
    const images = property.images || [];

    if (images.length > 0) {
      return images[0];
    }

    return null;
  };

  // Helper function to get property title using Property type structure
  const getPropertyTitle = () => {
    if (!property) return "Property";
    // Property type uses 'name' and 'title' fields
    return property.name || property.title || "Property";
  };

  // Format location display using Property type address structure
  const getLocationDisplay = () => {
    if (!property) return "Location not specified";

    // Use the address structure from Property type
    if (property.address?.city && property.address?.country) {
      return property.address.state
        ? `${property.address.city}, ${property.address.state}, ${property.address.country}`
        : `${property.address.city}, ${property.address.country}`;
    }

    // Fallback if only city or country is available
    if (property.address?.city) {
      return property.address.city;
    } else if (property.address?.country) {
      return property.address.country;
    } else {
      return "Location not specified";
    }
  };

  const locationDisplay = getLocationDisplay();
  const propertyImage = property?.images?.[0];
  const propertyTitle = getPropertyTitle();

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={navigateToBookingDetails}
      accessibilityRole="button"
      accessibilityLabel={`Booking for ${propertyTitle} in ${locationDisplay}`}
    >
      {/* Image Container with Status Badge */}{" "}
      <View style={styles.imageContainer}>
        {propertyImage ? (
          <Image
            source={{ uri: propertyImage }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isDark
                ? statusColors.darkBackgroundColor
                : statusColors.backgroundColor,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColors.textColor }]}>
            {getStatusText(booking.bookingStatus)}
          </Text>
        </View>
      </View>
      {/* Property Details */}
      <View style={styles.detailsContainer}>
        {/* Location and Status Row */}
        <View style={styles.locationRow}>
          <Text
            style={[
              styles.location,
              {
                color: isDark ? theme.colors.gray[50] : theme.colors.gray[900],
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {locationDisplay}
          </Text>
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
          {propertyTitle}
        </Text>

        {/* Dates */}
        <Text
          style={[
            styles.dates,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
            },
          ]}
        >
          {checkIn} - {checkOut}
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
            {formatPrice(booking.totalPrice)}{" "}
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
              total
            </Text>
          </Text>

          {nights > 1 && (
            <Text
              style={[
                styles.nightsText,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              · {nights} {nights === 1 ? "night" : "nights"}
            </Text>
          )}
        </View>
      </View>
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
    aspectRatio: 1, // 1:1 ratio for square image like PropertyCard
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },
  placeholderImage: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: fontSize.sm,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // ===== CONTENT SECTION =====
  detailsContainer: {
    // Match PropertyCard structure
  },

  // ===== LOCATION ROW =====
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: "600", // semibold equivalent
    flex: 1,
    marginRight: spacing.sm,
  },

  // ===== PROPERTY TITLE =====
  title: {
    fontSize: fontSize.sm,
    fontWeight: "400", // normal
    lineHeight: fontSize.sm * 1.2,
  },

  // ===== DATES =====
  dates: {
    fontSize: fontSize.sm,
    fontWeight: "400",
    marginBottom: spacing.xs,
  },

  // ===== PRICE SECTION =====
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: fontSize.sm,
    fontWeight: "600", // semibold equivalent
  },
  perNight: {
    fontSize: fontSize.sm,
    fontWeight: "400", // normal
  },
  nightsText: {
    fontSize: fontSize.sm,
    fontWeight: "400",
    marginLeft: spacing.xs,
  },
});

export default BookingCard;
