import React from "react";
import { Container, Text } from "@shared/components";
import { useTranslation } from "react-i18next";
import { DayCell } from "./DayCell";
import { BookingOverlay } from "./BookingOverlay";
import type { MonthViewData } from "../utils/monthDataUtils";
import { formatMonthName } from "../utils/dateUtils";
import { fontSize, fontWeight } from "@core/design";
import { useTheme } from "@core/hooks";
import { CalendarBookingData } from "@core/types";
import { useProperty } from "@features/calendar/hooks/useProperty";

interface MemoizedMonthProps {
  monthData: MonthViewData;
  monthIndex: number;
  dayWidth: number;
  dayHeight: number;
  calendarWidth: number;
  monthSpacing: number;
  onBookingPress: (booking: CalendarBookingData) => void;
  property?: any;
}

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
    property,
  }) => {
    const { t } = useTranslation();
    const { matrix, bookings } = monthData;

    // Helper function to translate month name
    const getTranslatedMonthName = React.useCallback(
      (date: Date) => {
        const monthKey = formatMonthName(date);
        const parts = monthKey.split(" ");
        if (parts.length >= 2) {
          const translationKey = parts[0];
          const year = parts[1];
          return `${t(translationKey)} ${year}`;
        }
        return monthKey;
      },
      [t]
    );

    console.log("📋 MemoizedMonth: Rendering month", {
      monthTitle: getTranslatedMonthName(monthData.month),
      monthIndex,
      bookingsReceived: bookings.length,
      bookingsData: bookings,
      monthKey: monthData.key,
    });

    const themeResult = useTheme();
    // Create a fallback theme to prevent undefined access errors
    const fallbackTheme = {
      text: { primary: "#000", secondary: "#666" },
      colors: { gray: { 400: "#9CA3AF" }, primary: "#007AFF" },
    };
    const theme = themeResult?.theme || fallbackTheme;

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
      return getTranslatedMonthName(monthData.month).toUpperCase();
    }, [monthData.month, getTranslatedMonthName]);

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

      const filtered = bookings.filter((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        // Check if booking overlaps with this month
        return bookingStart <= monthEnd && bookingEnd >= monthStart;
      });

      console.log("🔍 MemoizedMonth: Filtered bookings", {
        monthTitle: getTranslatedMonthName(monthData.month),
        originalBookings: bookings.length,
        filteredBookings: filtered.length,
        monthStart: monthStart.toISOString(),
        monthEnd: monthEnd.toISOString(),
        filtered: filtered,
      });

      return filtered;
    }, [bookings, monthData.month, getTranslatedMonthName]);

    const { selectedProperty } = useProperty();

    // Filter bookings that have days in this month (memoized to prevent recalculation)
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
            return (
              <Container key={dayKey} width={dayWidth - 2} height={dayHeight}>
                {null}
              </Container>
            );
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
              property={selectedProperty}
            />
          );
        });

        // Apply different justification for first/last rows if needed
        let justifyContent: "flex-start" | "flex-end" | undefined = undefined;
        if (isFirstWeek) justifyContent = "flex-end";
        if (isLastWeek) justifyContent = "flex-start";

        return (
          <Container
            key={weekKey}
            flexDirection="row"
            justifyContent={justifyContent || "flex-start"}
          >
            {dayElements}
          </Container>
        );
      });
    }, [matrix, monthIndex, dayWidth, dayHeight, bookings]);

    return (
      <Container
        alignItems="center"
        justifyContent="flex-start"
        width="100%"
        style={{ height: totalHeight, marginBottom: monthSpacing }}
      >
        {/* Month Title */}
        <Container
          width="100%"
          paddingVertical="md"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Text
            variant="body2"
            weight="bold"
            color={theme.colors?.gray?.[400] || "#666"}
          >
            {monthTitle}
          </Text>
        </Container>

        {/* Month Grid */}
        <Container
          style={{
            position: "relative",
            paddingBottom: 10,
            alignSelf: "center",
            width: calendarWidth,
          }}
        >
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
        </Container>
      </Container>
    );
  },
  arePropsEqual // Use custom comparison function
);

// Set display name for debugging
MemoizedMonthComponent.displayName = "MemoizedMonth";

export const MemoizedMonth = MemoizedMonthComponent;
