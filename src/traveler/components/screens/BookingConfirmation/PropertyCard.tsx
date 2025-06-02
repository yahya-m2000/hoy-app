/**
 * Property Card Component
 * Displays property information and booking dates
 */

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface Property {
  title?: string;
  city?: string;
  country?: string;
  images?: string[];
}

interface Booking {
  checkIn: string;
  checkOut: string;
  property: Property;
}

interface PropertyCardProps {
  booking: Booking;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ booking }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { property } = booking;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "EEE, MMM d, yyyy");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        },
      ]}
    >
      {property?.images && property.images.length > 0 && (
        <Image
          source={{ uri: property.images[0] }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text
          style={[
            styles.propertyName,
            { color: isDark ? theme.white : theme.colors.grayPalette[900] },
          ]}
        >
          {property?.title}
        </Text>
        <Text
          style={[
            styles.propertyLocation,
            {
              color: isDark
                ? theme.colors.gray[400]
                : theme.colors.gray[600],
            },
          ]}
        >
          {property?.city}, {property?.country}
        </Text>

        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
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
                { color: isDark ? theme.white : theme.colors.grayPalette[900] },
              ]}
            >
              {formatDate(booking.checkIn)}
            </Text>
          </View>

          <View style={styles.dateItem}>
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
                { color: isDark ? theme.white : theme.colors.grayPalette[900] },
              ]}
            >
              {formatDate(booking.checkOut)}
            </Text>
          </View>
        </View>
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
  propertyImage: {
    width: "100%",
    height: 150,
  },
  content: {
    padding: spacing.md,
  },
  propertyName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
});

export default PropertyCard;
