import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DayCell } from "./DayCell";
import { BookingOverlay } from "./BookingOverlay";
import type { MonthViewData } from "../utils/monthDataUtils";
import { formatMonthName } from "../utils/dateUtils";
import { fontSize, fontWeight } from "@core/design";
import { useTheme } from "@core/hooks";
import { CalendarBookingData } from "@core/types";

interface MemoizedMonthProps {
  monthData: MonthViewData;
  monthIndex: number;
  dayWidth: number;
  dayHeight: number;
  calendarWidth: number;
  monthSpacing: number;
  onBookingPress: (booking: CalendarBookingData) => void;
}

// Global style cache to prevent recreation
const styleCache = new Map<string, any>();

// Create styles once and cache them globally
const createMonthStyles = (
  theme: any,
  dayWidth: number,
  dayHeight: number,
  calendarWidth: number
) => {
  const cacheKey = `${
    theme.text?.primary || "#000"
  }_${dayWidth}_${dayHeight}_${calendarWidth}`;

  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    monthContainer: {
      alignItems: "center",
      justifyContent: "flex-start",
      width: "100%",
    },
    monthTitleContainer: {
      width: "100%",
      paddingVertical: 12,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      paddingHorizontal: 0,
    },
    monthTitleText: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.bold,
      color: theme.colors?.gray?.[400] || "#666",
    },
    calendarGrid: {
      position: "relative",
      paddingBottom: 10,
      alignSelf: "center",
      width: calendarWidth,
    },
    weekRow: {
      flexDirection: "row",
      justifyContent: "flex-start", // Keep cells aligned with columns instead of centering
    },
    emptyDayCell: {
      width: dayWidth - 2,
      height: dayHeight,
      // Keep the same dimensions to maintain column alignment
    },
  });

  styleCache.set(cacheKey, styles);
  return styles;
};

// Custom comparison function for better memoization
const arePropsEqual = (
  prevProps: MemoizedMonthProps,
  nextProps: MemoizedMonthProps
) => {
  // Compare primitive props
  if (
    prevProps.monthIndex !== nextProps.monthIndex ||
    prevProps.dayWidth !== nextProps.dayWidth ||
    prevProps.dayHeight !== nextProps.dayHeight ||
    prevProps.calendarWidth !== nextProps.calendarWidth ||
    prevProps.monthSpacing !== nextProps.monthSpacing ||
    prevProps.onBookingPress !== nextProps.onBookingPress
  ) {
    return false;
  }

  // Compare monthData deeply but efficiently
  const prevMonthData = prevProps.monthData;
  const nextMonthData = nextProps.monthData;

  if (prevMonthData.key !== nextMonthData.key) {
    return false;
  }

  if (prevMonthData.matrix.length !== nextMonthData.matrix.length) {
    return false;
  }

  if (prevMonthData.bookings.length !== nextMonthData.bookings.length) {
    return false;
  }

  // Check bookings by reference (should be stable if properly memoized upstream)
  for (let i = 0; i < prevMonthData.bookings.length; i++) {
    if (prevMonthData.bookings[i] !== nextMonthData.bookings[i]) {
      return false;
    }
  }

  return true;
};

/**
 * Heavily Optimized Memoized Month Component
 * - Uses global style caching
 * - Custom comparison function for precise re-render control
 * - Optimized rendering patterns
 */
const MemoizedMonthComponent = React.memo<MemoizedMonthProps>(
  ({
    monthData,
    monthIndex,
    dayWidth,
    dayHeight,
    calendarWidth,
    monthSpacing,
    onBookingPress,
  }) => {
    const { matrix, bookings } = monthData;
    const themeResult = useTheme();

    // Create a fallback theme to prevent undefined access errors
    const fallbackTheme = {
      text: { primary: "#000", secondary: "#666" },
      colors: { gray: { 400: "#9CA3AF" }, primary: "#007AFF" },
    };

    const theme = themeResult?.theme || fallbackTheme;

    // Use cached styles
    const styles = React.useMemo(
      () => createMonthStyles(theme, dayWidth, dayHeight, calendarWidth),
      [theme, dayWidth, dayHeight, calendarWidth]
    );

    // Memoized booking press handler
    const handleBookingPress = React.useCallback(
      (booking: CalendarBookingData) => {
        onBookingPress(booking);
      },
      [onBookingPress]
    );

    // Pre-calculate constants to avoid inline calculations
    const dynamicMonthHeight = React.useMemo(
      () => matrix.length * dayHeight,
      [matrix.length, dayHeight]
    );
    const monthTitleHeight = 40;
    const totalHeight = dynamicMonthHeight + monthTitleHeight;

    // Memoize month title to prevent unnecessary recalculations
    const monthTitle = React.useMemo(() => {
      return formatMonthName(monthData.month).toUpperCase();
    }, [monthData.month]);

    // Filter bookings that have days in this month (memoized to prevent recalculation)
    const filteredBookings = React.useMemo(() => {
      const monthStart = new Date(
        monthData.month.getFullYear(),
        monthData.month.getMonth(),
        1
      );
      const monthEnd = new Date(
        monthData.month.getFullYear(),
        monthData.month.getMonth() + 1,
        0
      );

      return bookings.filter((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        // Check if booking overlaps with this month
        return bookingStart <= monthEnd && bookingEnd >= monthStart;
      });
    }, [bookings, monthData.month]); // Memoize week rows to prevent recreation
    const weekRows = React.useMemo(() => {
      return matrix.map((week: any[], weekIndex: number) => {
        const weekKey = `week-${monthIndex}-${weekIndex}`;
        const isFirstWeek = weekIndex === 0;
        const isLastWeek = weekIndex === matrix.length - 1;

        const dayElements = week.map((day: any, dayIndex: number) => {
          const dayKey = `day-${monthIndex}-${weekIndex}-${dayIndex}-${
            day.date?.getTime() || "empty"
          }`;

          // Always render a cell to maintain column alignment
          if (!day.isCurrentMonth) {
            // Render an invisible placeholder to maintain column positioning
            return <View key={dayKey} style={styles.emptyDayCell} />;
          }
          return (
            <DayCell
              key={dayKey}
              day={day}
              bookings={bookings}
              onPress={undefined} // No press functionality
              size={dayWidth - 2}
              isSelected={false} // No selection state
              isInRange={false} // No range state
              isRangeStart={false} // No range state
              isRangeEnd={false} // No range state
            />
          );
        });

        // Apply different justification for first/last rows if needed
        const weekRowStyle = [
          styles.weekRow,
          isFirstWeek && { justifyContent: "flex-end" },
          isLastWeek && { justifyContent: "flex-start" },
        ];

        return (
          <View key={weekKey} style={weekRowStyle}>
            {dayElements}
          </View>
        );
      });
    }, [matrix, monthIndex, dayWidth, styles, bookings]);

    return (
      <View
        style={[
          styles.monthContainer,
          {
            height: totalHeight,
            marginBottom: monthSpacing,
          },
        ]}
      >
        {/* Month Title */}
        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitleText}>{monthTitle}</Text>
        </View>

        {/* Month Grid */}
        <View style={styles.calendarGrid}>
          {weekRows}

          {/* Booking Overlays - only render filtered bookings */}
          {filteredBookings.map((booking, index) => (
            <BookingOverlay
              key={`${booking.id}-${monthData.key}`}
              booking={booking}
              monthMatrix={matrix}
              dayWidth={dayWidth}
              dayHeight={dayHeight}
              onBookingPress={handleBookingPress}
            />
          ))}
        </View>
      </View>
    );
  },
  arePropsEqual // Use custom comparison function
);

// Set display name for debugging
MemoizedMonthComponent.displayName = "MemoizedMonth";

export const MemoizedMonth = MemoizedMonthComponent;
