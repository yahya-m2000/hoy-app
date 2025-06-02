import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common-context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
import { format } from "date-fns";

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
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
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
    <View style={styles.sectionContainer}>
      {" "}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDark
              ? theme.colors.grayPalette[50]
              : theme.colors.grayPalette[900],
          },
        ]}
      >
        {t("property.yourStayDates")}
      </Text>
      <View style={styles.dateSelectionContainer}>
        <View
          style={[
            styles.datesBox,
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
          <View style={styles.dateRow}>
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
              {t("booking.checkIn")}
            </Text>
            <Text
              style={[
                styles.dateValue,
                {
                  color: isDark
                    ? theme.colors.grayPalette[50]
                    : theme.colors.grayPalette[900],
                },
              ]}
            >
              {formattedStartDate}
            </Text>
          </View>

          {selectedDates?.endDate && (
            <>
              <View
                style={[
                  styles.dateDivider,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  },
                ]}
              />

              <View style={styles.dateRow}>
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
                  {t("booking.checkOut")}
                </Text>
                <Text
                  style={[
                    styles.dateValue,
                    {
                      color: isDark
                        ? theme.colors.grayPalette[50]
                        : theme.colors.grayPalette[900],
                    },
                  ]}
                >
                  {formattedEndDate}
                </Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primary,
            borderRadius: radius.md,
            padding: spacing.sm,
            alignItems: "center",
            marginTop: spacing.sm,
          }}
          onPress={onChangeDates}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: "600",
            }}
          >
            {t("property.changeDates")}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Stay summary */}
      {nights > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: spacing.md,
            borderRadius: radius.md,
            borderWidth: 1,
            marginTop: spacing.md,
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[300],
          }}
        >
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Text
            style={{
              marginLeft: spacing.sm,
              fontWeight: "500",
              color: isDark
                ? theme.colors.grayPalette[50]
                : theme.colors.grayPalette[900],
            }}
          >
            {nights}{" "}
            {nights > 1 ? t("property.perNight") + "s" : t("property.perNight")}{" "}
            · ${propertyPrice} {t("property.perNight")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  dateSelectionContainer: {
    marginBottom: spacing.md,
  },
  datesBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  dateRow: {
    flex: 1,
    padding: spacing.md,
  },
  dateDivider: {
    width: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default DatesSection;
