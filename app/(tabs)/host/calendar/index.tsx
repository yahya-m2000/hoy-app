import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Navigation
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

// Core
import { fontSize, fontWeight, iconSize, radius, spacing } from "@core/design";
import { useTheme } from "@core/hooks";
import { CalendarBookingData } from "@core/types";

// Features
import { YearGrid } from "@features/calendar/components/YearGrid";
import { MonthView } from "@features/calendar/components/MonthView";
import { EditOverlay } from "@features/calendar/components/EditOverlay";
import { PropertyHeader } from "@features/calendar/components/PropertyHeader";
import PropertySelectorModal from "@features/calendar/components/PropertySelectorModal";
import {
  PropertyProvider,
  useProperty,
  Property,
} from "@features/calendar/hooks/useProperty";

// Shared
import { Icon, Text } from "@shared/components";

type ViewMode = "year" | "month";

// Inner component that uses property context
function CalendarScreenInner() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const { selectedProperty, properties, setSelectedProperty } = useProperty();

  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [currentYear] = useState(2025);
  const [isPropertySelectorVisible, setIsPropertySelectorVisible] =
    useState(false);

  // Get current month dynamically
  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isEditOverlayVisible, setIsEditOverlayVisible] = useState(false);
  // Simple transition state like AnimatedContainer
  const [isCurrentViewExiting, setIsCurrentViewExiting] = useState(false);

  // Animation values like AnimatedContainer
  const opacity = useSharedValue(1);

  // Centralized transition duration
  const TRANSITION_DURATION = 300;

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Exit animation when transitioning (like AnimatedContainer)
  React.useEffect(() => {
    if (isCurrentViewExiting) {
      opacity.value = withTiming(0, {
        duration: TRANSITION_DURATION,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isCurrentViewExiting, opacity]);

  // Fade in animation on view mode change (like AnimatedContainer mount)
  React.useEffect(() => {
    if (!isCurrentViewExiting) {
      opacity.value = withTiming(1, {
        duration: TRANSITION_DURATION,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [viewMode, isCurrentViewExiting, opacity]);

  // Handle edit mode toggle - now opens overlay
  const handleEditPress = useCallback(() => {
    setIsEditOverlayVisible(true);
  }, []);

  // Handle edit overlay close
  const handleEditOverlayClose = useCallback(() => {
    setIsEditOverlayVisible(false);
  }, []);
  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      if (newViewMode === viewMode) return;

      // Start exit animation for current view
      setIsCurrentViewExiting(true);
      // After exit animation, switch view mode
      setTimeout(() => {
        setViewMode(newViewMode);
        setIsCurrentViewExiting(false); // This will trigger fade-in
      }, TRANSITION_DURATION); // Match exit animation duration
    },
    [viewMode]
  );

  // Handle view mode toggle
  const handleViewToggle = useCallback(() => {
    const newViewMode = viewMode === "year" ? "month" : "year";
    handleViewModeChange(newViewMode);
  }, [viewMode, handleViewModeChange]);

  // Memoise handlers to prevent unnecessary re-renders
  const handleMonthPress = useCallback((month: Date) => {
    if (!month || !(month instanceof Date) || isNaN(month.getTime())) {
      console.warn("handleMonthPress: Invalid month provided", month);
      return; // Safety check
    }

    setCurrentMonth(month);
    // Start exit animation for year view
    setIsCurrentViewExiting(true);
    // After exit animation, switch to month view
    setTimeout(() => {
      setViewMode("month");
      setIsCurrentViewExiting(false); // This will trigger fade-in
    }, TRANSITION_DURATION); // Match exit animation duration
  }, []);
  const handleBookingPress = useCallback(
    (booking: CalendarBookingData) => {
      // Navigate to booking details screen with booking ID
      router.push(`/(tabs)/host/calendar/${booking.id}`);
    },
    [router]
  );

  // Helper functions for title formatting
  const getYearTitle = useCallback(() => {
    return currentYear.toString();
  }, [currentYear]);
  // Handle month change from MonthView scroll
  const handleCurrentMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []); // Handle property selector
  const handlePropertyHeaderPress = useCallback(() => {
    setIsPropertySelectorVisible(true);
  }, []);

  const handlePropertySelectorClose = useCallback(() => {
    setIsPropertySelectorVisible(false);
  }, []);

  const handlePropertySelect = useCallback(
    (property: Property) => {
      setSelectedProperty(property);
    },
    [setSelectedProperty]
  );

  // Set up header button
  useEffect(() => {
    try {
      navigation.setOptions({
        headerLeft: () => {
          return (
            <PropertyHeader
              propertyName={selectedProperty?.name || "Select Property"}
              propertyType={selectedProperty?.type || "house"}
              onPress={handlePropertyHeaderPress}
            />
          );
        },
        headerRight: () => {
          return (
            <View style={styles.headerButtons}>
              {/* Edit and View toggle buttons */}
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  handleEditPress();
                }}
              >
                <Icon
                  name="create-outline"
                  size={iconSize.md}
                  color={theme.colors.black}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => {
                  handleViewToggle();
                }}
              >
                <Icon
                  name={
                    viewMode === "year" ? "calendar-outline" : "grid-outline"
                  }
                  size={iconSize.md}
                  color={theme.colors.black}
                />
              </TouchableOpacity>
            </View>
          );
        },
      });
    } catch (error) {
      console.error("Error setting navigation options:", error);
    }
  }, [
    navigation,
    handleEditPress,
    handleViewToggle,
    viewMode,
    theme,
    handlePropertyHeaderPress,
    selectedProperty,
  ]);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Title Section - Only show for year view */}
      {viewMode === "year" && (
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.titleWrapper, animatedStyle]}>
            <Text style={styles.title}>{getYearTitle()}</Text>
          </Animated.View>
        </View>
      )}
      {/* Calendar Container with conditional rendering */}
      <View style={styles.calendarContainer}>
        <Animated.View style={[styles.viewContainer, animatedStyle]}>
          {viewMode === "year" && (
            <YearGrid
              key={`year-${currentYear}-${selectedProperty?.id || "all"}`}
              year={currentYear}
              onMonthPress={handleMonthPress}
              propertyId={selectedProperty?.id}
              // @ts-ignore
              selectedMonth={viewMode === "month" ? currentMonth : undefined}
            />
          )}
          {viewMode === "month" && (
            <MonthView
              key={`month-${currentMonth?.getFullYear()}-${currentMonth?.getMonth()}-${
                selectedProperty?.id || "all"
              }`}
              currentMonth={currentMonth}
              onBookingPress={handleBookingPress}
              onCurrentMonthChange={handleCurrentMonthChange}
              propertyId={selectedProperty?.id}
              hideHeader={true} // Hide the month view header since we're using shared header
            />
          )}
        </Animated.View>
      </View>
      {/* Edit Overlay - Independent Component */}
      <EditOverlay
        isVisible={isEditOverlayVisible}
        onClose={handleEditOverlayClose}
        selectedDaysCount={3}
      />
      {/* Property Selector Modal */}
      <PropertySelectorModal
        isVisible={isPropertySelectorVisible}
        onClose={handlePropertySelectorClose}
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertySelect={handlePropertySelect}
      />
    </View>
  );
}

// Main component that provides property context
export default function CalendarScreen() {
  return (
    <PropertyProvider>
      <CalendarScreenInner />
    </PropertyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
  },
  titleContainer: {
    // Child 1: Title section
    flex: 0,
    zIndex: 10,
    minHeight: 60,
    position: "relative",
  },
  titleWrapper: {
    position: "absolute",
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    padding: spacing.lg,
    color: "#333",
    textAlign: "left",
  },
  viewContainer: {
    // Animated view containers within calendar
    flex: 1,
  },
  calendarContainer: {
    // Child 2: Calendar section
    flex: 1,
    position: "relative", // Allow absolute positioning of children
  },
  settingsContent: {
    padding: spacing.lg,
  },
  settingsLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    color: "#333",
  },
  viewModeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  viewModeOptionActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  viewModeText: {
    fontSize: fontSize.md,
    color: "#333",
    flex: 1,
  },
  viewModeTextActive: {
    color: "#007AFF",
    fontWeight: fontWeight.semibold,
  },
  viewModeTextDisabled: {
    color: "#999",
  },
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 20,
  },
  bottomSheetModal: {
    zIndex: 10000,
    elevation: 10000, // For Android
  },
  settingsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    marginBottom: spacing.lg,
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerButton: {
    // padding: spacing.lg, // Larger touch area
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    minWidth: 44, // iOS Human Interface Guidelines minimum touch target
    minHeight: 44,
    alignItems: "center", // Center the icons
    justifyContent: "center",
  },
});
