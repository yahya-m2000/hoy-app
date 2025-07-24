/**
 * BookingCard Component
 * Displays individual booking item with property details, dates, and status
 * Styled to match PropertyCard design
 */

// React and React Native
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

// External Libraries
import { format } from "date-fns";
import { useRouter } from "expo-router";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";

// Shared Components
import { Text, BookingStatusBadge } from "@shared/components";
import { PropertyImageContainer } from "@features/properties/components/details";

// Shared Constants
import { radius, fontSize, spacing } from "@core/design";

// Types
import type { PopulatedBooking } from "@core/types";

interface BookingCardProps {
  booking: PopulatedBooking;
  isUpcoming: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, isUpcoming }) => {
  const { theme, isDark } = useTheme();
  const router = useRouter(); // Format date to display
  const formatBookingDate = (dateString: string | undefined) => {
    if (!dateString) return "Date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date";
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Date";
    }
  };

  // Navigate to booking details
  const navigateToBookingDetails = () => {
    router.push(`/(tabs)/traveler/bookings/${booking._id}`);
  };

  // Calculate nights
  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    try {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()))
        return 0;
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };
  // Get the property data from the populated booking
  const property = booking.property;
  const checkIn = formatBookingDate(booking.checkIn);
  const checkOut = formatBookingDate(booking.checkOut);
  const nights = calculateNights();

  // Get property data

  // Helper function to get property name using Property type structure
  const getPropertyName = () => {
    if (!property) return "Property";
    // Property type uses 'name' field, fallback to 'title' for compatibility
    return (property as any).name || property.title || "Property";
  };

  // Format location display using Property type address structure
  const getLocationDisplay = () => {
    if (!property) return "Location not specified";

    // Use the address structure from Property type
    if (property.locationString) {
      return property.locationString;
    }

    // Check if property has address object
    if ((property as any).address) {
      const address = (property as any).address;
      if (address.city && address.country) {
        return `${address.city}, ${address.country}`;
      } else if (address.city) {
        return address.city;
      } else if (address.country) {
        return address.country;
      }
    }

    // Fallback to location or "Location not specified"
    return property.location || "Location not specified";
  };
  const locationDisplay = getLocationDisplay();
  const propertyName = getPropertyName();

  // Format price with null check
  const formatPrice = (amount: number | undefined) => {
    if (!amount && amount !== 0) return "$0";
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
      accessibilityLabel={`Booking for ${propertyName || "Property"} in ${
        locationDisplay || "Location"
      }`}
    >
      {/* Image Container with Status Badge */}
      <View style={styles.imageContainer}>
        <PropertyImageContainer
          images={property?.images}
          containerStyle={styles.image}
          variant="small"
        />

        {/* Status Badge */}
        <BookingStatusBadge
          status={booking.status || "pending"}
          type="booking"
          size="small"
        />
      </View>
      {/* Property Details */}
      <View style={styles.detailsContainer}>
        {/* Property Name and Status Row */}
        <View style={styles.locationRow}>
          <Text
            size="sm"
            weight="semibold"
            color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
            style={[styles.location]}
          >
            {propertyName || "Property"}
          </Text>
        </View>
        {/* Property Location */}
        <Text
          size="sm"
          weight="normal"
          color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
          style={[styles.title]}
        >
          {locationDisplay || "Location not specified"}
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
          {checkIn || "Date"} - {checkOut || "Date"}
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
            {formatPrice(booking?.totalAmount)}
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
              {" total"}
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
