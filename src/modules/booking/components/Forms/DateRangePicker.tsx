/**
 * Date Range Picker component for the Hoy application
 * Allows users to select check-in and check-out dates
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// import { useTranslation } from "react-i18next";
import { Calendar } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as bookingService from "@shared/services/bookingService";
import { useTheme, useDateSelection } from "@shared/context";

// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface DateRangePickerProps {
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
  onSelectRange: (start: Date, end: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  propertyId?: string;
  useGlobalDates?: boolean; // Flag to use dates from global context
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  initialStartDate = null,
  initialEndDate = null,
  onSelectRange,
  minDate = new Date(),
  maxDate,
  propertyId,
  useGlobalDates = false,
}) => {
  const { theme, isDark } = useTheme();
  // const { t } = useTranslation();
  const { searchDates, propertyDates /* , selectDatesForProperty  */ } =
    useDateSelection();

  // Get dates from context if specified
  const getInitialDates = () => {
    // If useGlobalDates is true, prioritize dates from search context
    if (useGlobalDates && searchDates.startDate && searchDates.endDate) {
      return {
        start: searchDates.startDate,
        end: searchDates.endDate,
      };
    }

    // If we have a property ID, check for property-specific dates
    if (propertyId) {
      const savedDates = propertyDates.get(propertyId)?.selectedDates;
      if (savedDates?.startDate && savedDates?.endDate) {
        return {
          start: savedDates.startDate,
          end: savedDates.endDate,
        };
      }
    }

    // Fall back to initial dates passed as props
    return {
      start: initialStartDate,
      end: initialEndDate,
    };
  };

  const initialDates = getInitialDates();

  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    initialDates.start
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    initialDates.end
  );
  const [bookedDates, setBookedDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  // Fetch booked dates for the property
  useEffect(() => {
    if (propertyId) {
      fetchBookedDates();

      // If we have selected dates from context, use them
      if (propertyDates.has(propertyId)) {
        const dates = propertyDates.get(propertyId)?.selectedDates;
        if (dates?.startDate && dates?.endDate) {
          setSelectedStartDate(dates.startDate);
          setSelectedEndDate(dates.endDate);
          onSelectRange(dates.startDate, dates.endDate);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  // Fetch booked dates for the property with improved caching
  const fetchBookedDates = async () => {
    if (!propertyId) return;

    setLoading(true);
    try {
      // Get booked dates from bookingService (which now has improved caching)
      const bookedDatesData = await bookingService.getBookedDatesForProperty(
        propertyId
      );

      // Format the booked dates for the calendar
      const formattedBookedDates: Record<string, any> = {};

      bookedDatesData.forEach((dateStr: string) => {
        formattedBookedDates[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: "#999",
        };
      });

      setBookedDates(formattedBookedDates);
    } catch (error) {
      console.error("Failed to fetch booked dates:", error);
      // Don't show error to user, just use empty set of booked dates
    } finally {
      setLoading(false);
    }
  };
  // Reset selection
  const resetSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  return (
    <View style={styles.container}>
      {" "}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
              },
            ]}
          >
            Loading availability...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.dateSelectionHeader}>
            <View style={styles.dateInfo}>
              <Text
                style={[
                  styles.dateLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                Check In
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {selectedStartDate
                  ? format(selectedStartDate, "MMM dd, yyyy")
                  : "Select date"}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={20}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
            />

            <View style={styles.dateInfo}>
              <Text
                style={[
                  styles.dateLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                Check Out
              </Text>
              <Text
                style={[
                  styles.dateValue,
                  { color: isDark ? theme.white : theme.colors.gray[900] },
                ]}
              >
                {selectedEndDate
                  ? format(selectedEndDate, "MMM dd, yyyy")
                  : "Select date"}
              </Text>
            </View>

            {(selectedStartDate || selectedEndDate) && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetSelection}
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>{" "}
          <Calendar
            enableRangeSelection={true}
            initialStartDate={selectedStartDate || undefined}
            initialEndDate={selectedEndDate || undefined}
            minDate={minDate}
            maxDate={maxDate}
            blockedDates={Object.keys(bookedDates).map(
              (dateStr) => new Date(dateStr)
            )}
            onDateSelect={(startDate: Date, endDate?: Date) => {
              setSelectedStartDate(startDate);
              if (endDate) {
                setSelectedEndDate(endDate);
                onSelectRange(startDate, endDate);
              } else {
                setSelectedEndDate(null);
              }
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
  },
  dateSelectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  resetButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});

export default DateRangePicker;
