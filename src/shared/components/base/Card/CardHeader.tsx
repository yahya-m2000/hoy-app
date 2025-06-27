/**
 * Card Header component
 * Handles title, subtitle, and right content within cards
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants";
import { CardHeaderProps } from "./types";

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  style,
  titleStyle,
  subtitleStyle,
  rightContent,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {title && (
          <Text
            variant="body"
            weight="semibold"
            style={[{ color: theme.text.primary }, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            variant="caption"
            style={[
              { color: theme.text.secondary },
              styles.subtitle,
              subtitleStyle,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subtitle: {
    marginTop: spacing.xs / 2,
  },
  rightContent: {
    flexShrink: 0,
  },
});

export default CardHeader;
