import React, { useState, useCallback, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

// Navigation
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";

// Core
import { fontSize, fontWeight, iconSize, radius, spacing } from "@core/design";
import { useTheme } from "@core/hooks";
import { CalendarBookingData } from "@core/types";

// Features
import { YearGrid } from "@features/calendar/components/YearGrid";
import { MonthView } from "@features/calendar/components/MonthView";
import { EditOverlay } from "@features/calendar/components/EditOverlay";
import { PropertyHeader } from "@features/calendar/components/PropertyHeader";
import { useProperty, Property } from "@features/calendar/hooks/useProperty";
import { WithSetupCheck } from "@features/host/components/setup";

// Shared
import { Container, Text, Icon, Button } from "@shared/components";
import { TouchableOpacity } from "react-native";
import { Screen } from "@shared/components/layout/Screen";

type ViewMode = "year" | "month";

// Inner component that uses property context
function CalendarScreenInner() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedProperty, properties, setSelectedProperty } = useProperty();

  // Handle property selection from URL parameters
  useEffect(() => {
    if (params.propertyId && typeof params.propertyId === "string") {
      const property = properties.find((p) => p.id === params.propertyId);
      if (
        property &&
        (!selectedProperty || selectedProperty.id !== property.id)
      ) {
        console.log(
          "🎯 CalendarScreen: Setting property from URL params",
          property.id
        );
        setSelectedProperty(property);
      }
    }
  }, [params.propertyId, properties, selectedProperty, setSelectedProperty]);

  console.log("🏠 CalendarScreen: Property context state", {
    selectedProperty,
    propertiesCount: properties.length,
    properties: properties.map((p) => ({ id: p.id, name: p.name })),
  });

  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [currentYear] = useState(2025);

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
  const handleMonthPress = useCallback(
    (month: Date) => {
      if (!month || !(month instanceof Date) || isNaN(month.getTime())) {
        console.warn(t("calendar.error.invalidMonth"), month);
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
    },
    [t]
  );
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
    // Navigate to the property selection screen using the [propertyId] route
    router.push("/(tabs)/host/calendar/property/");
  }, [router]);

  // Create header configuration for Screen component
  const headerConfig = {
    left: {
      children: (
        <TouchableOpacity
          onPress={handlePropertyHeaderPress}
          activeOpacity={0.7}
        >
          <Container flexDirection="row" alignItems="center" style={{ gap: 6 }}>
            <Icon name="home-outline" size={20} color={theme.text.primary} />
            <Text
              variant="body"
              weight="medium"
              numberOfLines={1}
              style={{ maxWidth: 160, marginLeft: 4 }}
            >
              {selectedProperty?.name || t("calendar.selectProperty")}
            </Text>
            <Icon
              name="chevron-down"
              size="xs"
              color={theme.text.secondary}
              style={{ marginLeft: 2 }}
            />
          </Container>
        </TouchableOpacity>
      ),
    },
    right: {
      icon: (viewMode === "year" ? "calendar-outline" : "grid-outline") as
        | "calendar-outline"
        | "grid-outline",
      onPress: handleViewToggle,
      accessibilityLabel: t("calendar.viewModeToggle"),
      showDivider: false,
    },
    showDivider: true,
  };

  return (
    <Screen
      backgroundColor={theme.background}
      header={{
        ...headerConfig,
        showDivider: false,
      }}
      padding="none"
    >
      {/* Animated Title Section - Only show for year view */}
      {viewMode === "year" && (
        <Container
          flex={0}
          style={{
            zIndex: 10,
            minHeight: 60,
            position: "relative",
          }}
          marginBottom="lg"
        >
          <Animated.View
            style={[
              {
                position: "absolute",
              },
              animatedStyle,
            ]}
          >
            <Text
              variant="h1"
              weight="bold"
              color="#333"
              align="left"
              style={{
                padding: spacing.lg,
              }}
            >
              {getYearTitle()}
            </Text>
          </Animated.View>
        </Container>
      )}
      {/* Calendar Container with conditional rendering */}
      <Container
        flex={1}
        style={{
          position: "relative",
        }}
      >
        <Animated.View
          style={[
            {
              flex: 1,
            },
            animatedStyle,
          ]}
        >
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
      </Container>
      {/* Edit Overlay - Independent Component */}
      <EditOverlay
        isVisible={isEditOverlayVisible}
        onClose={handleEditOverlayClose}
        selectedDaysCount={3}
      />
    </Screen>
  );
}

// Main component that provides property context
export default function CalendarScreen() {
  const { t } = useTranslation();

  return (
    <WithSetupCheck
      promptVariant="default"
      promptTitle={t("host.setup.calendarPromptTitle")}
      promptMessage={t("host.setup.calendarPromptMessage")}
    >
      <CalendarScreenInner />
    </WithSetupCheck>
  );
}
