import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/context";
import { spacing, fontSize, radius } from "@shared/constants";

interface SearchSummaryProps {
  location: string;
  guests: number;
  resultsCount: number;
  dates?: string;
}

export const SearchSummary: React.FC<SearchSummaryProps> = ({
  location,
  guests,
  resultsCount,
  dates,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderBottomColor: isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[200],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
          />
          <Text
            style={[
              styles.locationText,
              {
                color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
              },
            ]}
          >
            {location}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="people-outline"
              size={14}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
            />
            <Text
              style={[
                styles.detailText,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {guests} {guests === 1 ? "guest" : "guests"}
            </Text>
          </View>

          {dates && (
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
              />
              <Text
                style={[
                  styles.detailText,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {dates}
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.resultsText,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[600],
            },
          ]}
        >
          {resultsCount} {resultsCount === 1 ? "property" : "properties"} found
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  detailText: {
    fontSize: fontSize.xs,
    marginLeft: spacing.xs,
  },
  resultsText: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
});
