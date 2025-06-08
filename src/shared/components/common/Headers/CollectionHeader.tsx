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
import { View, Text, StyleSheet } from "react-native";

// Context
import { useTheme } from "@shared/context";

// Constants
import { fontSize, fontWeight } from "@shared/constants/typography";
import { spacing } from "@shared/constants/spacing";

// Types
import { CollectionHeaderProps } from "./Headers.types";

export default function CollectionHeader({
  title,
  propertyCount,
}: CollectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      {propertyCount !== undefined && (
        <Text style={[styles.propertyCount, { color: theme.text.secondary }]}>
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
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
  },
  propertyCount: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs / 2,
    textAlign: "center",
  },
});
