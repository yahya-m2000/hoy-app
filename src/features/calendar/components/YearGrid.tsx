import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { MonthThumbnail } from "./MonthThumbnail";
import { generateYearData, MonthData } from "../utils/dateUtils";
import { spacing } from "@core/design";

interface YearGridProps {
  year: number;
  onMonthPress: (month: Date) => void;
  onBackPress?: () => void;
  selectedMonth?: Date | null;
  propertyId?: string;
  isLoading?: boolean;
}

const YearGridComponent: React.FC<YearGridProps> = ({
  year,
  onMonthPress,
  onBackPress,
  selectedMonth,
  propertyId,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  console.log("📅 YearGrid: Rendering with props", {
    year,
    propertyId,
    isLoading,
    selectedMonth: selectedMonth?.toISOString(),
  });

  // Memoize year data generation
  const yearData = useMemo(
    () => generateYearData(year, propertyId),
    [year, propertyId]
  );
  // Memoize the month press handler to prevent unnecessary re-renders of MonthThumbnails
  const handleMonthPress = useCallback(
    (month: Date) => {
      if (!month) return; // Safety check
      onMonthPress(month);
    },
    [onMonthPress]
  ); // Memoize the render function for FlatList
  const renderMonth = useCallback(
    ({ item: monthData }: { item: MonthData }) => {
      // Get month index and create translation key
      const monthIndex = monthData.month.getMonth();
      const monthKeys = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const monthKey = monthKeys[monthIndex];
      const translationKey = `calendar.months.${monthKey}`;
      const translatedMonthName = t(translationKey);
      const year = monthData.month.getFullYear();

      console.log("🗓️ YearGrid: Rendering MonthThumbnail", {
        month: monthData.month.toISOString(),
        propertyId,
        monthName: `${translatedMonthName} ${year}`,
      });

      return (
        <View style={styles.monthContainer}>
          <MonthThumbnail
            monthData={monthData}
            onPress={handleMonthPress}
            propertyId={propertyId}
          />
        </View>
      );
    },
    [handleMonthPress, propertyId, t]
  );

  // Memoize the key extractor
  const keyExtractor = useCallback(
    (monthData: MonthData) =>
      `${monthData.month.getFullYear()}-${monthData.month.getMonth()}`,
    []
  );
  return (
    <View style={styles.container}>
      {/* Grid using FlatList for better performance */}
      <View style={styles.gridContainer}>
        <FlatList
          data={yearData}
          renderItem={renderMonth}
          keyExtractor={keyExtractor}
          numColumns={3}
          initialNumToRender={6}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 160, // monthContainer height + marginBottom
            offset: 160 * Math.floor(index / 3),
            index,
          })}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
  },
  flatListContent: {
    justifyContent: "space-between",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthContainer: {
    width: "33%",
    marginBottom: spacing.lg,
  },
});

// Export component with display name
YearGridComponent.displayName = "YearGrid";
export const YearGrid = YearGridComponent;
