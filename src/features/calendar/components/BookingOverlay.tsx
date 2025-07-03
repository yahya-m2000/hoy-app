import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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

// Global style cache for BookingOverlay to prevent recreation
const overlayStyleCache = new Map<string, any>();

// Create cached styles for booking overlays
const createOverlayStyles = (dayWidth: number, dayHeight: number) => {
  const cacheKey = `${dayWidth}_${dayHeight}`;

  if (overlayStyleCache.has(cacheKey)) {
    return overlayStyleCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    bookingPill: {
      position: "absolute",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.circle,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 2,
    },
    guestAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 4,
    },
    avatarPlaceholder: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#666",
      marginRight: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    guestName: {
      fontSize: 11,
      fontWeight: "500",
      color: "#FFFFFF",
      flex: 1,
    },
    pillContinuingFrom: {
      borderRadius: radius.circle,

      marginLeft: 0,
    },
    pillContinuingTo: {
      borderRadius: radius.circle,

      marginRight: 0,
    },
  });

  overlayStyleCache.set(cacheKey, styles);
  return styles;
};

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
    // Use cached styles
    const styles = useMemo(
      () => createOverlayStyles(dayWidth, dayHeight),
      [dayWidth, dayHeight]
    );

    // Memoize pill calculations to prevent recalculation on every render
    const pills = useMemo(() => {
      return calculateBookingPillLayout(
        booking,
        monthMatrix,
        dayWidth,
        dayHeight
      );
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
      return null;
    }
    return (
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {pills.map((pill, index) => {
          // Pre-calculate pill style properties
          const pillStyleProps = {
            // Position to cover the price area (bottom part of the cell)
            top: pill.top + 45, // Position in the lower part of the 80px tall cell
            left: pill.left + 4, // Small margin from edges
            width: pill.width - 8, // Account for margins
            height: 30, // Bigger height for avatar and text
            backgroundColor: bookingColor,
          };

          const pillStyle = [
            styles.bookingPill,
            pillStyleProps,
            // Apply styling based on pill position flags
            !pill.isFirstInMonth && styles.pillContinuingFrom,
            !pill.isLastInMonth && styles.pillContinuingTo,
          ];

          return (
            <TouchableOpacity
              key={`${booking.id}-pill-${index}`}
              style={pillStyle}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              {/* Avatar - Show on every segment so user can see the booking owner */}
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.guestAvatar}
                  defaultSource={require("../../../../assets/icon.png")}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{avatarInitials}</Text>
                </View>
              )}

              {/* Guest Name - Only show on the first segment to avoid repetition */}
              {index === 0 && (
                <Text
                  style={styles.guestName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {guestName}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
  areOverlayPropsEqual
);

// Set display name for debugging
BookingOverlayComponent.displayName = "BookingOverlay";

export const BookingOverlay = BookingOverlayComponent;
export default BookingOverlay;
