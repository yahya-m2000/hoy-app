/**
 * Guest Information Component
 * Displays guest count details for the booking
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTranslation } from "react-i18next";
// Context
import { useTheme } from "@shared/context";

// Constants
import { fontSize, spacing, radius } from "@shared/constants";

interface Guests {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestInformationProps {
  guests: Guests;
}

const GuestInformation: React.FC<GuestInformationProps> = ({ guests }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const formatGuestInfo = () => {
    const parts = [];

    // Always show adults
    parts.push(`${guests.adults} ${t("booking.adults")}`);

    // Add children if any
    if (guests.children > 0) {
      parts.push(`${guests.children} ${t("booking.childrenShort")}`);
    }

    // Add infants if any
    if (guests.infants > 0) {
      parts.push(`${guests.infants} ${t("booking.infantsShort")}`);
    }

    // Add pets if any
    if (guests.pets > 0) {
      parts.push(`${guests.pets} ${t("booking.petsShort")}`);
    }

    return parts.join(", ");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.white : theme.colors.grayPalette[900] },
        ]}
      >
        {t("booking.guests")}
      </Text>

      <View style={styles.content}>
        <Text
          style={[
            styles.guestInfo,
            { color: isDark ? theme.white : theme.colors.grayPalette[900] },
          ]}
        >
          {formatGuestInfo()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  guestInfo: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
  },
});

export default GuestInformation;
