import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MemoizedMonth } from "./MemoizedMonth";
import { formatMonthName, getWeekdayHeaders } from "../utils/dateUtils";
import {
  generateStableMonthsArray,
  generateMonthsData,
  calculateMonthPositions,
  MonthViewData,
} from "../utils/monthDataUtils";
import { useMonthNavigation } from "../hooks";
import { useTheme } from "@core/hooks";
import { fontSize } from "@core/design";
import { CalendarBookingData } from "@core/types";

// Cache for expensive calculations - global cache across all instances
const globalCache = {
  monthsData: null as MonthViewData[] | null,
  monthPositions: null as any,
  styles: null as any | null,
  weekdayHeaders: null as string[] | null,
  screenDimensions: { width: 0, height: 0 },
  monthPositionsCacheKey: "",
};

// Style cache to prevent recreation on every render
const createGlobalStyles = (theme: any, screenWidth: number) => {
  if (
    globalCache.styles &&
    globalCache.screenDimensions.width === screenWidth
  ) {
    return globalCache.styles;
  }

  const calendarPadding = 16;
  const calendarWidth = screenWidth - calendarPadding * 2;
  const dayWidth = calendarWidth / 7;
  const weekdayHeaderHeight = 50;

  globalCache.styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.background,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: fontSize.md,
      color: theme.colors?.blue?.[500] || theme.primary,
    },
    headerTitle: {
      fontSize: fontSize.lg,
      fontWeight: "600",
      color: theme.text?.primary || "#000",
    },
    weekdayHeader: {
      flexDirection: "row",
      paddingHorizontal: calendarPadding,
      paddingVertical: 8,
      backgroundColor: theme.background,
    },
    weekdayText: {
      width: calendarWidth / 7,
      textAlign: "center",
      fontSize: fontSize.xs,
      fontWeight: "500",
      color: theme.text?.secondary || "#666",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: calendarPadding,
    },
    weekdayHeaderFixed: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      paddingVertical: 12,
      backgroundColor: theme.background,
      justifyContent: "center",
      zIndex: 100,
      height: weekdayHeaderHeight,
    },
    weekdayCell: {
      width: dayWidth,
      alignItems: "center",
    },
    weekdayTextFixed: {
      fontSize: fontSize.sm,
      fontWeight: "600",
      color: theme.text?.secondary || "#666",
    },
    monthsScrollContainer: {
      paddingTop: weekdayHeaderHeight,
      paddingHorizontal: calendarPadding,
      alignItems: "center",
      paddingBottom: 30,
    },
  });

  globalCache.screenDimensions = { width: screenWidth, height: 0 };
  return globalCache.styles;
};

interface MonthViewProps {
  currentMonth: Date;
  onBackPress?: () => void;
  onBookingPress: (booking: CalendarBookingData) => void;
  onCurrentMonthChange?: (month: Date) => void;
  hideHeader?: boolean;
  propertyId?: string;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentMonth,
  onBackPress,
  onBookingPress,
  onCurrentMonthChange,
  hideHeader = false,
  propertyId,
}) => {
  // ALL hooks must be called first, in the same order every time - before any early returns
  const themeResult = useTheme();
  const { currentHeaderMonthIndex, setCurrentHeaderMonthIndex } =
    useMonthNavigation(12);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get("window");

  // Create a default fallback theme to prevent undefined access
  const fallbackTheme = {
    background: "#FFFFFF",
    primary: "#007AFF",
    text: { primary: "#000000", secondary: "#666666" },
    colors: { blue: { 500: "#007AFF" }, primary: "#007AFF" },
  };

  const theme = themeResult?.theme || fallbackTheme;

  // Use global cached styles
  const styles = useMemo(
    () => createGlobalStyles(theme, screenWidth),
    [theme, screenWidth]
  ); // Cache expensive calculations globally to avoid recreation
  const months = useMemo(() => {
    // Include propertyId in cache key to ensure fresh data when property changes
    const cacheKey = `months-${propertyId || "all"}`;

    if (
      !globalCache.monthsData ||
      globalCache.monthPositionsCacheKey !== cacheKey
    ) {
      const monthsArray = generateStableMonthsArray();
      globalCache.monthsData = generateMonthsData(monthsArray, propertyId);
      globalCache.monthPositionsCacheKey = cacheKey;
    }
    return globalCache.monthsData;
  }, [propertyId]);

  // Cache weekday headers globally
  const weekdayHeaders = useMemo(() => {
    if (!globalCache.weekdayHeaders) {
      globalCache.weekdayHeaders = getWeekdayHeaders();
    }
    return globalCache.weekdayHeaders;
  }, []);

  // Calculate dimensions once and cache them
  const dimensions = useMemo(() => {
    const calendarPadding = 16;
    const calendarWidth = screenWidth - calendarPadding * 2;
    const dayWidth = calendarWidth / 7;
    const dayHeight = 80;
    const weekdayHeaderHeight = 50;
    const monthSpacing = 30;

    return {
      calendarPadding,
      calendarWidth,
      dayWidth,
      dayHeight,
      weekdayHeaderHeight,
      monthSpacing,
    };
  }, [screenWidth]);

  // Cache month positions
  const monthPositions = useMemo(() => {
    const cacheKey = `${dimensions.dayHeight}_${dimensions.monthSpacing}_${months.length}`;
    if (
      !globalCache.monthPositions ||
      globalCache.monthPositionsCacheKey !== cacheKey
    ) {
      globalCache.monthPositions = calculateMonthPositions(
        months,
        dimensions.dayHeight,
        dimensions.monthSpacing
      );
      globalCache.monthPositionsCacheKey = cacheKey;
    }
    return globalCache.monthPositions;
  }, [months, dimensions.dayHeight, dimensions.monthSpacing]);

  // Optimized booking press handler - memoized to prevent child re-renders
  const handleBookingPress = useCallback(
    (booking: CalendarBookingData) => {
      onBookingPress(booking);
    },
    [onBookingPress]
  );

  // Handle currentMonth prop changes without regenerating months data
  useEffect(() => {
    // Find the index of the currentMonth in our stable months data
    const currentIndex = months.findIndex(
      (monthData) =>
        monthData.month.getFullYear() === currentMonth.getFullYear() &&
        monthData.month.getMonth() === currentMonth.getMonth()
    );

    if (
      currentIndex !== -1 &&
      scrollViewRef.current &&
      monthPositions.length > 0
    ) {
      // Update the state for header display, but do it in a way that doesn't cause flash
      if (currentHeaderMonthIndex !== currentIndex) {
        setCurrentHeaderMonthIndex(currentIndex);
      }

      // Scroll to the current month position
      // Position should show the month title at the top
      const targetPosition = monthPositions[currentIndex]?.position || 0;
      scrollViewRef.current?.scrollTo({
        y: targetPosition,
        animated: false, // Use non-animated scroll to prevent flash
      });
    }
  }, [
    currentMonth,
    months,
    monthPositions,
    currentHeaderMonthIndex,
    setCurrentHeaderMonthIndex,
  ]);

  // Render month with memoization to prevent unnecessary re-renders
  const renderMonth = useCallback(
    (monthData: MonthViewData, index: number) => {
      return (
        <MemoizedMonth
          key={monthData.key}
          monthData={monthData}
          monthIndex={index}
          dayWidth={dimensions.dayWidth}
          dayHeight={dimensions.dayHeight}
          calendarWidth={dimensions.calendarWidth}
          monthSpacing={dimensions.monthSpacing}
          onBookingPress={handleBookingPress}
        />
      );
    },
    [dimensions, handleBookingPress]
  );

  // Safety checks AFTER all hooks are called
  if (!themeResult || !themeResult.theme) {
    console.warn(
      "MonthView: Theme result is undefined or incomplete",
      themeResult
    );
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading theme...</Text>
      </View>
    );
  }

  // Validate the currentMonth prop
  if (
    !currentMonth ||
    !(currentMonth instanceof Date) ||
    isNaN(currentMonth.getTime())
  ) {
    console.warn("MonthView: Invalid currentMonth provided", currentMonth);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Invalid date provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - only shown if not using shared header */}
      {!hideHeader && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Year View</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {formatMonthName(
              months[currentHeaderMonthIndex]?.month || currentMonth
            )}
          </Text>
          <View />
        </View>
      )}

      {/* Fixed Weekday Headers */}
      <View style={styles.weekdayHeaderFixed}>
        {weekdayHeaders.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayTextFixed}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Scrollable Months - Completely free scroll with NO interruptions */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.monthsScrollContainer}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        scrollEventThrottle={16}
        bounces={true}
        bouncesZoom={false}
        directionalLockEnabled={true}
        maximumZoomScale={1}
        minimumZoomScale={1}
        scrollToOverflowEnabled={false}
      >
        {months.map((monthData, index) => renderMonth(monthData, index))}
      </ScrollView>
    </View>
  );
};
