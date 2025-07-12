/**
 * Past Bookings Screen
 * Shows all completed and cancelled bookings
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

// Components
import {
  Container,
  LoadingSpinner,
  EmptyState,
  Text,
  Header,
  Button,
  Screen,
} from "@shared/components";

import { BookingsSection } from "@features/booking/components/Sections";

export default function PastBookingsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Fetch all bookings
  const { data, isLoading, error, refetch, isRefetching } = useUserBookings();

  // Transform and filter data
  const allBookings = React.useMemo(() => {
    if (!data || isLoading || error) return [];

    return data.map((booking: any) => {
      const property = booking.propertyId;
      return {
        _id: booking._id,
        propertyId: booking.propertyId,
        unitId: booking.unitId,
        guestId: booking.guestId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        guests: booking.guests,
        totalAmount: booking.totalPrice || booking.totalAmount,
        totalPrice: booking.totalPrice || booking.totalAmount,
        specialRequests: booking.specialRequests,
        status: booking.status,
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

  // Filter for past bookings only
  const pastBookings = React.useMemo(() => {
    return allBookings.filter(
      (booking) =>
        booking.status === "completed" ||
        booking.status === "cancelled" ||
        (new Date(booking.checkOut) < new Date() &&
          booking.status !== "in_progress")
    );
  }, [allBookings]);

  // Refresh control handler
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Show loading state
  if (isLoading) {
    return (
      <Screen
        header={{
          title: t("bookings.pastBookings"),
          left: {
            icon: "arrow-back",
            onPress: () => router.back(),
          },
          showDivider: false,
        }}
      >
        <Container flex={1} justifyContent="center" alignItems="center">
          <LoadingSpinner size="large" />
          <Container marginTop="md">
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: "center" }}
            >
              {t("bookings.loadingPastBookings")}
            </Text>
          </Container>
        </Container>
      </Screen>
    );
  }

  // If not logged in, show auth prompt
  if (!isAuthenticated) {
    return (
      <Screen
        header={{
          title: t("bookings.pastBookings"),
          left: {
            icon: "arrow-back",
            onPress: () => router.back(),
          },
          showDivider: false,
        }}
      >
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="calendar-outline"
            title={t("bookings.signInToViewBookings")}
            message={t("bookings.signInToViewPastBookings")}
            action={{
              label: t("auth.signIn"),
              onPress: () => router.push("/auth/login"),
            }}
          />
        </Container>
      </Screen>
    );
  }

  // Show empty state if no past bookings
  if (!isLoading && pastBookings.length === 0) {
    return (
      <Screen
        header={{
          title: t("bookings.pastBookings"),
          left: {
            icon: "arrow-back",
            onPress: () => router.back(),
          },
          showDivider: false,
        }}
      >
        <Container flex={1} justifyContent="center" alignItems="center">
          <EmptyState
            icon="time-outline"
            title={t("bookings.noPastBookings")}
            message={t("bookings.noPastBookingsMessage")}
          />
        </Container>
      </Screen>
    );
  }

  return (
    <Screen
      header={{
        title: t("bookings.pastBookings"),
        left: {
          icon: "arrow-back",
          onPress: () => router.back(),
        },
        showDivider: false,
      }}
    >
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
              title={t("bookings.retry")}
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
            title={t("bookings.past")}
            bookings={pastBookings}
            isUpcoming={false}
            isLoading={isLoading}
          />
        </ScrollView>
      </Container>
    </Screen>
  );
}
