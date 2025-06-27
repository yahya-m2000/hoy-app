/**
 * Past Bookings Screen
 * Shows all completed and cancelled bookings with full details
 */

import React, { useCallback } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

// Context
import { useTheme } from "@shared/hooks/useTheme";
import { useAuth } from "@shared/context";

// Hooks
import { useUserBookings } from "@shared/hooks";

// Base Components
import { Container, Text, Button, Header } from "@shared/components/base";
import { EmptyState, LoadingSpinner } from "@shared/components/common";

// Module Components
import { BookingsSection, type PopulatedBooking } from "@modules/booking";

const PastBookingsScreen = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  // Get all bookings
  const { data, isLoading, refetch, isRefetching, error } = useUserBookings();

  // Transform and filter past bookings
  const allBookings = React.useMemo(() => {
    if (isLoading) return [];
    if (error) return [];
    if (!Array.isArray(data)) return [];

    return (data as any[]).map((booking): PopulatedBooking => {
      const property =
        typeof booking.propertyId === "object" && booking.propertyId
          ? booking.propertyId
          : booking.property || {};

      return {
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
        property: property,
        user: booking.user,
      };
    });
  }, [data, isLoading, error]);

  // Filter only past bookings
  const pastBookings = allBookings.filter(
    (booking) =>
      booking.bookingStatus === "completed" ||
      booking.bookingStatus === "cancelled" ||
      (new Date(booking.checkOut) < new Date() &&
        booking.bookingStatus !== "in-progress")
  );

  // Refresh control handler
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Go back to main bookings
  const handleGoBack = () => {
    router.back();
  };

  // Show loading state
  if (isLoading) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header
          title="Past Bookings"
          leftIcon="arrow-back"
          onLeftPress={handleGoBack}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              Loading your past bookings...
            </Text>
          </Container>
        </Container>
      </Container>
    );
  }

  // If not logged in, show auth prompt
  if (!isAuthenticated) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header
          title="Past Bookings"
          leftIcon="arrow-back"
          onLeftPress={handleGoBack}
        />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="calendar-outline"
            title="Log in to view your bookings"
            message="Sign in to see your past trips"
            action={{
              label: "Log In",
              onPress: () => router.push("/auth/login"),
            }}
          />
        </Container>
      </Container>
    );
  }

  // Show empty state if no past bookings
  if (!isLoading && pastBookings.length === 0) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header
          title="Past Bookings"
          leftIcon="arrow-back"
          onLeftPress={handleGoBack}
        />
        <StatusBar style={isDark ? "light" : "dark"} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="time-outline"
            title="No past bookings"
            message="Your completed and cancelled trips will appear here"
            action={{
              label: "Explore Properties",
              onPress: () => router.push("/(tabs)/traveler/search"),
            }}
          />
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title="Past Bookings"
        leftIcon="arrow-back"
        onLeftPress={handleGoBack}
      />
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

      {/* Past Bookings Content */}
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
          {/* Past Bookings Section */}
          <BookingsSection
            title={`${pastBookings.length} Past ${
              pastBookings.length === 1 ? "Trip" : "Trips"
            }`}
            bookings={pastBookings}
            isUpcoming={false}
            isLoading={isLoading}
          />
        </ScrollView>
      </Container>
    </Container>
  );
};

export default PastBookingsScreen;
