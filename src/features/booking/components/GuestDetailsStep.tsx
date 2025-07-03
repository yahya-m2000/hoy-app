/**
 * Guest Details Step Component
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Context & Hooks
import { useTheme } from "@core/hooks";

// Components
import GuestSelector from "./Forms/GuestSelector";

// Utils & Types
import { formatDate } from "../utils";
import type {
  BookingDates,
  BookingGuestInfo,
  BookingStepProps,
} from "@core/types";

// Constants
import { spacing, fontSize, radius } from "@core/design";

interface GuestDetailsStepProps extends BookingStepProps {
  dates: BookingDates;
  guests: BookingGuestInfo;
  maxGuests: number;
  onGuestChange: (field: keyof BookingGuestInfo, value: number) => void;
  onDateChangeRequested: () => void;
}

export const GuestDetailsStep: React.FC<GuestDetailsStepProps> = ({
  dates,
  guests,
  maxGuests,
  onGuestChange,
  onDateChangeRequested,
  onNext,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      {/* Display selected dates */}
      <View
        style={[
          styles.datesSummaryContainer,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
          },
        ]}
      >
        <View style={styles.datesSummaryRow}>
          <Text
            style={[
              styles.datesSummaryLabel,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
              },
            ]}
          >
            Check-in
          </Text>
          <Text
            style={[
              styles.datesSummaryValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {formatDate(dates.startDate)}
          </Text>
        </View>

        <View
          style={[
            styles.datesDivider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        <View style={styles.datesSummaryRow}>
          <Text
            style={[
              styles.datesSummaryLabel,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
              },
            ]}
          >
            Check-out
          </Text>
          <Text
            style={[
              styles.datesSummaryValue,
              {
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
          >
            {formatDate(dates.endDate)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.changeDatesButton,
            { borderColor: theme.colors.primary },
          ]}
          onPress={onDateChangeRequested}
        >
          <Text
            style={[styles.changeDatesText, { color: theme.colors.primary }]}
          >
            Change dates
          </Text>
        </TouchableOpacity>
      </View>
      {/* Section Title */}
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        Guest Information
      </Text>
      {/* Guest Selector */}
      <GuestSelector
        adults={guests.adults}
        // eslint-disable-next-line react/no-children-prop
        children={guests.children}
        infants={guests.infants}
        pets={guests.pets}
        maxGuests={maxGuests}
        onChangeAdults={(value) => onGuestChange("adults", value)}
        onChangeChildren={(value) => onGuestChange("children", value)}
        onChangeInfants={(value) => onGuestChange("infants", value)}
        onChangePets={(value) => onGuestChange("pets", value)}
      />
      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={onNext}
        >
          <Text style={styles.continueButtonText}>{t("common.continue")}</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  datesSummaryContainer: {
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  datesSummaryRow: {
    padding: spacing.md,
  },
  datesSummaryLabel: {
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  datesSummaryValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  datesDivider: {
    height: 1,
  },
  changeDatesButton: {
    borderTopWidth: 1,
    padding: spacing.sm,
    alignItems: "center",
  },
  changeDatesText: {
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
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

export default GuestDetailsStep;
