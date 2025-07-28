/**
 * Bookings screen for the Hoy application in traveler mode
 * Shows user's bookings, upcoming trips and history in an Airbnb-like layout
 */

import React, { useCallback } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

// Context
import { useTheme } from "@core/hooks";
import { useAuth } from "@core/context";

// Hooks
import { useUserBookings } from "@features/booking/hooks";
import { useRouter } from "expo-router";

// Base Components
import {
  Container,
  Text,
  Button,
  Header,
  EmptyState,
  LoadingSpinner,
} from "@shared/components";

// Module Components
import { BookingsSection } from "@features/booking/components";
import { PopulatedBooking } from "@core/types/booking.types";

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
        guestId: booking.guestId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        guests: booking.guests || { adults: 1 },
        totalAmount: booking.totalAmount,
        totalPrice: booking.totalPrice || booking.totalAmount,
        specialRequests: booking.specialRequests,
        status: booking.bookingStatus || booking.status,
        bookingStatus: booking.bookingStatus || booking.status, // <-- Add this line
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        contactInfo: booking.contactInfo,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        reviewId: booking.reviewId,
        hostId: booking.hostId,
        currency: booking.currency || "USD",
        paymentMethod: booking.paymentMethod || "",
        pricing: booking.pricing || { totalPrice: booking.totalAmount },
        // Populated properties
        property: property,
        guest: booking.guest,
        host: booking.host,
      };
    });
  }, [data, isLoading, error]);

  // Refresh control handler
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Separate bookings into upcoming and past
  const upcomingBookings = allBookings.filter((booking) => {
    const isUpcomingStatus =
      booking.status === "confirmed" ||
      booking.status === "pending" ||
      booking.status === "in_progress";
    const isFutureDate = new Date(booking.checkIn) >= new Date();

    console.log(
      `📅 Booking ${booking._id}: status=${booking.status}, checkIn=${booking.checkIn}, isUpcomingStatus=${isUpcomingStatus}, isFutureDate=${isFutureDate}`
    );

    return isUpcomingStatus && isFutureDate;
  });

  const pastBookings = allBookings.filter((booking) => {
    const isPastStatus =
      booking.status === "completed" || booking.status === "cancelled";
    const isPastDate =
      new Date(booking.checkOut) < new Date() &&
      booking.status !== "in_progress";

    console.log(
      `📅 Booking ${booking._id}: status=${booking.status}, checkOut=${booking.checkOut}, isPastStatus=${isPastStatus}, isPastDate=${isPastDate}`
    );

    return isPastStatus || isPastDate;
  });

  // Show loading state
  if (isLoading) {
    return (
      <Container flex={1} backgroundColor="background">
        <Header title={t("features.booking.management.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              {t("features.booking.states.loadingBookings")}
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
        <Header title={t("features.booking.management.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="calendar-outline"
            title={t("features.booking.states.signInToViewBookings")}
            message={t("features.booking.states.signInToViewBookingsMessage")}
            action={{
              label: t("features.auth.forms.signIn"),
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
        <Header title={t("features.booking.management.title")} />
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="heart-outline"
            title={t("features.booking.states.noBookingsFound")}
            message={t("features.booking.states.noBookingsMessage")}
          />
        </Container>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header title={t("common.tabs.bookings")} />
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
              title={t("features.booking.actions.retry")}
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
            title={t("features.booking.management.upcoming")}
            bookings={upcomingBookings}
            isUpcoming={true}
            isLoading={isLoading}
          />

          {/* View All Past Bookings Button */}
          {pastBookings.length > 3 && (
            <Container marginHorizontal="md" marginVertical="md">
              <Button
                title={`${t(
                  "features.booking.management.viewAllPastBookings"
                )} (${pastBookings.length})`}
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
                  {t("features.booking.management.seeCompleteHistory")}
                </Text>
              </Container>
            </Container>
          )}

          {/* Past Bookings Section (Limited) */}
          <BookingsSection
            title={t("features.booking.management.past")}
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
