import React, { useMemo, useState, useEffect, useRef } from "react";
import { TouchableOpacity } from "react-native";
import { Container, Text } from "@shared/components";
import { useTranslation } from "react-i18next";
import {
  MonthData,
  formatMonthName,
  generateCalendarCells,
} from "../utils/dateUtils";
import {
  getMonthlyEarnings,
  getBookingsForPropertyMonth,
} from "../utils/realBookingData";
import { useTheme } from "@core/hooks";
import { fontSize, fontWeight, radius, spacing } from "@core/design";
import { CalendarBookingData } from "@core/types";

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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [earnings, setEarnings] = useState<number>(0);
  const [bookings, setBookings] = useState<CalendarBookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isLoadingRef = useRef<boolean>(false);

  // Helper function to translate month name
  const getTranslatedMonthName = useMemo(() => {
    return (date: Date, short: boolean = false) => {
      const monthKey = formatMonthName(date, short);
      const parts = monthKey.split(" ");
      if (parts.length >= 2) {
        const translationKey = parts[0];
        return `${t(translationKey)} `;
      }
      return monthKey;
    };
  }, [t]);

  // Generate calendar cells synchronously
  const cells = useMemo(() => {
    if (!monthData?.month) return null;
    return generateCalendarCells(monthData.month).cells;
  }, [monthData?.month]);

  // Fetch booking data asynchronously
  useEffect(() => {
    const fetchMonthlyData = async () => {
      // Don't fetch if no month data or no property ID
      if (!monthData?.month || !propertyId) {
        console.log("📋 MonthThumbnail: Skipping fetch", {
          hasMonthData: !!monthData?.month,
          propertyId,
          monthName: monthData?.month
            ? getTranslatedMonthName(monthData.month)
            : t("calendar.loading.noMonth"),
        });
        setEarnings(0);
        setBookings([]);
        setIsLoading(false);
        isLoadingRef.current = false;
        return;
      }

      // Prevent duplicate requests
      if (isLoadingRef.current) {
        console.log("⏳ MonthThumbnail: Already loading, skipping...", {
          month: getTranslatedMonthName(monthData.month),
          propertyId,
        });
        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      console.log("🔄 MonthThumbnail: Starting fetch", {
        month: getTranslatedMonthName(monthData.month),
        propertyId,
        date: monthData.month.toISOString(),
      });

      try {
        const [monthEarnings, monthBookings] = await Promise.all([
          getMonthlyEarnings(monthData.month, propertyId),
          getBookingsForPropertyMonth(monthData.month, propertyId),
        ]);

        console.log("✅ MonthThumbnail: Fetched data", {
          month: getTranslatedMonthName(monthData.month),
          earnings: monthEarnings,
          bookingsCount: monthBookings.length,
          bookings: monthBookings,
        });

        setEarnings(monthEarnings);
        setBookings(monthBookings);
      } catch (error) {
        console.error("❌ MonthThumbnail: Error fetching monthly data:", {
          month: getTranslatedMonthName(monthData.month),
          propertyId,
          error,
        });
        setEarnings(0);
        setBookings([]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchMonthlyData();
  }, [monthData?.month, propertyId, getTranslatedMonthName]);

  // Memoized booking lookup function with precomputed map
  const { getBookingState } = useMemo(() => {
    // Create a map for O(1) booking lookups instead of O(n) array search
    const bookingMap = new Map<string, (typeof bookings)[0]>();

    if (bookings && bookings.length > 0) {
      bookings.forEach((booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          bookingMap.set(dateKey, booking);
        }
      });
    }

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
    if (!cells || isLoading) return null;

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
              borderRadius: "sm",
              top: "50%",
              marginTop: -2,
              backgroundColor:
                booking.status === "past" ? "#999999" : "#000000",
              opacity: 1,
            };

            pills.push(
              <Container key={`${booking.id}-${rowIndex}`} style={pillStyle}>
                {null}
              </Container>
            );
          }
        }
      });

      return pills;
    };

    return (
      <Container flexDirection="column" flex={1} justifyContent="space-between">
        {cells.map((row, rowIndex) => (
          <Container
            key={rowIndex}
            flexDirection="row"
            justifyContent="space-between"
            style={{
              position: "relative",
              marginBottom: rowIndex === cells.length - 1 ? 0 : 4,
            }}
          >
            {/* Render dots */}
            {row.map((cell, colIndex) => {
              if (!cell.isValidDay) {
                return (
                  <Container key={colIndex} width={4} height={4}>
                    {null}
                  </Container>
                );
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
              let bookingStyle = {};

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
                  bookingStyle = {
                    backgroundColor:
                      booking.status === "past" ? "#999999" : "#000000",
                  };
                }
              }

              let dotBg = "#F0F0F0";
              if (isInPast && !bookingState.isBooked) {
                dotBg = theme.colors.gray[300];
              } else if (isInFuture && !bookingState.isBooked) {
                dotBg = theme.colors.gray[400];
              } else if (
                !isInPast &&
                !isInFuture &&
                !cell.isToday &&
                !bookingState.isBooked
              ) {
                dotBg = theme.colors.gray[400];
              }
              if (bookingState.isBooked && !shouldRenderBookingAsDot) {
                dotBg = "transparent";
              }
              if (cell.isToday) {
                dotBg = theme.background;
              }

              return (
                <Container
                  key={colIndex}
                  width={4}
                  height={4}
                  borderRadius="sm"
                  backgroundColor={dotBg}
                  style={{
                    position: "relative",
                    ...(cell.isToday
                      ? {
                          outlineColor: theme.colors.primary,
                          outlineOffset: 0,
                          outlineWidth: 2,
                        }
                      : {}),
                    ...bookingStyle,
                  }}
                >
                  {null}
                </Container>
              );
            })}

            {/* Render booking pills on top */}
            {getBookingPillsForRow(row, rowIndex)}
          </Container>
        ))}
      </Container>
    );
  }, [cells, getBookingState, theme, monthData?.month]);

  // Safety checks after hooks
  if (!monthData || !monthData.month || isLoading) {
    return null;
  }
  const handlePress = () => {
    // Disabled for now - edit mode will be handled differently
    // onPress(monthData.month);
  };

  return (
    <TouchableOpacity
      style={{
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        minHeight: 140,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={true} // Disabled for now
    >
      <Container marginBottom="sm">
        <Text
          variant="h6"
          weight="medium"
          color={theme.text.primary}
          marginBottom="sm"
        >
          {getTranslatedMonthName(monthData.month, true)}
        </Text>
        <Text variant="body" weight="medium" color={theme.colors.gray[400]}>
          ${earnings.toLocaleString()}
        </Text>
      </Container>
      <Container flex={1}>{dotMatrix}</Container>
    </TouchableOpacity>
  );
};

// Export memoized component with display name and custom comparison
MonthThumbnailComponent.displayName = "MonthThumbnail";
export const MonthThumbnail = React.memo(
  MonthThumbnailComponent,
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.monthData?.month?.getTime() ===
        nextProps.monthData?.month?.getTime() &&
      prevProps.onPress === nextProps.onPress &&
      prevProps.propertyId === nextProps.propertyId
    );
  }
);
