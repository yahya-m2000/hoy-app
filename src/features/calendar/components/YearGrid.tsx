import React, { useMemo, useCallback } from "react";
import { FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { MonthThumbnail } from "./MonthThumbnail";
import { generateYearData, MonthData } from "../utils/dateUtils";
import { spacing } from "@core/design";
import { Container, Text } from "@shared/components";
import { useProperty } from "@features/calendar/hooks/useProperty";

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
  const { selectedProperty } = useProperty();

  console.log("📅 YearGrid: Rendering with props", {
    year,
    propertyId,
    isLoading,
    selectedMonth: selectedMonth?.toISOString(),
  });

  // Memoize year data generation
  const [yearData, setYearData] = React.useState<MonthData[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      const data = await generateYearData(year, selectedProperty?.id);
      if (isMounted) {
        setYearData(data);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [year, selectedProperty]);
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
        <Container width="33%" marginBottom="lg">
          <MonthThumbnail
            monthData={monthData}
            onPress={handleMonthPress}
            propertyId={propertyId}
          />
        </Container>
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
  if (loading) {
    return (
      <Container flex={1} justifyContent="center" alignItems="center">
        <Text>Loading...</Text>
      </Container>
    );
  }
  return (
    <Container flex={1}>
      {/* Grid using FlatList for better performance */}
      <Container flex={1}>
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
          contentContainerStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        />
      </Container>
    </Container>
  );
};

// Export component with display name
YearGridComponent.displayName = "YearGrid";
export const YearGrid = YearGridComponent;
