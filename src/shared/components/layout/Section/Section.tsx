/**
 * Section component for grouping content with consistent styling
 * Provides consistent section layout with title and content
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "src/core/hooks/useTheme";
import { Text } from "../../base/Text";
import { spacing } from "@core/design";
import type { SectionProps } from "./Section.types";

const Section: React.FC<SectionProps> = ({
  title,
  children,
  spacing: sectionSpacing = "lg",
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const styles = createStyles(theme, sectionSpacing);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {title && (
        <Text
          variant="h6"
          weight="semibold"
          color={theme.text.primary}
          style={styles.title}
        >
          {title}
        </Text>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const createStyles = (theme: any, sectionSpacing: string) =>
  StyleSheet.create({
    container: {
      marginBottom:
        spacing[sectionSpacing as keyof typeof spacing] || spacing.lg,
    },
    title: {
      marginBottom: spacing.md,
    },
    content: {
      gap: spacing.sm,
    },
  });

export default Section;
