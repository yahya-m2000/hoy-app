/**
 * Host Calendar Page
 * Main calendar page for hosts to manage property availability and pricing
 */

import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import HostCalendar from "./HostCalendar";
import CalendarSelectionActionBar from "./CalendarSelectionActionBar";
import PriceEditModal from "./PriceEditModal";
import CustomSettingsModal, { CustomSettings } from "./CustomSettingsModal";
import {
  usePropertyCalendar,
  useCalendarMutations,
} from "../../hooks/useHostCalendar";
import { CalendarUpdateRequest } from "../../types/calendar";

interface HostCalendarPageProps {
  propertyId: string;
  propertyName?: string;
}

const HostCalendarPage: React.FC<HostCalendarPageProps> = ({
  propertyId,
  propertyName = "Property",
}) => {
  const theme = useTheme();
  // Calendar data
  const { data: calendarData, error } = usePropertyCalendar(propertyId);

  // Mutations
  const { updateCalendar, updateAvailability, updatePricing } =
    useCalendarMutations(propertyId);

  // Selection state
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isRangeSelection, setIsRangeSelection] = useState(false);

  // Modal state
  const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
  const [isCustomSettingsModalVisible, setIsCustomSettingsModalVisible] =
    useState(false);

  // Selected dates info
  const selectedDaysData = useMemo(() => {
    if (!calendarData || selectedDates.length === 0) return null;

    const allDays = calendarData.months.flatMap((month) => month.days);
    return selectedDates
      .map((date) => allDays.find((day) => day.date === date))
      .filter(Boolean);
  }, [calendarData, selectedDates]);

  const isSelectionAvailable = useMemo(() => {
    return selectedDaysData?.every((day) => day?.isAvailable) ?? true;
  }, [selectedDaysData]);

  const currentPrice = useMemo(() => {
    if (!selectedDaysData || selectedDaysData.length === 0) {
      return calendarData?.basePrice || 100;
    }

    // Return the price of the first selected day, or base price
    return (
      selectedDaysData[0]?.customPrice ||
      selectedDaysData[0]?.price ||
      calendarData?.basePrice ||
      100
    );
  }, [selectedDaysData, calendarData]);

  const currentSettings = useMemo((): CustomSettings => {
    if (!selectedDaysData || selectedDaysData.length === 0) {
      return {
        minimumNights: calendarData?.minimumNights || 1,
        advanceNotice: calendarData?.advanceNotice || 0,
        promotionPercentage: undefined,
        allowInstantBook: false,
      };
    }

    const firstDay = selectedDaysData[0];
    return {
      minimumNights:
        firstDay?.minimumNights || calendarData?.minimumNights || 1,
      advanceNotice: undefined, // Not implemented per day
      promotionPercentage: firstDay?.promotionPercentage,
      allowInstantBook: false, // Not implemented
    };
  }, [selectedDaysData, calendarData]);

  // Event handlers
  const handleDatePress = useCallback(
    (date: string) => {
      setSelectedDates((prev) => {
        if (prev.includes(date)) {
          // Deselect if already selected
          return prev.filter((d) => d !== date);
        }

        if (isRangeSelection && prev.length === 1) {
          // Complete range selection
          const sortedDates = [prev[0], date].sort();
          const startDate = new Date(sortedDates[0]);
          const endDate = new Date(sortedDates[1]);
          const range: string[] = [];

          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            range.push(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setIsRangeSelection(false);
          return range;
        }

        // Start new selection
        return [date];
      });
    },
    [isRangeSelection]
  );

  const handleDateLongPress = useCallback((date: string) => {
    // Start range selection
    setSelectedDates([date]);
    setIsRangeSelection(true);
  }, []);

  const handleCancelSelection = useCallback(() => {
    setSelectedDates([]);
    setIsRangeSelection(false);
  }, []);
  const handleToggleAvailability = useCallback(() => {
    if (selectedDates.length === 0) return;

    // For simplicity, use first and last dates as range
    const sortedDates = [...selectedDates].sort();
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    updateAvailability({
      startDate,
      endDate,
      isAvailable: !isSelectionAvailable,
    });

    handleCancelSelection();
  }, [
    selectedDates,
    isSelectionAvailable,
    updateAvailability,
    handleCancelSelection,
  ]);

  const handlePriceSave = useCallback(
    (newPrice: number) => {
      if (selectedDates.length === 0) return;

      updatePricing({
        dates: selectedDates,
        price: newPrice,
      });

      handleCancelSelection();
    },
    [selectedDates, updatePricing, handleCancelSelection]
  );

  const handleCustomSettingsSave = useCallback(
    (settings: CustomSettings) => {
      if (selectedDates.length === 0) return;

      const updates = selectedDates.map((date) => ({
        date,
        ...(settings.minimumNights && {
          minimumNights: settings.minimumNights,
        }),
        ...(settings.promotionPercentage && {
          promotionPercentage: settings.promotionPercentage,
        }),
      }));

      const updateRequest: CalendarUpdateRequest = {
        propertyId,
        updates,
      };

      updateCalendar(updateRequest);

      handleCancelSelection();
    },
    [selectedDates, propertyId, updateCalendar, handleCancelSelection]
  );

  const handleMonthChange = useCallback((year: number, month: number) => {
    // Optionally fetch data for new month if needed
    console.log(`Calendar changed to ${year}-${month}`);
  }, []);

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.errorContainer}>
          {/* Error handling UI could go here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Main Calendar */}
      <HostCalendar
        propertyId={propertyId}
        calendarData={calendarData?.months}
        onDatePress={handleDatePress}
        onDateLongPress={handleDateLongPress}
        selectedDates={selectedDates}
        isRangeSelection={isRangeSelection}
        onMonthChange={handleMonthChange}
      />

      {/* Selection Action Bar */}
      <CalendarSelectionActionBar
        selectedDates={selectedDates}
        isVisible={selectedDates.length > 0}
        onCancel={handleCancelSelection}
        onToggleAvailability={handleToggleAvailability}
        onEditPrice={() => setIsPriceModalVisible(true)}
        onCustomSettings={() => setIsCustomSettingsModalVisible(true)}
        isAvailable={isSelectionAvailable}
      />

      {/* Price Edit Modal */}
      <PriceEditModal
        isVisible={isPriceModalVisible}
        onClose={() => setIsPriceModalVisible(false)}
        onSave={handlePriceSave}
        currentPrice={currentPrice}
        currency={calendarData?.currency || "USD"}
        selectedDates={selectedDates}
      />

      {/* Custom Settings Modal */}
      <CustomSettingsModal
        isVisible={isCustomSettingsModalVisible}
        onClose={() => setIsCustomSettingsModalVisible(false)}
        onSave={handleCustomSettingsSave}
        currentSettings={currentSettings}
        selectedDates={selectedDates}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
});

export default HostCalendarPage;
