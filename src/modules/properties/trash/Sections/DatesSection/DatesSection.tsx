import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { useTheme } from "@shared/hooks/useTheme";
import { Text, Icon, Container } from "@shared/components/base";
import type { DatesSectionProps } from "../../types/sections";

// Constants
import { spacing, radius, fontWeight } from "@shared/constants";

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
      <Text variant="h3" weight="bold" color={theme.text.primary}>
        {t("property.yourStayDates")}
      </Text>
      <View style={styles.datesCard}>
        <View style={styles.dateRow}>
          <Text
            variant="label"
            size="xs"
            weight="medium"
            color={theme.text.secondary}
            style={styles.dateLabel}
          >
            {t("booking.checkIn")}
          </Text>
          <Text variant="body" weight="semibold" color={theme.text.primary}>
            {formattedStartDate}
          </Text>
        </View>

        {selectedDates?.endDate && (
          <Container>
            <View style={styles.dateRow}>
              <Text
                variant="label"
                size="xs"
                weight="medium"
                color={theme.text.secondary}
                style={styles.dateLabel}
              >
                {t("booking.checkOut")}
              </Text>
              <Text variant="body" weight="semibold" color={theme.text.primary}>
                {formattedEndDate}
              </Text>
            </View>
          </Container>
        )}
      </View>

      <TouchableOpacity
        onPress={onChangeDates}
        style={styles.changeDatesButton}
      >
        <Text
          style={[
            styles.changeDatesText,
            { fontWeight: fontWeight.bold, color: theme.colors.primary },
          ]}
        >
          {t("property.changeDates")}
        </Text>
      </TouchableOpacity>
      {/* Stay summary */}
      {nights > 0 && (
        <View style={styles.summaryCard}>
          <Icon name="calendar" color={theme.colors.gray[600]} />
          <Text
            variant="body"
            size="sm"
            weight="medium"
            color={theme.text.primary}
          >
            {nights}&nbsp;
            {nights > 1 ? t("property.perNight") + "s" : t("property.perNight")}
            &nbsp;·&nbsp;${propertyPrice} {t("property.perNight")}
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {},
    datesCard: {
      backgroundColor: theme.background.primary,
    },
    dateRow: {
      paddingVertical: spacing.md,
    },
    dateDivider: {
      height: 1,
    },
    dateLabel: {
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    changeDatesButton: {
      marginBottom: spacing.md,
    },
    changeDatesText: {
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
  });

export default DatesSection;
