import React, { useMemo, useCallback } from "react";
import { TouchableOpacity, Image } from "react-native";
import { Container, Text } from "@shared/components";
import { DayMeta, calculateBookingPillLayout } from "../utils/dateUtils";
import { CalendarBookingData } from "@core/types";
import { radius } from "@core/design";

interface BookingOverlayProps {
  booking: CalendarBookingData;
  monthMatrix: DayMeta[][];
  dayWidth: number;
  dayHeight: number;
  onBookingPress: (booking: CalendarBookingData) => void;
}

// Custom comparison function for better memoization
const areOverlayPropsEqual = (
  prevProps: BookingOverlayProps,
  nextProps: BookingOverlayProps
) => {
  // Compare booking by reference first (most common change)
  if (prevProps.booking !== nextProps.booking) {
    return false;
  }

  // Compare dimensions
  if (
    prevProps.dayWidth !== nextProps.dayWidth ||
    prevProps.dayHeight !== nextProps.dayHeight
  ) {
    return false;
  }

  // Compare matrix by reference (should be stable)
  if (prevProps.monthMatrix !== nextProps.monthMatrix) {
    return false;
  }

  // Compare callback by reference
  if (prevProps.onBookingPress !== nextProps.onBookingPress) {
    return false;
  }

  return true;
};

const BookingOverlayComponent: React.FC<BookingOverlayProps> = React.memo(
  ({ booking, monthMatrix, dayWidth, dayHeight, onBookingPress }) => {
    console.log("🎯 BookingOverlay: Rendering overlay", {
      bookingId: booking.id,
      guestName: booking.guestName,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      dayWidth,
      dayHeight,
    });

    // Memoize pill calculations to prevent recalculation on every render
    const pills = useMemo(() => {
      const calculatedPills = calculateBookingPillLayout(
        booking,
        monthMatrix,
        dayWidth,
        dayHeight
      );

      console.log("💊 BookingOverlay: Pills calculated", {
        bookingId: booking.id,
        pillsCount: calculatedPills.length,
        pills: calculatedPills,
      });

      return calculatedPills;
    }, [booking, monthMatrix, dayWidth, dayHeight]);

    // Memoize color calculations
    const bookingColor = useMemo(() => {
      const today = new Date();
      const isPast = booking.endDate < today;
      return isPast ? "#999999" : "#000000"; // Gray for past, black for present/future
    }, [booking.endDate]);

    // Memoized press handler to prevent recreation
    const handlePress = useCallback(() => {
      onBookingPress(booking);
    }, [onBookingPress, booking]);

    // Memoized guest name to prevent recalculation
    const guestName = useMemo(() => booking.guestName, [booking.guestName]);

    // Memoized avatar URL
    const avatarUrl = useMemo(() => booking.guestAvatar, [booking.guestAvatar]);

    // Memoized avatar initials
    const avatarInitials = useMemo(() => {
      return guestName ? guestName.charAt(0).toUpperCase() : "G";
    }, [guestName]);

    // If no pills, render nothing
    if (!pills.length) {
      console.log("❌ BookingOverlay: No pills to render", {
        bookingId: booking.id,
        pillsLength: pills.length,
      });
      return null;
    }

    console.log("✅ BookingOverlay: Rendering pills", {
      bookingId: booking.id,
      pillsCount: pills.length,
      guestName: booking.guestName,
    });

    return (
      <Container
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {pills.map((pill, index) => {
          // Pre-calculate pill style properties
          const pillStyleProps = {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 9999,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 2,
            width: pill.width - 8,
            height: 30,
            backgroundColor: bookingColor,
            marginLeft: !pill.isFirstInMonth ? 0 : undefined,
            marginRight: !pill.isLastInMonth ? 0 : undefined,
            position: "absolute" as const,
            top: pill.top + 45,
            left: pill.left + 4,
          };
          return (
            <TouchableOpacity
              key={`${booking.id}-pill-${index}`}
              style={pillStyleProps}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              {/* Avatar - Show on every segment so user can see the booking owner */}
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginRight: 4,
                  }}
                  defaultSource={require("../../../../assets/icon.png")}
                />
              ) : (
                <Container
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#666",
                    marginRight: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    color="#fff"
                    style={{ fontSize: 10, fontWeight: "bold" }}
                  >
                    {avatarInitials}
                  </Text>
                </Container>
              )}

              {/* Guest Name - Only show on the first segment to avoid repetition */}
              {index === 0 && (
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    color: "#FFFFFF",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {guestName}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </Container>
    );
  },
  areOverlayPropsEqual
);

// Set display name for debugging
BookingOverlayComponent.displayName = "BookingOverlay";

export const BookingOverlay = BookingOverlayComponent;
export default BookingOverlay;
