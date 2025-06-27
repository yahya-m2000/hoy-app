/**
 * Booking Confirmation Screen (Refactored)
 * Clean, modular implementation with proper styling and internationalization
 */

import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Stack, useLocalSearchParams } from "expo-router";
import { spacing } from "@shared/constants";
import {
  SuccessHeader,
  ZaadPaymentStatus,
  PaymentSummary,
  ActionButtons,
  BottomButtons,
  GuestInformation,
  ErrorState,
} from "@modules/booking";
import { PropertyCard } from "@modules/properties";

const BookingConfirmationScreen = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const booking = params.booking ? JSON.parse(params.booking as string) : null;
  const property = booking?.property;

  // Helper function to calculate number of nights
  const getNumberOfNights = () => {
    if (!booking || !booking.checkIn || !booking.checkOut) return 0;

    try {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      // Validate that dates are valid
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        console.warn(
          "Invalid dates in booking:",
          booking.checkIn,
          booking.checkOut
        );
        return 0;
      }

      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;
    } catch (error) {
      console.error("Error calculating nights:", error);
      return 0;
    }
  };

  // Calculate price details for payment summary
  const priceDetails = {
    basePrice:
      property?.price && getNumberOfNights()
        ? property.price * getNumberOfNights()
        : undefined,
    cleaningFee: booking?.cleaningFee || 0,
    serviceFee: booking?.serviceFee || 0,
    taxes: booking?.taxes || 0,
    totalPrice: booking?.totalPrice || 0,
    nights: getNumberOfNights(),
    pricePerNight: property?.price || 0,
  };

  // Error state - booking not found
  if (!booking) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme.colors.gray[900]
              : theme.colors.gray[50],
            paddingTop: insets.top * 2,
          },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style={isDark ? "light" : "dark"} />
        <ErrorState />
      </View>
    );
  }

  // Main success state
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
          animation: "fade",
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation */}
        <SuccessHeader />
        {/* ZAAD Payment Status (if applicable) */}
        <ZaadPaymentStatus booking={booking} /> {/* Property Information */}
        {property && (
          <PropertyCard
            _id={property.id || property._id}
            name={property.title || property.name}
            address={property.address}
            price={property.price}
            imageUrl={property.imageUrl || property.images?.[0]?.url}
            rating={property.rating}
            reviewCount={property.reviewCount}
          />
        )}
        {/* Payment Summary */}
        <PaymentSummary priceDetails={priceDetails} />
        {/* Guest Information */}
        <GuestInformation guests={booking.guests} />
        {/* Action Buttons */}
        <ActionButtons booking={booking} />
        {/* Bottom Action Buttons */}
        <BottomButtons bookingId={booking._id} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
});

export default BookingConfirmationScreen;
