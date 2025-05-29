/**
 * Search Date Modal for selecting check-in and check-out dates
 */

// React imports
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Third-party libraries
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import { format, addDays, differenceInDays } from "date-fns";

// App context
import { useTheme } from "@common-context/ThemeContext";
import { useDateSelection } from "@common-context/DateSelectionContext";

// App components
import BottomSheetModal from "@common-components/BottomSheetModal";

// App hooks
import { useSearchForm } from "@common-hooks/useSearchForm";

// App constants
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

type DateType = {
  timestamp: number;
  dateString: string;
  day: number;
  month: number;
  year: number;
};

export default function SearchDateModal() {
  const { theme, isDark } = useTheme();
  const params = useLocalSearchParams();
  const { searchState, updateSearchState } = useSearchForm();
  const { selectDatesForProperty } = useDateSelection();

  // Check if this is for a specific property
  const propertyId = params.propertyId as string;
  const returnTo = params.returnTo as string;
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
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  // Calculate number of nights
  const nights = differenceInDays(new Date(endDate), new Date(startDate));

  const getMarkedDates = () => {
    const result: any = {};

    if (startDate) {
      result[startDate] = {
        startingDay: true,
        color: theme.colors.primary,
        textColor: "white",
      };
    }

    // If we have both dates, fill the range
    if (startDate && endDate) {
      // Add middle days
      const start = new Date(startDate);
      const end = new Date(endDate);
      let currentDate = addDays(start, 1);

      while (currentDate < end) {
        const dateString = format(currentDate, "yyyy-MM-dd");
        result[dateString] = {
          color: theme.colors.primaryPalette[200],
          textColor: isDark
            ? theme.colors.grayPalette[900]
            : theme.colors.grayPalette[900],
        };
        currentDate = addDays(currentDate, 1);
      }

      // End date
      result[endDate] = {
        endingDay: true,
        color: theme.colors.primary,
        textColor: "white",
      };
    }

    return result;
  };

  const handleDayPress = (day: DateType) => {
    const selectedDate = day.dateString;

    if (selecting === "start") {
      setStartDate(selectedDate);
      // If the selected start date is after the current end date,
      // reset the end date to be the day after
      if (new Date(selectedDate) >= new Date(endDate)) {
        const newEndDate = format(
          addDays(new Date(selectedDate), 1),
          "yyyy-MM-dd"
        );
        setEndDate(newEndDate);
      }
      setSelecting("end");
    } else {
      // Make sure end date isn't before start date
      if (new Date(selectedDate) <= new Date(startDate)) {
        // If the selected end date is before the start date, swap them
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setSelecting("start");
    }
  };
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
              selecting === "start"
                ? {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  }
                : {
                    borderColor: isDark
                      ? theme.colors.grayPalette[700]
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
                    : theme.colors.grayPalette[900],
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
              selecting === "end"
                ? {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  }
                : {
                    borderColor: isDark
                      ? theme.colors.grayPalette[700]
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
                    : theme.colors.grayPalette[900],
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
          onDayPress={handleDayPress}
          markedDates={getMarkedDates()}
          minDate={format(today, "yyyy-MM-dd")}
          enableSwipeMonths={true}
          markingType="period"
          theme={{
            calendarBackground: isDark ? theme.colors.gray[800] : "#FFFFFF",
            textSectionTitleColor: isDark
              ? theme.colors.gray[300]
              : theme.colors.gray[600],
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: theme.colors.white,
            todayTextColor: theme.colors.primary,
            dayTextColor: isDark
              ? theme.colors.white
              : theme.colors.grayPalette[900],
            textDisabledColor: isDark
              ? theme.colors.gray[600]
              : theme.colors.gray[400],
            arrowColor: theme.colors.primary,
            monthTextColor: isDark
              ? theme.colors.white
              : theme.colors.grayPalette[900],
            textMonthFontWeight: "600",
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
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
                      ? theme.colors.grayPalette[700]
                      : theme.colors.gray[200],
                  },
                ]}
                onPress={() => {
                  const newStartDate = format(start, "yyyy-MM-dd");
                  const newEndDate = format(end, "yyyy-MM-dd");
                  setStartDate(newStartDate);
                  setEndDate(newEndDate);
                  setSelecting("start");
                }}
              >
                <Text
                  style={[
                    styles.quickSelectText,
                    {
                      color: isDark
                        ? theme.colors.white
                        : theme.colors.grayPalette[900],
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
