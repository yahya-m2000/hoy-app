/**
 * Bookings screen for the Hoy application in traveler mode
 * Shows user's bookings, upcoming trips and history in an Airbnb-like layout
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

// Context
import { useTheme, useAuth } from "@shared/context";

// Hooks
import { useUserBookings, useCurrentUser } from "@shared/hooks";
import { useRouter } from "expo-router";

// Components
import { EmptyState } from "@shared/components/common";
import { BookingsSection, type PopulatedBooking } from "@modules/booking";

// Constants
import { spacing, fontSize, fontWeight } from "@shared/constants";

const BookingsScreen = () => {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { data: user } = useCurrentUser();

  // Get all bookings (we'll filter them client-side for more flexibility)
  const { data, isLoading, refetch, isRefetching, error } = useUserBookings();

  // Log when data changes
  React.useEffect(() => {
    console.log("📋 Bookings data updated:", {
      data: data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      isLoading,
      error: error?.message || error,
    });
  }, [data, isLoading, error]);
  // Safely handle the data and transform to PopulatedBooking format
  const allBookings = React.useMemo(() => {
    if (isLoading) return [];
    if (error) return [];
    if (!Array.isArray(data)) return []; // Transform raw booking data to PopulatedBooking format
    return (data as any[]).map((booking): PopulatedBooking => {
      // Handle both populated and non-populated propertyId
      const property =
        typeof booking.propertyId === "object" && booking.propertyId
          ? booking.propertyId
          : booking.property || {};

      return {
        // Required Booking properties
        _id: booking._id,
        propertyId: booking.propertyId,
        unitId: booking.unitId,
        userId: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        guests: booking.guests || { adults: 1 },
        totalPrice: booking.totalPrice,
        specialRequests: booking.specialRequests,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        contactInfo: booking.contactInfo,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        reviewId: booking.reviewId,
        // Populated properties
        property: property,
        user: booking.user,
      };
    });
  }, [data, isLoading, error]);

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

  // Show loading state
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />{" "}
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          Loading your bookings...
        </Text>
      </View>
    );
  }

  // If not logged in, show auth prompt
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <EmptyState
          icon="calendar-outline"
          title="Log in to view your bookings"
          message="Sign in to see your upcoming and past trips"
          action={{
            label: "Log In",
            onPress: () => router.push("/auth/login"),
          }}
        />
      </View>
    );
  }

  // Show empty state if no collections
  if (!isLoading && data?.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <EmptyState
          icon="heart-outline"
          title="No bookings found"
          message="Start exploring to find and save properties to your bookings"
        />
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
          paddingTop: insets.top + spacing.xxl,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.error + "20" },
          ]}
        >
          {" "}
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error instanceof Error ? error.message : String(error)}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.retryText, { color: theme.primary }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={isDark ? theme.white : theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Upcoming Bookings Section */}
        <BookingsSection
          title={t("booking.upcoming")}
          bookings={upcomingBookings}
          isUpcoming={true}
          isLoading={isLoading}
        />

        {/* Past Bookings Section */}
        <BookingsSection
          title={t("booking.past")}
          bookings={pastBookings}
          isUpcoming={false}
          isLoading={isLoading}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookingsScreen;
