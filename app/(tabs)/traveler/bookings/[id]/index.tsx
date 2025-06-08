/**
 * Dynamic booking details screen
 * Shows detailed information about a specific booking
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

// Context
import { useTheme } from "@shared/context";

// Components
// import CustomHeader from "@common-components/CustomHeader";
import BookingStatus from "src/modules/booking/components/Feedback/BookingStatus";

// Hooks
import { useBookingById } from "@shared/hooks";

// Constants
import { fontSize, fontWeight, spacing, radius } from "@shared/constants";

// Types (keeping interface in case it's needed for future type checking)

export default function BookingDetailsScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  // Get booking data
  const { data: booking, isLoading, error, refetch } = useBookingById(id);

  const handleCancelBooking = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => {
            // TODO: Implement booking cancellation
            console.log("Cancel booking:", id);
          },
        },
      ]
    );
  };
  const handleContactHost = () => {
    // TODO: Implement contact host functionality
    console.log("Contact host");
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.white,
          },
        ]}
      >
        {/* <CustomHeader title="Booking Details" onBackPress={handleBackPress} /> */}
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text
              style={[
                styles.loadingText,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              Loading booking details...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.white,
          },
        ]}
      >
        {/* <CustomHeader title="Booking Details" onBackPress={handleBackPress} /> */}
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          {" "}
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={64}
              color={theme.colors.errorPalette[500] || "#ef4444"}
            />
            <Text
              style={[
                styles.errorTitle,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              Booking Not Found
            </Text>
            <Text
              style={[
                styles.errorText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {error?.message ||
                "The booking you're looking for doesn't exist or has been removed."}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => refetch()}
            >
              <Text style={[styles.retryButtonText, { color: theme.white }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  const property =
    typeof booking.propertyId === "object" ? (booking.propertyId as any) : null;

  if (!property) {
    // Handle case where property data is not populated
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[900]
              : theme.white,
          },
        ]}
      >
        {/* <CustomHeader title="Booking Details" onBackPress={handleBackPress} /> */}
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          {" "}
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle"
              size={64}
              color={theme.colors.errorPalette[500] || "#ef4444"}
            />
            <Text
              style={[
                styles.errorTitle,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              Property Data Unavailable
            </Text>
            <Text
              style={[
                styles.errorText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              The property information for this booking is not available.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const propertyImage = property.images?.[0] || property.photos?.[0];
  const totalGuests = booking.guests.adults + (booking.guests.children || 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.grayPalette[900] : theme.white,
        },
      ]}
    >
      {" "}
      <ScrollView
        style={[styles.content, { paddingTop: insets.top + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {" "}
        {/* Booking Card Section - Enhanced Presentable Design */}
        <View
          style={[
            styles.bookingCardContainer,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[800]
                : theme.white,
              borderColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[200],
              // borderWidth: 1,
            },
          ]}
        >
          {/* Image Container with Status Badge */}
          <View style={styles.imageContainer}>
            {propertyImage ? (
              <Image
                source={{ uri: propertyImage }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.image,
                  styles.placeholderImage,
                  {
                    backgroundColor: isDark
                      ? theme.colors.grayPalette[700]
                      : theme.colors.grayPalette[100],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.placeholderText,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  No Image
                </Text>
              </View>
            )}{" "}
            {/* Status Badge */}
            <BookingStatus
              status={booking.bookingStatus as any}
              size="medium"
              style={styles.statusBadgePosition}
            />
          </View>

          {/* Property Details */}
          <View style={styles.detailsContainer}>
            {/* Location */}
            <View style={styles.locationRow}>
              <Text
                style={[
                  styles.location,
                  {
                    color: isDark ? theme.white : theme.black,
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {property.address.city}, {property.address.state}
              </Text>
            </View>

            {/* Property Title */}
            <Text
              style={[
                styles.title,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[600],
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {property.name || property.title || "Property"}
            </Text>

            {/* Dates */}
            <Text
              style={[
                styles.dates,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[500],
                },
              ]}
            >
              {format(new Date(booking.checkIn), "MMM dd, yyyy")} -{" "}
              {format(new Date(booking.checkOut), "MMM dd, yyyy")}
            </Text>

            {/* Price Row */}
            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  { color: isDark ? theme.white : theme.black },
                ]}
              >
                ${booking.totalPrice}{" "}
                <Text
                  style={[
                    styles.perNight,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  total
                </Text>
              </Text>{" "}
              <Text
                style={[
                  styles.nightsText,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[300]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                · {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
        {/* Booking Details Section */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[800]
                : theme.white,
              borderColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[300],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.black },
            ]}
          >
            Booking Details
          </Text>

          {/* Check-in / Check-out */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="log-in"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  Check-in
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                </Text>
                <Text
                  style={[
                    styles.detailSubValue,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[500],
                    },
                  ]}
                >
                  After 3:00 PM
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="log-out"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  Check-out
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                </Text>
                <Text
                  style={[
                    styles.detailSubValue,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[500],
                    },
                  ]}
                >
                  Before 11:00 AM
                </Text>
              </View>
            </View>
          </View>

          {/* Guests and Rooms */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="people"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  Guests
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  {booking.guests.adults} Adult
                  {booking.guests.adults !== 1 ? "s" : ""}
                </Text>
                {(booking.guests.children || 0) > 0 && (
                  <Text
                    style={[
                      styles.detailSubValue,
                      {
                        color: isDark
                          ? theme.colors.grayPalette[400]
                          : theme.colors.grayPalette[500],
                      },
                    ]}
                  >
                    {booking.guests.children || 0} Child
                    {(booking.guests.children || 0) !== 1 ? "ren" : ""}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="bed"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  {property.bedrooms ? "Bedrooms" : "Rooms"}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  {property.bedrooms || property.rooms || 1}
                </Text>
                {property.bathrooms && (
                  <Text
                    style={[
                      styles.detailSubValue,
                      {
                        color: isDark
                          ? theme.colors.grayPalette[400]
                          : theme.colors.grayPalette[500],
                      },
                    ]}
                  >
                    {property.bathrooms} Bath
                    {property.bathrooms !== 1 ? "s" : ""}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Booking ID and Duration */}
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons
                name="receipt"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  Booking ID
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  #{booking._id?.slice(-8).toUpperCase() || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons
                name="calendar"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <View style={styles.detailContent}>
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[400]
                        : theme.colors.grayPalette[600],
                    },
                  ]}
                >
                  Duration
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? theme.white : theme.black },
                  ]}
                >
                  {Math.ceil(
                    (new Date(booking.checkOut).getTime() -
                      new Date(booking.checkIn).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  Night
                  {Math.ceil(
                    (new Date(booking.checkOut).getTime() -
                      new Date(booking.checkIn).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) !== 1
                    ? "s"
                    : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* Contact Information */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[800]
                : theme.white,
              borderColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[300],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.black },
            ]}
          >
            Contact Information
          </Text>
          <View style={styles.contactInfo}>
            <Ionicons
              name="person"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
            <Text
              style={[
                styles.contactText,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              {booking.contactInfo?.name || "N/A"}
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Ionicons
              name="mail"
              size={20}
              color={
                isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600]
              }
            />
            <Text
              style={[
                styles.contactText,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              {booking.contactInfo?.email || "N/A"}
            </Text>
          </View>

          {booking.contactInfo?.phone && (
            <View style={styles.contactInfo}>
              <Ionicons
                name="call"
                size={20}
                color={
                  isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600]
                }
              />
              <Text
                style={[
                  styles.contactText,
                  { color: isDark ? theme.white : theme.black },
                ]}
              >
                {booking.contactInfo.phone}
              </Text>
            </View>
          )}
        </View>{" "}
        {/* Special Requests */}
        {booking.specialRequests && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.white,
                borderColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[300],
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              Special Requests
            </Text>
            <Text
              style={[
                styles.specialRequests,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {booking.specialRequests}
            </Text>
          </View>
        )}
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              {
                borderColor: isDark
                  ? theme.colors.grayPalette[600]
                  : theme.colors.grayPalette[300],
              },
            ]}
            onPress={handleContactHost}
          >
            <Ionicons
              name="chatbubble"
              size={20}
              color={isDark ? theme.white : theme.black}
            />
            <Text
              style={[
                styles.secondaryButtonText,
                { color: isDark ? theme.white : theme.black },
              ]}
            >
              Contact Host
            </Text>
          </TouchableOpacity>{" "}
          {booking.bookingStatus.toLowerCase() === "pending" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.errorPalette[600] || "#ef4444",
                },
              ]}
              onPress={handleCancelBooking}
            >
              <Ionicons name="close" size={20} color={theme.white} />
              <Text style={[styles.cancelButtonText, { color: theme.white }]}>
                Cancel Booking
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== MAIN CONTAINER =====
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  }, // ===== BOOKING CARD SECTION - Enhanced Presentable Style =====
  bookingCardContainer: {
    margin: spacing.md,
    // padding: spacing.lg,
    // borderRadius: radius.xl,
    backgroundColor: "transparent",
  },

  // ===== LOADING AND ERROR STATES =====
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.md,
    textAlign: "center",
  },
  errorText: {
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  // ===== IMAGE SECTION =====
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 10, // More appealing aspect ratio for details view
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  statusBadgePosition: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  // ===== CONTENT SECTION =====
  detailsContainer: {
    // paddingHorizontal: spacing.sm,
    // paddingBottom: spacing.sm,
  },
  // ===== LOCATION ROW =====
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: spacing.xs,
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: "700", // bold for better hierarchy
    flex: 1,
    marginRight: spacing.sm,
  },

  // ===== PROPERTY TITLE =====
  title: {
    fontSize: fontSize.sm,
    fontWeight: "500", // medium weight
    // marginBottom: spacing.xs,
  },

  // ===== DATES =====
  dates: {
    fontSize: fontSize.sm,
    fontWeight: "400",
    marginBottom: spacing.sm,
  },
  // ===== PRICE SECTION =====
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    // justifyContent: "space-between",
    // marginTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: "700", // bold for emphasis
  },
  perNight: {
    fontSize: fontSize.md,
    fontWeight: "400", // normal
  },
  nightsText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  }, // ===== BOOKING DETAILS SECTION =====
  detailRow: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: fontSize.xs,
    fontWeight: "400",
  },

  // ===== SECTIONS =====
  section: {
    margin: spacing.md,
    marginTop: spacing.sm,
    // padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
    flex: 1,
  },
  specialRequests: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  actionButtons: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  cancelButton: {
    // backgroundColor will be set dynamically using theme.colors.errorPalette
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});
