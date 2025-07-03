/**
 * Reservation Confirmation Screen
 * Shown after a reservation has been successfully created
 */

import React from "react";
import { StyleSheet } from "react-native";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import { format } from "date-fns";

// Context and hooks
import { useTheme } from "@core/hooks";

// Shared components
import { Text, Container, Button, DetailScreen } from "@shared/components";

// Icons
import { MaterialIcons } from "@expo/vector-icons";

// Types
import type { PropertyType } from "@core/types";

// Define booking interface for this confirmation screen
interface Booking {
  _id: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  paymentId?: string;
}

export default function ReservationConfirmationScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const segments = useSegments();

  // Parse booking data from route parameters
  const booking: Booking = params.booking
    ? JSON.parse(params.booking as string)
    : null;

  const property: PropertyType = params.property
    ? JSON.parse(params.property as string)
    : null;

  const paymentMethod = params.paymentMethod
    ? JSON.parse(params.paymentMethod as string)
    : null;

  // Format date for display
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return format(dateObj, "EEE, MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Calculate nights
  const calculateNights = () => {
    if (!booking?.checkIn || !booking?.checkOut) return 0;
    try {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return Math.max(1, daysDiff);
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  const nights = calculateNights();

  // Navigation handlers
  const handleViewBooking = () => {
    router.push(`/(tabs)/traveler/bookings/${booking._id}`);
  };

  const handleBackToProperty = () => {
    // Detect current tab context from URL segments
    const currentTab = segments.find((segment: string) =>
      ["home", "search", "wishlist", "bookings", "properties"].includes(segment)
    );

    if (currentTab) {
      // Navigate back to property within the same tab context
      router.push(`/(tabs)/traveler/${currentTab}/property/${property?._id}`);
    } else {
      // Fallback navigation
      router.push(`/(tabs)/traveler/home/property/${property?._id}`);
    }
  };

  const handleBackToHome = () => {
    router.push("/(tabs)");
  };

  if (!booking || !property) {
    return (
      <DetailScreen
        title="Error"
        headerVariant="solid"
        error="Unable to display booking confirmation"
      >
        <Container
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="xl"
        >
          <Text variant="body" color="secondary">
            Unable to display booking confirmation.
          </Text>
        </Container>
      </DetailScreen>
    );
  }

  return (
    <DetailScreen title="Booking Confirmed!" headerVariant="solid">
      <Container paddingHorizontal="lg" paddingTop="lg" style={styles.content}>
        {/* Success Icon */}
        <Container alignItems="center" marginBottom="xl">
          <Container
            width={80}
            height={80}
            borderRadius="circle"
            backgroundColor="success"
            alignItems="center"
            justifyContent="center"
            marginBottom="md"
          >
            <MaterialIcons name="check" size={40} color="white" />
          </Container>
          <Container alignItems="center">
            <Text variant="h5" weight="bold" color="primary">
              Reservation Confirmed
            </Text>
          </Container>
          <Container alignItems="center" marginTop="xs">
            <Text variant="body" color="secondary">
              You&apos;ll receive a confirmation email shortly
            </Text>
          </Container>
        </Container>

        {/* Booking Details Card */}
        <Container
          backgroundColor="surface"
          padding="lg"
          borderRadius="lg"
          marginBottom="lg"
        >
          <Container marginBottom="md">
            <Text variant="h6" weight="semibold" color="primary">
              Booking Details
            </Text>
          </Container>

          {/* Property Information */}
          <Container marginBottom="md">
            <Container marginBottom="xs">
              <Text variant="caption" weight="medium" color="secondary">
                PROPERTY
              </Text>
            </Container>
            <Text variant="body" weight="medium" color="primary">
              {property.name}
            </Text>
            <Text variant="caption" color="secondary">
              {property.address?.street ||
                property.address?.city ||
                "Property Location"}
            </Text>
          </Container>

          {/* Dates */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            marginBottom="md"
          >
            <Container flex={1}>
              <Container marginBottom="xs">
                <Text variant="caption" weight="medium" color="secondary">
                  CHECK-IN
                </Text>
              </Container>
              <Text variant="body" weight="medium" color="primary">
                {formatDate(booking.checkIn)}
              </Text>
            </Container>
            <Container flex={1}>
              <Container marginBottom="xs">
                <Text variant="caption" weight="medium" color="secondary">
                  CHECK-OUT
                </Text>
              </Container>
              <Text variant="body" weight="medium" color="primary">
                {formatDate(booking.checkOut)}
              </Text>
            </Container>
          </Container>

          {/* Guests and Nights */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            marginBottom="md"
          >
            <Container flex={1}>
              <Container marginBottom="xs">
                <Text variant="caption" weight="medium" color="secondary">
                  GUESTS
                </Text>
              </Container>
              <Text variant="body" weight="medium" color="primary">
                {booking.guestCount}
              </Text>
            </Container>
            <Container flex={1}>
              <Container marginBottom="xs">
                <Text variant="caption" weight="medium" color="secondary">
                  NIGHTS
                </Text>
              </Container>
              <Text variant="body" weight="medium" color="primary">
                {nights} {nights === 1 ? "night" : "nights"}
              </Text>
            </Container>
          </Container>

          {/* Booking ID */}
          <Container>
            <Container marginBottom="xs">
              <Text variant="caption" weight="medium" color="secondary">
                BOOKING ID
              </Text>
            </Container>
            <Text variant="body" weight="medium" color="primary">
              {booking._id}
            </Text>
          </Container>
        </Container>

        {/* Payment Details */}
        <Container
          backgroundColor="surface"
          padding="lg"
          borderRadius="lg"
          marginBottom="lg"
        >
          <Container marginBottom="md">
            <Text variant="h6" weight="semibold" color="primary">
              Payment Details
            </Text>
          </Container>

          {/* Price Breakdown Caption */}
          <Container marginBottom="sm">
            <Text variant="caption" weight="medium" color="secondary">
              PRICE BREAKDOWN
            </Text>
          </Container>

          {/* Cost per night */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="sm"
          >
            <Text variant="body" color="secondary">
              $
              {typeof property.price === "object"
                ? property.price?.amount || 0
                : property.price || 0}{" "}
              × {nights} {nights === 1 ? "night" : "nights"}
            </Text>
            <Text variant="body" weight="medium" color="primary">
              $
              {(typeof property.price === "object"
                ? property.price?.amount || 0
                : property.price || 0) * nights}
            </Text>
          </Container>

          {/* Cleaning fee */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="sm"
          >
            <Text variant="body" color="secondary">
              Cleaning fee
            </Text>
            <Text variant="body" weight="medium" color="primary">
              $25
            </Text>
          </Container>

          {/* Service fee */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="sm"
          >
            <Text variant="body" color="secondary">
              Service fee
            </Text>
            <Text variant="body" weight="medium" color="primary">
              $
              {Math.round(
                (typeof property.price === "object"
                  ? property.price?.amount || 0
                  : property.price || 0) *
                  nights *
                  0.14
              )}
            </Text>
          </Container>

          {/* Taxes */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="md"
          >
            <Text variant="body" color="secondary">
              Taxes & fees
            </Text>
            <Text variant="body" weight="medium" color="primary">
              $
              {Math.round(
                (typeof property.price === "object"
                  ? property.price?.amount || 0
                  : property.price || 0) *
                  nights *
                  0.12
              )}
            </Text>
          </Container>

          {/* Divider */}
          <Container height={1} backgroundColor="border" marginBottom="md">
            {null}
          </Container>

          {/* Total */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom="md"
          >
            <Text variant="body" weight="semibold" color="primary">
              Total Paid
            </Text>
            <Text variant="body" weight="bold" color="primary">
              ${booking.totalPrice}
            </Text>
          </Container>

          {/* Payment Method */}
          <Container marginTop="sm">
            <Container marginBottom="xs">
              <Text variant="caption" weight="medium" color="secondary">
                PAYMENT METHOD
              </Text>
            </Container>
            <Text variant="body" weight="medium" color="primary">
              {paymentMethod?.type === "zaad"
                ? `ZAAD (${paymentMethod.details?.phone || "Mobile Payment"})`
                : paymentMethod?.details?.name
                ? paymentMethod.details.name
                : booking.paymentId
                ? "ZAAD Payment"
                : "Credit Card"}
            </Text>
          </Container>
        </Container>

        {/* Action Buttons */}
        <Container style={{ gap: 12 }} marginTop="lg">
          <Button
            title="View Booking Details"
            onPress={handleViewBooking}
            variant="primary"
            size="small"
          />

          <Button
            title="Back to Property"
            onPress={handleBackToProperty}
            variant="outline"
            size="small"
          />

          <Button
            title="Back to Home"
            onPress={handleBackToHome}
            variant="ghost"
            size="small"
          />
        </Container>

        {/* Bottom spacing */}
        <Container height={40}>{null}</Container>
      </Container>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
