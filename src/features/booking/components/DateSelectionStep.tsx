/**
 * Date Selection Step Component
 */

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Context & Hooks
import { useTheme } from "@core/hooks";

// Components
import DateRangePicker from "./Forms/DateRangePicker";

// Utils & Types
import { formatDate } from "../utils";
import type { BookingDates, BookingStepProps } from "@core/types";

// Constants
import { spacing, fontSize, radius } from "@core/design";

interface DateSelectionStepProps extends BookingStepProps {
  dates: BookingDates;
  onDateChange: (startDate: Date, endDate: Date) => void;
  propertyId?: string;
  isAvailable: boolean | null;
  isCheckingAvailability: boolean;
}

export const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  dates,
  onDateChange,
  onNext,
  propertyId,
  isAvailable,
  isCheckingAvailability,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const handleDateSelection = (start: Date, end: Date) => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date selection:", { start, end });
      return;
    }
    onDateChange(start, end);
  };

  return (
    <View>
      {/* Pre-selected dates preview */}
      <View style={styles.selectedDatesPreview}>
        <Text
          style={[
            styles.previewTitle,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {t("reservation.preSelectedDates")}
        </Text>
        <Text
          style={[
            styles.previewDates,
            {
              color: isDark ? theme.white : theme.colors.gray[900],
            },
          ]}
        >
          {dates.startDate && dates.endDate
            ? `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`
            : "No dates selected yet"}
        </Text>
      </View>

      {/* Date Range Picker */}
      <DateRangePicker
        initialStartDate={dates.startDate}
        initialEndDate={dates.endDate}
        onSelectRange={handleDateSelection}
        minDate={new Date()}
        propertyId={propertyId}
      />

      {/* Availability Status */}
      {isCheckingAvailability && (
        <View style={styles.availabilityCheckingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text
            style={[styles.availabilityText, { color: theme.colors.gray[600] }]}
          >
            Checking availability...
          </Text>
        </View>
      )}

      {!isCheckingAvailability && isAvailable === false && (
        <View
          style={[
            styles.availabilityErrorContainer,
            {
              backgroundColor: isDark
                ? theme.colors.error[900]
                : theme.colors.error[50],
              borderColor: theme.colors.error[500],
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={theme.colors.error[500]}
          />
          <Text
            style={[
              styles.availabilityErrorText,
              {
                color: isDark
                  ? theme.colors.error[100]
                  : theme.colors.error[700],
              },
            ]}
          >
            Sorry, this property is not available for the selected dates
          </Text>
        </View>
      )}

      {!isCheckingAvailability &&
        isAvailable &&
        dates.startDate &&
        dates.endDate && (
          <View
            style={[
              styles.availabilitySuccessContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.success[900]
                  : theme.colors.success[50],
                borderColor: theme.colors.success[500],
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={theme.colors.success[500]}
            />
            <Text
              style={[
                styles.availabilitySuccessText,
                {
                  color: isDark
                    ? theme.colors.success[100]
                    : theme.colors.success[700],
                },
              ]}
            >
              Property available for selected dates
            </Text>
          </View>
        )}

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: isAvailable
                ? theme.colors.primary
                : theme.colors.gray[400],
            },
          ]}
          disabled={!isAvailable || isCheckingAvailability}
          onPress={onNext}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedDatesPreview: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  previewTitle: {
    fontSize: fontSize.sm,
  },
  previewDates: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginTop: 4,
  },
  availabilityCheckingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    marginVertical: spacing.md,
  },
  availabilityText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
  },
  availabilityErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  availabilityErrorText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  availabilitySuccessContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginVertical: spacing.md,
  },
  availabilitySuccessText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.lg,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    flex: 1,
  },
  continueButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
});

export default DateSelectionStep;
