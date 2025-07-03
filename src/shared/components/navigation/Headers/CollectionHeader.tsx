/**
 * Collection Header Component
 * Custom header that displays the collection name with property count directly below it
 */

/**
 * Collection Header Component
 * Custom header that displays the collection name with property count directly below it
 */

// React
import React from "react";

// React Native
import { View, StyleSheet } from "react-native";
import { Text } from "../../base/Text";

// Context
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { fontSize, fontWeight } from "@core/design/typography";
import { spacing } from "@core/design";

// Types
import { CollectionHeaderProps } from "./Headers.types";

export default function CollectionHeader({
  title,
  propertyCount,
}: CollectionHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text
        size="lg"
        weight="semibold"
        align="center"
        color={theme.text.primary}
        style={styles.title}
      >
        {title}
      </Text>
      {propertyCount !== undefined && (
        <Text
          size="xs"
          align="center"
          color={theme.text.secondary}
          style={styles.propertyCount}
        >
          {propertyCount} {propertyCount === 1 ? "property" : "properties"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1, // Take available space
    width: "100%", // Use full available width
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    width: "100%", // Use full width
  },
  propertyCount: {
    fontSize: fontSize.xs, // Slightly smaller to ensure it fits
    marginTop: spacing.xs / 2,
    textAlign: "center",
    width: "100%", // Use full width
  },
});
