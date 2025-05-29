/**
 * QuickActions component for the Hoy application
 * Displays a grid of action buttons for quick navigation
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../constants/spacing";
import { fontSize, fontWeight } from "../constants/typography";
import { radius } from "../constants/radius";
import { router } from "expo-router";

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  route: string;
  color?: string;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({
  title = "Quick Actions",
  actions,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text
          style={[
            styles.title,
            { color: isDark ? theme.colors.white : theme.colors.black },
          ]}
        >
          {title}
        </Text>
      )}
      <View style={styles.grid}>
        {actions.map((action) => (
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
            onPress={() => router.push(action.route)}
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
              <Ionicons
                name={action.icon as any}
                size={22}
                color={action.color || theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.actionText,
                { color: isDark ? theme.colors.white : theme.colors.black },
              ]}
              numberOfLines={2}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
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
    fontSize: fontSize.sm,
    textAlign: "center",
  },
});

export default QuickActions;
