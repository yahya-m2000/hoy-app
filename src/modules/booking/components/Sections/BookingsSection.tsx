/**
 * BookingsSection Component
 * Section container for organizing bookings (upcoming/past)
 */

// React and React Native
import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Base Components
import { Container, Text } from "@shared/components/base";
import { EmptyState } from "@shared/components/common";

// Shared Context and Hooks
import { useTheme } from "@shared/hooks/useTheme";

// Types
import type { PopulatedBooking } from "@shared/types/booking";

interface BookingsSectionProps {
  title: string;
  bookings: PopulatedBooking[];
  isUpcoming: boolean;
  isLoading: boolean;
}

export const BookingsSection: React.FC<BookingsSectionProps> = ({
  title,
  bookings,
  isUpcoming,
  isLoading,
}) => {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Handle navigation to booking details
  const handleBookingPress = (bookingId: string) => {
    router.push(`/(tabs)/traveler/bookings/${bookingId}`);
  };

  return (
    <Container marginBottom="xl">
      {/* Section Title */}
      <Container marginBottom="md">
        <Text
          variant="h6"
          weight="semibold"
          color={isDark ? "white" : "gray900"}
        >
          {title}
        </Text>
      </Container>

      {/* Bookings List or Empty State */}
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <Container
            key={booking._id}
            marginBottom="lg"
            backgroundColor={
              isDark ? theme.colors.gray[900] : theme.colors.gray[100]
            }
            borderRadius="md"
            style={{ cursor: "pointer" }}
            padding="md"
          >
            <TouchableOpacity
              onPress={() => handleBookingPress(booking._id)}
              style={{ width: "100%" }}
            >
              <Container width="100%">
                {/* Property Name */}
                <Container marginBottom="xs">
                  <Text variant="body" weight="medium">
                    {booking.property?.name || "Unknown Property"}
                  </Text>
                </Container>

                {/* Booking Details */}
                <Container marginBottom="xs">
                  <Text variant="caption" color="secondary">
                    Booking ID: {booking._id}
                  </Text>
                </Container>

                <Container marginBottom="xs">
                  <Text variant="caption" color="secondary">
                    Check-in: {new Date(booking.checkIn).toDateString()}
                  </Text>
                </Container>

                <Container marginBottom="xs">
                  <Text variant="caption" color="secondary">
                    Check-out: {new Date(booking.checkOut).toDateString()}
                  </Text>
                </Container>

                <Container>
                  <Text
                    variant="caption"
                    color={
                      booking.bookingStatus === "confirmed"
                        ? "success"
                        : booking.bookingStatus === "cancelled"
                        ? "error"
                        : booking.bookingStatus === "pending"
                        ? "warning"
                        : "secondary"
                    }
                    weight="medium"
                  >
                    Status: {booking.bookingStatus}
                  </Text>
                </Container>
              </Container>
            </TouchableOpacity>
          </Container>
        ))
      ) : (
        <Container paddingVertical="xl" alignItems="center">
          {isLoading ? (
            <Container alignItems="center">
              <Text
                variant="body"
                color="secondary"
                style={{ textAlign: "center" }}
              >
                Loading bookings...
              </Text>
            </Container>
          ) : (
            <EmptyState
              icon={isUpcoming ? "calendar-outline" : "time-outline"}
              title={isUpcoming ? "No upcoming bookings" : "No past bookings"}
              message={
                isUpcoming
                  ? "Start exploring to book your next trip!"
                  : "Your completed bookings will appear here."
              }
              action={
                isUpcoming
                  ? {
                      label: "Start Exploring",
                      onPress: () => router.push("/(tabs)/traveler/search"),
                    }
                  : undefined
              }
            />
          )}
        </Container>
      )}
    </Container>
  );
};
