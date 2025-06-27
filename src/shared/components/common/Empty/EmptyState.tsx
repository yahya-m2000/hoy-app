/**
 * EmptyState Component
 * Shows an empty state with icon, title, message, and optional action button
 */

// React
import React from "react";

// React Native
import { View, StyleSheet } from "react-native";

// Context
import { useTheme } from "@shared/hooks/useTheme";

// Constants
import { spacing } from "@shared/constants";

// Base components
import { Container } from "../../base/Container";
import { Text } from "../../base/Text";
import { Button } from "../../base/Button";
import { Icon } from "../../base/Icon";

// Types
import { EmptyStateProps } from "./EmptyState.types";

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  minimized = false,
  action,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <Container padding={minimized ? "sm" : "lg"} style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          minimized && styles.minimizedIconContainer,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
          },
        ]}
      >
        <Icon
          name="folder-outline"
          size={minimized ? 24 : 32}
          color={theme.colors.primary}
        />
      </View>
      <Text
        variant={minimized ? "h6" : "h6"}
        weight="semibold"
        style={[styles.title, minimized && styles.minimizedTitle]}
        color={isDark ? theme.colors.white : theme.colors.gray[900]}
      >
        {title}
      </Text>
      <Text
        variant={minimized ? "body" : "h6"}
        style={[styles.message, minimized && styles.minimizedMessage]}
        color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
      >
        {message}
      </Text>
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
          size={minimized ? "small" : "medium"}
          style={styles.actionButton}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  minimizedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  minimizedTitle: {
    marginBottom: spacing.xs,
  },
  message: {
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  minimizedMessage: {
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;
