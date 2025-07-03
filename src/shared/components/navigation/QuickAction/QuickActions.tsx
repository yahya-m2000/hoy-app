/**
 * QuickActions component for the Hoy application
 * Displays a grid of action buttons for quick navigation
 */

// React
import React from "react";

// React Native
import { View, StyleSheet, TouchableOpacity } from "react-native";

// Expo
import { router } from "expo-router";

// Context
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { radius, spacing } from "@core/design";

// Base components
import { Text } from "../../base/Text";
import { Icon } from "../../base/Icon";

// Types
import { QuickActionsProps, QuickAction } from "./QuickActions.types";

const QuickActions: React.FC<QuickActionsProps> = ({
  title = "Quick Actions",
  actions,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const handleActionPress = (route: string) => {
    router.push(route as any);
  };

  const renderActionButton = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionButton,
        {
          backgroundColor: isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
        },
      ]}
      onPress={() => handleActionPress(action.route)}
      testID={action.testID || `quick-action-${action.id}`}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: action.color
              ? action.color + "20"
              : theme.colors.primary + "20",
          },
        ]}
      >
        <Icon
          name={action.icon as any}
          size={22}
          color={action.color || theme.colors.primary}
        />
      </View>
      <Text
        variant="caption"
        color={isDark ? theme.colors.white : theme.colors.black}
        style={styles.actionText}
        numberOfLines={2}
      >
        {action.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} testID={testID}>
      {title && (
        <Text
          variant="h3"
          weight="bold"
          color={isDark ? theme.colors.white : theme.colors.black}
          style={styles.title}
        >
          {title}
        </Text>
      )}
      <View style={styles.grid}>{actions.map(renderActionButton)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    width: "29%", // ~3 per row with margins
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    margin: spacing.xs,
    borderRadius: radius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionText: {
    textAlign: "center",
  },
});

export default QuickActions;
