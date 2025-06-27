import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DayMeta, BookingData } from "../utils/dateUtils";
import { useTheme } from "@shared/hooks/useTheme";
import { fontSize, fontWeight, radius, spacing } from "src/shared";

interface DayCellProps {
  day: DayMeta;
  bookings?: BookingData[];
  size: number;
  isSelecting?: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  onPress?: (date: Date) => void;
  onLongPress?: (date: Date) => void;
}

// Global style cache for DayCell to prevent recreation
const dayCellStyleCache = new Map<string, any>();

// Create cached styles for day cells
const createDayCellStyles = (
  theme: any,
  size: number,
  isSelected: boolean,
  isInRange: boolean,
  isCurrentMonth: boolean,
  isToday: boolean
) => {
  const cacheKey = `${
    theme.colors?.primary || theme.primary
  }_${size}_${isSelected}_${isInRange}_${isCurrentMonth}_${isToday}`;

  if (dayCellStyleCache.has(cacheKey)) {
    return dayCellStyleCache.get(cacheKey);
  }

  const styles = StyleSheet.create({
    cell: {
      width: size,
      height: 80, // Make it slightly taller
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.md,
      backgroundColor: isSelected
        ? theme.colors?.primary || theme.primary
        : isInRange
        ? theme.primaryLight || theme.primary + "20"
        : theme.background,
      borderRadius: radius.md, // Add border radius
      borderWidth: 1, // Add border
      borderColor: isCurrentMonth ? theme.border || "#ddd" : "transparent", // Gray out non-current month days with no border
      marginHorizontal: 1,
      marginVertical: 1,
    },
    dayNumber: {
      fontSize: fontSize.md,
      fontWeight: isToday ? fontWeight.bold : fontWeight.normal,
      color: !isCurrentMonth
        ? theme.text?.disabled || "#999" // Gray out non-current month dates
        : isToday
        ? theme.colors?.primary || theme.primary
        : isSelected
        ? theme.white || "#fff"
        : theme.text?.primary || "#000",
      textAlign: "center",
    },
    price: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      color: !isCurrentMonth
        ? theme.text?.disabled || "#999" // Gray out price for non-current month
        : theme.text?.secondary || "#666",
      textAlign: "center",
    },
    todayIndicator: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors?.primary || theme.primary,
    },
    cellDisabled: {
      opacity: 0.3,
    },
  });

  dayCellStyleCache.set(cacheKey, styles);
  return styles;
};

// Custom comparison function for better memoization
const areDayCellPropsEqual = (
  prevProps: DayCellProps,
  nextProps: DayCellProps
) => {
  // Compare day by reference first (most common change)
  if (prevProps.day !== nextProps.day) {
    return false;
  }

  // Compare size
  if (prevProps.size !== nextProps.size) {
    return false;
  }

  // Compare boolean flags
  if (
    prevProps.isSelecting !== nextProps.isSelecting ||
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.isInRange !== nextProps.isInRange ||
    prevProps.isRangeStart !== nextProps.isRangeStart ||
    prevProps.isRangeEnd !== nextProps.isRangeEnd
  ) {
    return false;
  }

  // Compare callbacks by reference
  if (
    prevProps.onPress !== nextProps.onPress ||
    prevProps.onLongPress !== nextProps.onLongPress
  ) {
    return false;
  }

  // Compare bookings by reference (should be stable)
  if (prevProps.bookings !== nextProps.bookings) {
    return false;
  }

  return true;
};

const DayCellComponent: React.FC<DayCellProps> = React.memo(
  ({
    day,
    size,
    bookings,
    isSelecting = false,
    isSelected = false,
    isInRange = false,
    isRangeStart = false,
    isRangeEnd = false,
    onPress,
    onLongPress,
  }) => {
    const themeResult = useTheme();

    // Create a fallback theme to prevent undefined access errors
    const fallbackTheme = {
      colors: { primary: "#007AFF" },
      primary: "#007AFF",
      primaryLight: "#E3F2FD",
      background: "#FFFFFF",
      border: "#ddd",
      text: { primary: "#000", secondary: "#666", disabled: "#999" },
      white: "#fff",
    };

    const theme = themeResult?.theme || fallbackTheme;

    // All hooks must be called before any early returns
    // Memoize style calculations
    const styles = useMemo(
      () =>
        createDayCellStyles(
          theme,
          size,
          isSelected,
          isInRange,
          day?.isCurrentMonth || false,
          day?.isToday || false
        ),
      [theme, size, isSelected, isInRange, day?.isCurrentMonth, day?.isToday]
    );

    // Memoized handlers to prevent recreation
    const handlePress = useCallback(() => {
      // Disabled for now - edit mode will be handled differently
      // if (onPress && day.isCurrentMonth && day.date) {
      //   onPress(day.date);
      // }
    }, []);

    const handleLongPress = useCallback(() => {
      if (onLongPress && day?.isCurrentMonth && day?.date) {
        onLongPress(day.date);
      }
    }, [onLongPress, day?.isCurrentMonth, day?.date]);

    // Memoized day number to prevent recalculation
    const dayNumber = useMemo(() => day?.date?.getDate() || 0, [day?.date]);

    // Memoized price to prevent formatting recalculation
    const formattedPrice = useMemo(() => {
      if (!day?.isCurrentMonth || !day?.price) return null;
      return `$${day.price}`;
    }, [day?.isCurrentMonth, day?.price]);

    // Memoized cell content to prevent recreation
    const cellContent = useMemo(
      () => (
        <>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          {formattedPrice && <Text style={styles.price}>{formattedPrice}</Text>}
          {day?.isToday && <View style={styles.todayIndicator} />}
        </>
      ),
      [styles, dayNumber, formattedPrice, day?.isToday]
    );

    // Early return for invalid dates AFTER all hooks
    if (
      !day ||
      !day.date ||
      !(day.date instanceof Date) ||
      isNaN(day.date.getTime())
    ) {
      return (
        <View style={{ width: size, height: size }}>
          <Text style={{ fontSize: 12, color: "red" }}>Invalid</Text>
        </View>
      );
    }

    // Conditional TouchableOpacity vs View for performance
    if (onPress || onLongPress) {
      return (
        <TouchableOpacity
          style={[styles.cell, !day.isCurrentMonth && styles.cellDisabled]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          disabled={!day.isCurrentMonth}
        >
          {cellContent}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.cell, !day.isCurrentMonth && styles.cellDisabled]}>
        {cellContent}
      </View>
    );
  },
  areDayCellPropsEqual
);

// Set display name for debugging
DayCellComponent.displayName = "DayCell";

export const DayCell = DayCellComponent;
