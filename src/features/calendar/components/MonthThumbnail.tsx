import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  MonthData,
  formatMonthName,
  generateCalendarCells,
} from "../utils/dateUtils";
import {
  getMonthlyEarnings,
  getBookingsForPropertyMonth,
} from "../utils/mockData";
import { useTheme } from "@core/hooks";
import { fontSize, fontWeight, radius, spacing } from "@core/design";

interface MonthThumbnailProps {
  monthData: MonthData;
  onPress: (month: Date) => void;
  propertyId?: string;
}

const MonthThumbnailComponent: React.FC<MonthThumbnailProps> = ({
  monthData,
  onPress,
  propertyId,
}) => {
  const { theme } = useTheme();

  // Memoize expensive calculations (must be before early returns)
  const monthlyData = useMemo(() => {
    if (!monthData?.month) return { earnings: 0, bookings: [], cells: null };

    return {
      earnings: getMonthlyEarnings(monthData.month, propertyId),
      bookings: getBookingsForPropertyMonth(monthData.month, propertyId),
      cells: generateCalendarCells(monthData.month).cells,
    };
  }, [monthData?.month, propertyId]);

  const { earnings, bookings, cells } = monthlyData;

  // Memoized booking lookup function with precomputed map
  const { getBookingState } = useMemo(() => {
    // Create a map for O(1) booking lookups instead of O(n) array search
    const bookingMap = new Map<string, (typeof bookings)[0]>();

    bookings.forEach((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        bookingMap.set(dateKey, booking);
      }
    });

    const lookupFunction = (date: Date) => {
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const booking = bookingMap.get(dateKey);

      if (booking) {
        return {
          isBooked: true,
          booking,
          isStart: date.getTime() === booking.startDate.getTime(),
          isEnd: date.getTime() === booking.endDate.getTime(),
        };
      }
      return { isBooked: false, booking: null, isStart: false, isEnd: false };
    };

    return {
      getBookingState: lookupFunction,
    };
  }, [bookings]);

  // Memoize the expensive dot matrix rendering (before early return)
  const dotMatrix = useMemo(() => {
    if (!cells) return null;

    // Helper function to get booking pills for each row
    const getBookingPillsForRow = (rowCells: any[], rowIndex: number) => {
      const pills: any[] = [];
      const processedBookings = new Set();

      rowCells.forEach((cell, colIndex) => {
        if (!cell.isValidDay) return;

        const bookingState = getBookingState(cell.date!);
        if (
          bookingState.isBooked &&
          !processedBookings.has(bookingState.booking!.id)
        ) {
          const booking = bookingState.booking!;
          processedBookings.add(booking.id);

          // Calculate pill dimensions and position
          let startCol = colIndex;
          let width = 1;

          // Count consecutive days in this row for this booking
          for (let i = colIndex + 1; i < rowCells.length; i++) {
            const nextCell = rowCells[i];
            if (!nextCell.isValidDay) break;

            const nextBookingState = getBookingState(nextCell.date!);
            if (
              nextBookingState.isBooked &&
              nextBookingState.booking!.id === booking.id
            ) {
              width++;
            } else {
              break;
            }
          }

          // Calculate position and width accounting for space-between dynamic positioning
          // With space-between, the first item is at 0%, last item at 100%, others distributed evenly
          // For 7 items: positions are 0%, 16.667%, 33.333%, 50%, 66.667%, 83.333%, 100%
          const totalCols = 7;

          // Calculate start and end positions as percentages (space-between formula)
          const startPosition = (startCol / (totalCols - 1)) * 100;
          const endCol = startCol + width - 1;
          const endPosition = (endCol / (totalCols - 1)) * 100;

          // Position the pill to span from start dot center to end dot center
          const leftPercentage = startPosition;
          let widthPercentage = endPosition - startPosition;

          // For single-day bookings, ensure minimum width to cover the dot
          if (width === 1) {
            widthPercentage = Math.max(widthPercentage, 3);
          }

          // Check if this is a single booking dot in a row (skip pill rendering, handled by colored dot)
          const shouldRenderAsDot = width === 1;

          // Skip rendering pills for single-day bookings (they're handled by colored dots)
          if (!shouldRenderAsDot) {
            // Determine pill style based on booking status
            let pillStyle: any = {
              position: "absolute",
              left: `${leftPercentage}%`,
              zIndex: 10, // Ensure pills appear above dots
              width: `${widthPercentage}%`,
              height: 4,
              borderRadius: 2,
              top: "50%",
              marginTop: -2,
            };

            // Use black for present/future, gray for past
            if (booking.status === "past") {
              pillStyle.backgroundColor = "#999999"; // Gray for past bookings
            } else {
              pillStyle.backgroundColor = "#000000"; // Black for present/future bookings
            }

            // For June debugging, remove red border now that pills are visible
            if (
              monthData.month.getMonth() === 5 &&
              monthData.month.getFullYear() === 2025
            ) {
              pillStyle.opacity = 1; // Ensure full opacity
            }

            pills.push(
              <View key={`${booking.id}-${rowIndex}`} style={pillStyle} />
            );
          }
        }
      });

      return pills;
    };

    return (
      <View style={styles.dotMatrix}>
        {cells.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.dotRow,
              rowIndex === cells.length - 1 && styles.lastRow,
            ]}
          >
            {/* Render dots */}
            {row.map((cell, colIndex) => {
              if (!cell.isValidDay) {
                return <View key={colIndex} style={styles.emptyDot} />;
              }

              const today = new Date();
              const cellDate = cell.date!;
              const isInPast =
                cellDate <
                new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );
              const isInFuture =
                cellDate >
                new Date(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate()
                );

              const bookingState = getBookingState(cellDate);

              // Check if this booking should be rendered as a colored dot (single day in this row)
              let shouldRenderBookingAsDot = false;
              let bookingStyle = null;

              if (bookingState.isBooked) {
                const booking = bookingState.booking!;

                // Count consecutive days in this row for this booking
                let consecutiveDays = 1;
                for (let i = colIndex + 1; i < row.length; i++) {
                  const nextCell = row[i];
                  if (!nextCell.isValidDay) break;
                  const nextBookingState = getBookingState(nextCell.date!);
                  if (
                    nextBookingState.isBooked &&
                    nextBookingState.booking!.id === booking.id
                  ) {
                    consecutiveDays++;
                  } else {
                    break;
                  }
                }

                // If only one day in this row, render as colored dot
                if (consecutiveDays === 1) {
                  shouldRenderBookingAsDot = true;
                  if (booking.status === "past") {
                    bookingStyle = styles.bookingPast;
                  } else {
                    // Use black for present/future (active and upcoming)
                    bookingStyle = styles.bookingPresentFuture;
                  }
                }
              }

              return (
                <View
                  key={colIndex}
                  style={[
                    styles.dot,
                    isInPast &&
                      !bookingState.isBooked && {
                        backgroundColor: theme.colors.gray[300],
                      },
                    isInFuture &&
                      !bookingState.isBooked && {
                        backgroundColor: theme.colors.gray[400],
                      },
                    !isInPast &&
                      !isInFuture &&
                      !cell.isToday &&
                      !bookingState.isBooked && {
                        backgroundColor: theme.colors.gray[400],
                      },
                    // For multi-day bookings, hide the dot (will be covered by pill)
                    bookingState.isBooked &&
                      !shouldRenderBookingAsDot &&
                      styles.dotTransparent,
                    // For single-day bookings, color the dot with booking color
                    shouldRenderBookingAsDot && bookingStyle,
                    cell.isToday && {
                      backgroundColor: theme.background,
                      outlineColor: theme.colors.primary,
                      outlineOffset: 0,
                      outlineWidth: 2,
                    },
                  ]}
                />
              );
            })}

            {/* Render booking pills on top */}
            {getBookingPillsForRow(row, rowIndex)}
          </View>
        ))}
      </View>
    );
  }, [cells, getBookingState, theme, monthData?.month]);

  // Safety checks after hooks
  if (!monthData || !monthData.month) {
    return null;
  }
  const handlePress = () => {
    // Disabled for now - edit mode will be handled differently
    // onPress(monthData.month);
  };

  return (
    <TouchableOpacity
      style={styles.thumbnail}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={true} // Disabled for now
    >
      <View style={styles.header}>
        <Text style={[styles.monthName, { color: theme.text.primary }]}>
          {formatMonthName(monthData.month, true)}
        </Text>
        <Text style={[styles.earnings, { color: theme.colors.gray[400] }]}>
          ${earnings.toLocaleString()}
        </Text>
      </View>

      <View style={styles.matrixContainer}>{dotMatrix}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  thumbnail: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 140,
  },
  header: {
    marginBottom: 8,
  },
  monthName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
    marginBottom: 4,
  },
  earnings: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
  matrixContainer: {
    flex: 1,
  },
  dotMatrix: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    position: "relative", // Allow absolute positioning of pills
  },
  lastRow: {
    marginBottom: 0,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F0F0F0", // Default fallback, will be overridden by theme colors
    position: "relative", // Allow absolute positioning of pills
  },
  dotPast: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  dotFuture: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  dotToday: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "relative",
    outlineOffset: 0,
    outlineWidth: 2,
  },
  dotTransparent: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "transparent",
    position: "relative",
  },
  bookingPast: {
    backgroundColor: "#999999",
  },
  bookingPresentFuture: {
    backgroundColor: "#000000",
  },
  bookingActive: {
    backgroundColor: "#000000", // Changed to black
  },
  bookingUpcoming: {
    backgroundColor: "#000000", // Changed to black
  },
  emptyDot: {
    width: 4,
    height: 4,
  },
  pastText: {
    color: "#999999",
  },
  footer: {
    marginTop: 16,
  },
  densityText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

// Export memoized component with display name and custom comparison
MonthThumbnailComponent.displayName = "MonthThumbnail";
export const MonthThumbnail = React.memo(
  MonthThumbnailComponent,
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.monthData?.month?.getTime() ===
        nextProps.monthData?.month?.getTime() &&
      prevProps.onPress === nextProps.onPress
    );
  }
);
