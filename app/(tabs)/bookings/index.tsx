/**
 * Bookings screen for the Hoy application
 * Shows user's bookings, upcoming trips and history in an Airbnb-like layout
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../src/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { useUserBookings } from "../../../src/hooks/useBookings";
import { format } from "date-fns";
import { fontSize } from "../../../src/constants/typography";
import { spacing } from "../../../src/constants/spacing";
import { radius } from "../../../src/constants/radius";

// Define booking statuses for display purposes
type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";

// Type definition for a booking
// interface Property {
//   _id: string;
//   title?: string;
//   name?: string;
//   city: string;
//   country: string;
//   images?: string[];
// }

// interface Booking {
//   _id: string;
//   property: Property;
//   bookingStatus: BookingStatus;
//   checkIn: string;
//   checkOut: string;
//   totalPrice: number;
// }

const BookingsScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  // Get all bookings (we'll filter them client-side for more flexibility)
  const { data = [], isLoading, refetch, isRefetching } = useUserBookings();

  const allBookings = data as any[];

  // Refresh control handler
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Separate bookings into upcoming and past
  const upcomingBookings = allBookings.filter(
    (booking) =>
      (booking.bookingStatus === "confirmed" ||
        booking.bookingStatus === "pending") &&
      new Date(booking.checkIn) >= new Date()
  );

  const pastBookings = allBookings.filter(
    (booking) =>
      booking.bookingStatus === "completed" &&
      new Date(booking.checkOut) < new Date()
  );

  // Navigate to booking details
  const navigateToBookingDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`);
  };
  // Navigate to property details
  const navigateToProperty = (propertyId: string, property: any) => {
    router.push({
      pathname: "/(screens)/PropertyModalScreen",
      params: { property: JSON.stringify(property) },
    });
  };

  // Format date to display
  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };

  // Get status color
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return theme.colors.success[500];
      case "pending":
        return theme.colors.warning[500];
      case "completed":
        return theme.colors.primary[500];
      default:
        return theme.colors.gray[500];
    }
  };

  // Get status text
  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return t("booking.confirmed");
      case "pending":
        return t("booking.pending");
      case "completed":
        return t("booking.completed");
      default:
        return status;
    }
  };
  // Render a booking item
  const renderBookingItem = (booking: any, isUpcoming: boolean) => {
    const property = booking.property || {};
    const checkIn = formatBookingDate(booking.checkIn);
    const checkOut = formatBookingDate(booking.checkOut);

    return (
      <TouchableOpacity
        style={[
          styles.bookingCard,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
          },
        ]}
        onPress={() => navigateToBookingDetails(booking._id)}
      >
        {/* Property Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={() => navigateToProperty(property._id, property)}
        >
          <Image
            source={
              property.images && property.images.length > 0
                ? { uri: property.images[0] }
                : require("../../../src/assets/placeholder-property.png")
            }
            style={styles.propertyImage}
          />

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(booking.bookingStatus),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(booking.bookingStatus)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Booking Details */}
        <View style={styles.detailsContainer}>
          <Text
            style={[
              styles.propertyName,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {property.title || property.name || "Property"}
          </Text>

          <Text
            style={[
              styles.locationText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {property.city}, {property.country}
          </Text>

          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text
                style={[
                  styles.dateLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.checkIn")}
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {checkIn}
              </Text>
            </View>

            <View style={styles.dateDivider}>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
              />
            </View>

            <View style={styles.dateItem}>
              <Text
                style={[
                  styles.dateLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("booking.checkOut")}
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {checkOut}
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.totalLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("booking.total")}
            </Text>
            <Text
              style={[
                styles.totalValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              ${booking.totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = (isUpcoming: boolean) => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text
            style={[
              styles.emptyStateText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("booking.loading")}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons
          name="calendar-outline"
          size={64}
          color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
        />
        <Text
          style={[
            styles.emptyStateTitle,
            { color: isDark ? theme.colors.gray[300] : theme.colors.gray[700] },
          ]}
        >
          {isUpcoming ? t("booking.noUpcoming") : t("booking.noPast")}
        </Text>
        <Text
          style={[
            styles.emptyStateText,
            { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
          ]}
        >
          {isUpcoming ? t("booking.noUpcomingDesc") : t("booking.noPastDesc")}
        </Text>

        {!isUpcoming && (
          <TouchableOpacity
            style={[
              styles.exploreButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Text style={styles.exploreButtonText}>{t("booking.explore")}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // If not logged in, show auth prompt
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[100],
            paddingTop: insets.top,
          },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={styles.authPromptContainer}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={isDark ? theme.colors.gray[600] : theme.colors.gray[400]}
          />

          <Text
            style={[
              styles.authPromptTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.signInRequired")}
          </Text>

          <Text
            style={[
              styles.authPromptText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("booking.signInToViewBookings")}
          </Text>

          <TouchableOpacity
            style={[
              styles.signInButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={() => router.push("/(modals)/AuthModal")}
          >
            <Text style={styles.signInButtonText}>{t("booking.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("booking.myBookings")}
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={isDark ? theme.white : theme.colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Upcoming Bookings Section */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.upcoming")}
          </Text>

          {upcomingBookings.length > 0
            ? upcomingBookings.map((booking) => (
                <View key={booking._id}>
                  {renderBookingItem(booking, true)}
                </View>
              ))
            : renderEmptyState(true)}
        </View>

        {/* Past Bookings Section */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("booking.past")}
          </Text>

          {pastBookings.length > 0
            ? pastBookings.map((booking) => (
                <View key={booking._id}>
                  {renderBookingItem(booking, false)}
                </View>
              ))
            : renderEmptyState(false)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  bookingCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  statusText: {
    color: "white",
    fontSize: fontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  detailsContainer: {
    padding: spacing.md,
  },
  propertyName: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  dateContainer: {
    flexDirection: "row",
    marginVertical: spacing.sm,
    alignItems: "center",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  dateDivider: {
    paddingHorizontal: spacing.sm,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.sm,
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    textAlign: "center",
    maxWidth: "80%",
  },
  exploreButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  exploreButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  authPromptTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  authPromptText: {
    fontSize: fontSize.md,
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: spacing.lg,
  },
  signInButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  signInButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});

export default BookingsScreen;
