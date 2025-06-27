/**
 * Search Date Modal for selecting check-in and check-out dates
 */

// React imports
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";

// Third-party libraries
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { format, addDays, differenceInDays } from "date-fns";

// App context
import { useTheme, useDateSelection } from "@shared/context";
// App components
import { Calendar, BottomSheetModal } from "@shared/components";

// App hooks
import { useSearchForm } from "@shared/hooks";

// App constants
import { fontSize, spacing, radius } from "@shared/constants";

export default function SearchDateModal() {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams();
  const { searchState, updateSearchState } = useSearchForm();
  const { selectDatesForProperty } = useDateSelection();
  // Check if this is for a specific property
  const propertyId = params.propertyId as string;
  const isPropertyContext = !!propertyId;

  // Format today and tomorrow dates
  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Use values from the search form state, fall back to URL params, then to defaults
  const initialStartDate =
    (searchState.startDate && typeof searchState.startDate === "string"
      ? searchState.startDate
      : searchState.startDate
      ? format(new Date(searchState.startDate), "yyyy-MM-dd")
      : null) ||
    (typeof params.startDate === "string"
      ? params.startDate
      : format(today, "yyyy-MM-dd"));

  const initialEndDate =
    (searchState.endDate && typeof searchState.endDate === "string"
      ? searchState.endDate
      : searchState.endDate
      ? format(new Date(searchState.endDate), "yyyy-MM-dd")
      : null) ||
    (typeof params.endDate === "string"
      ? params.endDate
      : format(tomorrow, "yyyy-MM-dd"));
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  // Calculate number of nights
  const nights = differenceInDays(new Date(endDate), new Date(startDate));

  const handleApply = () => {
    // Format the dates for display
    const formattedStart = format(new Date(startDate), "MMM dd");
    const formattedEnd = format(new Date(endDate), "MMM dd");
    const displayDates = `${formattedStart} - ${formattedEnd}`;
    if (isPropertyContext && propertyId) {
      // Property context: update dates for specific property and return to property details
      selectDatesForProperty(propertyId, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      // Go back to the property details page
      router.back();
    } else {
      // Search context: update search state and navigate to search
      updateSearchState({
        startDate,
        endDate,
        displayDates,
        nights,
      });

      // First go back to dismiss the modal properly
      router.back();
      // Then use setTimeout to ensure the modal is fully dismissed before navigating
      setTimeout(() => {
        router.replace({
          pathname: "traveler/search",
          params: {
            startDate: startDate,
            endDate: endDate,
            displayDates: displayDates,
            nights: (nights > 0 ? nights : 1).toString(),
          },
        });
      }, 100);
    }
  };

  return (
    <BottomSheetModal
      title={"Select Dates"}
      saveText={"Apply"}
      onSave={handleApply}
    >
      <View style={styles.container}>
        {/* Date selection info */}
        <View style={styles.dateInfoContainer}>
          <View
            style={[
              styles.dateBox,
              {
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.dateLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Check In
            </Text>
            <Text
              style={[
                styles.dateValue,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {format(new Date(startDate), "E, MMM d")}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
            />
          </View>
          <View
            style={[
              styles.dateBox,
              {
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.dateLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              Check Out
            </Text>
            <Text
              style={[
                styles.dateValue,
                {
                  color: isDark
                    ? theme.colors.gray[50]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {format(new Date(endDate), "E, MMM d")}
            </Text>
          </View>
        </View>
        {/* Nights count */}
        <View style={styles.nightsContainer}>
          <Text
            style={[
              styles.nightsText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {nights} {nights === 1 ? "night" : "nights"}
          </Text>
        </View>
        {/* Calendar */}
        <Calendar
          enableRangeSelection={true}
          initialStartDate={new Date(startDate)}
          initialEndDate={new Date(endDate)}
          minDate={today}
          onDateSelect={(start: Date, end?: Date) => {
            setStartDate(format(start, "yyyy-MM-dd"));
            if (end) {
              setEndDate(format(end, "yyyy-MM-dd"));
            }
          }}
        />
        {/* Quick selection buttons */}
        <View style={styles.quickSelectContainer}>
          {[0, 2, 7, 14].map((days) => {
            const start = new Date();
            const end = addDays(start, days);
            const label =
              days === 0 ? "Today" : days === 2 ? "Weekend" : `${days} days`;

            return (
              <TouchableOpacity
                key={days}
                style={[
                  styles.quickSelectButton,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[200],
                  },
                ]}
                onPress={() => {
                  const newStartDate = format(start, "yyyy-MM-dd");
                  const newEndDate = format(end, "yyyy-MM-dd");
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                }}
              >
                <Text
                  style={[
                    styles.quickSelectText,
                    {
                      color: isDark
                        ? theme.colors.white
                        : theme.colors.gray[900],
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dateBox: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  arrowContainer: {
    paddingHorizontal: spacing.sm,
  },
  nightsContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  nightsText: {
    fontSize: fontSize.sm,
  },
  quickSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  quickSelectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  quickSelectText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
});
