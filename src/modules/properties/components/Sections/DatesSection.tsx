import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { useTheme } from "@shared/context";
// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface DatesSectionProps {
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  propertyPrice: number;
  onChangeDates: () => void;
}

const DatesSection: React.FC<DatesSectionProps> = ({
  selectedDates,
  propertyPrice,
  onChangeDates,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(theme);

  // Format date strings for display
  const formattedStartDate = selectedDates?.startDate
    ? format(selectedDates.startDate, "EEE, MMM d")
    : t("property.selectDates");

  const formattedEndDate = selectedDates?.endDate
    ? format(selectedDates.endDate, "EEE, MMM d")
    : "";

  // Calculate stay duration
  const calculateNights = () => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    const diffTime = Math.abs(
      selectedDates.endDate.getTime() - selectedDates.startDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {t("property.yourStayDates")}
      </Text>
      <View style={styles.datesCard}>
        <View style={styles.dateRow}>
          <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>
            {t("booking.checkIn")}
          </Text>
          <Text style={[styles.dateValue, { color: theme.text.primary }]}>
            {formattedStartDate}
          </Text>
        </View>

        {selectedDates?.endDate && (
          <>
            <View
              style={[
                styles.dateDivider,
                { backgroundColor: theme.colors.gray[200] },
              ]}
            />
            <View style={styles.dateRow}>
              <Text style={[styles.dateLabel, { color: theme.text.secondary }]}>
                {t("booking.checkOut")}
              </Text>
              <Text style={[styles.dateValue, { color: theme.text.primary }]}>
                {formattedEndDate}
              </Text>
            </View>
          </>
        )}
      </View>
      <TouchableOpacity
        style={styles.changeDatesButton}
        onPress={onChangeDates}
      >
        <Text style={[styles.changeDatesText, { color: theme.text.primary }]}>
          {t("property.changeDates")}
        </Text>
      </TouchableOpacity>{" "}
      {/* Stay summary */}
      {nights > 0 && (
        <View style={styles.summaryCard}>
          <Ionicons name="calendar" size={18} color={theme.colors.gray[600]} />{" "}
          <Text style={[styles.summaryText, { color: theme.text.primary }]}>
            {nights}{" "}
            {nights > 1 ? t("property.perNight") + "s" : t("property.perNight")}{" "}
            · ${propertyPrice} {t("property.perNight")}
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {},
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      marginBottom: spacing.md,
    },
    datesCard: {
      backgroundColor: theme.background.primary,

      marginBottom: spacing.sm,
      shadowColor: theme.isDark ? theme.colors.gray[800] : "#000000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    dateRow: {
      paddingVertical: spacing.md,
    },
    dateDivider: {
      height: 1,
    },
    dateLabel: {
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dateValue: {
      fontSize: 16,
      fontWeight: "600",
    },
    changeDatesButton: {
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
    },
    changeDatesText: {
      fontSize: 14,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.gray[50],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      gap: spacing.sm,
    },
    summaryText: {
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default DatesSection;
