import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context/ThemeContext";
import { spacing } from "@shared/constants/spacing";
import { fontSize } from "@shared/constants/typography";
import { LoadingSpinner } from "@shared/components/common";

interface BookingEmptyStateProps {
  isUpcoming: boolean;
  isLoading: boolean;
}

const BookingEmptyState: React.FC<BookingEmptyStateProps> = ({
  isUpcoming,
  isLoading,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  const title = isUpcoming
    ? t("bookings.empty.upcoming.title", "No upcoming bookings")
    : t("bookings.empty.past.title", "No past bookings");

  const message = isUpcoming
    ? t(
        "bookings.empty.upcoming.message",
        "Start exploring to book your next trip!"
      )
    : t(
        "bookings.empty.past.message",
        "Your completed bookings will appear here."
      );

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: isDark ? theme.colors.gray[400] : theme.colors.gray[500],
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: "center",
    lineHeight: fontSize.md * 1.4,
  },
});

export default BookingEmptyState;
