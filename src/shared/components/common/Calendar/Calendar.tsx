// React
import React, { useState } from "react";

// React Native
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";

// Expo
import { MaterialIcons } from "@expo/vector-icons";

// Context
import { useTheme } from "@shared/context";

// Constants
import { radius, spacing } from "@shared/constants";

// Types
import { CalendarProps } from "./Calendar.types";

const Calendar: React.FC<CalendarProps> = ({
  blockedDates = [],
  bookingRanges = [],
  onDateSelect,
  initialStartDate,
  initialEndDate,
  minDate,
  maxDate,
  enableRangeSelection = true,
}) => {
  const { theme, isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: initialStartDate || null,
    end: initialEndDate || null,
  });

  const { width } = Dimensions.get("window");
  const cellWidth = (width - spacing.lg * 2 - spacing.sm * 6) / 7;

  // Helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateBlocked = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const isPastDate = minDate ? date < minDate : date < today;
    const isAfterMaxDate = maxDate ? date > maxDate : false;
    const isExplicitlyBlocked = blockedDates.some((blocked) => {
      blocked.setHours(0, 0, 0, 0);
      return blocked.getTime() === date.getTime();
    });

    return isPastDate || isAfterMaxDate || isExplicitlyBlocked;
  };

  const isDateInBookingRange = (date: Date) => {
    return bookingRanges.some(
      (range) => date >= range.start && date <= range.end
    );
  };

  const isDateSelected = (date: Date) => {
    if (!selectedRange.start) return false;

    if (!enableRangeSelection) {
      return date.toDateString() === selectedRange.start.toDateString();
    }

    if (!selectedRange.end) {
      return date.toDateString() === selectedRange.start.toDateString();
    }

    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isDateInSelectedRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end || !enableRangeSelection)
      return false;
    return date > selectedRange.start && date < selectedRange.end;
  };

  const handleDatePress = (date: Date) => {
    if (isDateBlocked(date) || isDateInBookingRange(date)) return;

    if (!enableRangeSelection) {
      // Single date selection
      setSelectedRange({ start: date, end: null });
      onDateSelect?.(date);
      return;
    }

    // Range selection logic
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else if (date > selectedRange.start) {
      setSelectedRange({ start: selectedRange.start, end: date });
      onDateSelect?.(selectedRange.start, date);
    } else {
      setSelectedRange({ start: date, end: null });
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
        <MaterialIcons
          name="chevron-left"
          size={24}
          color={
            isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[600]
          }
        />
      </TouchableOpacity>

      <Text
        style={[
          styles.monthYear,
          {
            color: isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {currentMonth.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </Text>

      <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={
            isDark
              ? theme.colors.grayPalette[100]
              : theme.colors.grayPalette[600]
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderDayHeaders = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <View style={styles.dayHeadersContainer}>
        {days.map((day) => (
          <View key={day} style={[styles.dayHeader, { width: cellWidth }]}>
            <Text
              style={[
                styles.dayHeaderText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[400]
                    : theme.colors.grayPalette[600],
                },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    const cells = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

      if (isValidDay) {
        const date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          dayNumber
        );
        const blocked = isDateBlocked(date);
        const inBookingRange = isDateInBookingRange(date);
        const selected = isDateSelected(date);
        const inRange = isDateInSelectedRange(date);

        cells.push(
          <TouchableOpacity
            key={i}
            style={[
              styles.dayCell,
              { width: cellWidth, height: cellWidth },
              selected && { backgroundColor: theme.colors.primary },
              inRange && { backgroundColor: `${theme.colors.primary}30` },
              blocked && {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[200],
              },
              inBookingRange && { backgroundColor: theme.colors.warning },
            ]}
            onPress={() => handleDatePress(date)}
            disabled={blocked || inBookingRange}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[100]
                    : theme.colors.grayPalette[900],
                },
                selected && { color: theme.colors.white },
                inRange && { color: theme.colors.primary },
                blocked && {
                  color: isDark
                    ? theme.colors.grayPalette[600]
                    : theme.colors.grayPalette[400],
                },
                inBookingRange && { color: theme.colors.white },
              ]}
            >
              {dayNumber}
            </Text>
          </TouchableOpacity>
        );
      } else {
        cells.push(
          <View
            key={i}
            style={[styles.dayCell, { width: cellWidth, height: cellWidth }]}
          />
        );
      }
    }

    return <View style={styles.calendarGrid}>{cells}</View>;
  };

  const renderLegend = () => (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendColor,
            { backgroundColor: theme.colors.primary },
          ]}
        />
        <Text
          style={[
            styles.legendText,
            {
              color: isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          Selected
        </Text>
      </View>

      {bookingRanges.length > 0 && (
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: theme.colors.warning },
            ]}
          />
          <Text
            style={[
              styles.legendText,
              {
                color: isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            Booked
          </Text>
        </View>
      )}

      <View style={styles.legendItem}>
        <View
          style={[
            styles.legendColor,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[300],
            },
          ]}
        />
        <Text
          style={[
            styles.legendText,
            {
              color: isDark
                ? theme.colors.grayPalette[300]
                : theme.colors.grayPalette[600],
            },
          ]}
        >
          Unavailable
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.grayPalette[800]
            : theme.colors.white,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCalendarHeader()}
        {renderDayHeaders()}
        {renderCalendarDays()}
        {renderLegend()}

        {selectedRange.start && selectedRange.end && enableRangeSelection && (
          <View
            style={[
              styles.selectionSummary,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[700]
                  : theme.colors.grayPalette[100],
              },
            ]}
          >
            <Text
              style={[
                styles.selectionText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[100]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              Selected: {selectedRange.start.toLocaleDateString()} -{" "}
              {selectedRange.end.toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  monthButton: {
    padding: spacing.sm,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
  },
  dayHeadersContainer: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    margin: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  selectionSummary: {
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.md,
    alignItems: "center",
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Calendar;
