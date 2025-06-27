/**
 * Bookings screen for the Hoy application in traveler mode
 * Shows user's bookings, upcoming trips and history in an Airbnb-like layout
 */

import React, { useCallback } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

// Context
import { useTheme } from "@shared/hooks/useTheme";
import { useAuth } from "@shared/context";

// Hooks
import { useUserBookings } from "@shared/hooks";
import { useRouter } from "expo-router";

// Base Components
import { Container, Text, Button, Header } from "@shared/components/base";
import { EmptyState, LoadingSpinner } from "@shared/components/common";

// Module Components
import { BookingsSection, type PopulatedBooking } from "@modules/booking";

const BookingsScreen = () => {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

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
        booking.bookingStatus === "pending" ||
        booking.bookingStatus === "in-progress") &&
      new Date(booking.checkIn) >= new Date()
  );

  const pastBookings = allBookings.filter(
    (booking) =>
      booking.bookingStatus === "completed" ||
      booking.bookingStatus === "cancelled" ||
      (new Date(booking.checkOut) < new Date() &&
        booking.bookingStatus !== "in-progress")
  );

  // Show loading state
  if (isLoading) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Bookings" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              Loading your bookings...
            </Text>
          </Container>
        </Container>
      </Container>
    );
  }

  // If not logged in, show auth prompt
  if (!isAuthenticated) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Bookings" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="calendar-outline"
            title="Log in to view your bookings"
            message="Sign in to see your upcoming and past trips"
            action={{
              label: "Log In",
              onPress: () => router.push("/auth/login"),
            }}
          />
        </Container>
      </Container>
    );
  }

  // Show empty state if no bookings
  if (!isLoading && data?.length === 0) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title="Bookings" />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title="No bookings found"
            message="Start exploring to find and save properties to your bookings"
          />
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header title="Bookings" />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Error Banner */}
      {error && (
        <Container
          marginHorizontal="md"
          marginTop="md"
          padding="md"
          backgroundColor="error"
          borderRadius="md"
          style={{ opacity: 0.1 }}
        >
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Container flex={1}>
              <Text variant="body" color="error">
                {error instanceof Error ? error.message : String(error)}
              </Text>
            </Container>
            <Button
              title="Retry"
              variant="ghost"
              size="small"
              onPress={onRefresh}
            />
          </Container>
        </Container>
      )}

      {/* Bookings Content */}
      <Container flex={1}>
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        >
          {/* Upcoming Bookings Section */}
          <BookingsSection
            title={t("booking.upcoming")}
            bookings={upcomingBookings}
            isUpcoming={true}
            isLoading={isLoading}
          />

          {/* View All Past Bookings Button */}
          {pastBookings.length > 3 && (
            <Container marginHorizontal="md" marginVertical="md">
              <Button
                title={`View All Past Bookings (${pastBookings.length})`}
                onPress={() => router.push("/(tabs)/traveler/bookings/past")}
                variant="outline"
                size="medium"
                style={{
                  backgroundColor: isDark
                    ? theme.colors.gray[800]
                    : theme.colors.gray[100],
                  borderColor: isDark
                    ? theme.colors.gray[600]
                    : theme.colors.gray[300],
                }}
              />
              <Container marginTop="xs">
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textAlign: "center" }}
                >
                  See your complete booking history
                </Text>
              </Container>
            </Container>
          )}

          {/* Past Bookings Section (Limited) */}
          <BookingsSection
            title={t("booking.past")}
            bookings={pastBookings.slice(0, 3)} // Show only first 3 past bookings
            isUpcoming={false}
            isLoading={isLoading}
          />
        </ScrollView>
      </Container>
    </Container>
  );
};

export default BookingsScreen;
