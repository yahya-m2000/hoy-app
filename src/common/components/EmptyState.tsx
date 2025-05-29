/**
 * EmptyState Component
 * Shows an empty state with icon, title, message, and optional action button
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../constants/spacing";
import { fontSize } from "../constants/typography";
import { radius } from "../constants/radius";
import { useTheme } from "../context/ThemeContext";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  minimized?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  minimized = false,
  action,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[styles.container, minimized ? styles.minimizedContainer : null]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? theme.colors.grayPalette[800]
              : theme.colors.grayPalette[100],
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={minimized ? 24 : 32}
          color={theme.colors.primary}
        />
      </View>
      <Text
        style={[
          styles.title,
          minimized ? styles.minimizedTitle : null,
          { color: isDark ? theme.white : theme.colors.grayPalette[900] },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          minimized ? styles.minimizedMessage : null,
          { color: isDark ? theme.colors.gray[400] : theme.colors.gray[600] },
        ]}
      >
        {message}
      </Text>
      {action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={action.onPress}
        >
          <Text style={[styles.actionButtonText, { color: theme.white }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  minimizedContainer: {
    padding: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  minimizedTitle: {
    fontSize: fontSize.md,
  },
  message: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  minimizedMessage: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});

export default EmptyState;

