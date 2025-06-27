/**
 * Settings component
 * Renders a  of settings items with title and content
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@shared/hooks/useTheme";
import { useUserRole } from "@shared/context";
import { radius, fontSize, fontWeight, spacing } from "@shared/constants";

export interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  action?: () => void;
  rightElement?: React.ReactNode;
  isDanger?: boolean;
}

interface SettingsProps {
  title: string;
  items: SettingsItem[];
}

export default function SettingsSection({ title, items }: SettingsProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
          },
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.content,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.settingsItem,
              index === items.length - 1 && styles.lastSettingsItem,
            ]}
            onPress={item.action}
            disabled={!item.action}
          >
            <View
              style={[
                styles.settingsIconContainer,
                {
                  backgroundColor: isDark
                    ? theme.colors.gray[700]
                    : theme.colors.gray[100],
                },
              ]}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={
                  item.isDanger
                    ? theme.colors.error[500]
                    : isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[600]
                }
              />
            </View>
            <View style={styles.settingsContent}>
              <Text
                style={[
                  styles.settingsTitle,
                  {
                    color: item.isDanger
                      ? theme.colors.error[500]
                      : isDark
                      ? theme.colors.gray[100]
                      : theme.colors.gray[900],
                  },
                ]}
              >
                {item.title}
              </Text>
              {item.subtitle && (
                <Text
                  style={[
                    styles.settingsSubtitle,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {item.subtitle}
                </Text>
              )}
            </View>
            {item.rightElement ? (
              item.rightElement
            ) : (
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  content: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  lastSettingsItem: {
    borderBottomWidth: 0,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.xs / 2,
  },
  settingsSubtitle: {
    fontSize: fontSize.sm,
  },
});
