import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@core/hooks";
import { Text, BaseCard } from "@shared/components";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

export default function QuickActions() {
  const { theme } = useTheme();
  const router = useRouter();
  const actions = [
    {
      title: "Calendar",
      description: "View bookings",
      icon: "calendar-outline",
      color: theme.colors.primary,
      onPress: () => router.push("/(tabs)/host/calendar"),
    },
    {
      title: "Listings",
      description: "Manage properties",
      icon: "home-outline",
      color: theme.colors.warning,
      onPress: () => router.push("/(tabs)/host/listings"),
    },
    {
      title: "Settings",
      description: "Host preferences",
      icon: "settings-outline",
      color: theme.colors.gray[600],
      onPress: () => router.push("/(tabs)/host/settings"),
    },
  ];

  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.sectionTitle}>
        Quick Actions
      </Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={action.onPress}
          >
            <BaseCard style={styles.actionCard}>
              <View style={styles.actionContent}>
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text variant="body" style={styles.actionTitle}>
                  {action.title}
                </Text>
                <Text variant="caption" color={theme.text.secondary}>
                  {action.description}
                </Text>
              </View>
            </BaseCard>
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
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionItem: {
    flex: 1,
    minWidth: "47%",
  },
  actionCard: {
    padding: spacing.md,
    height: 100,
    justifyContent: "center",
  },
  actionContent: {
    alignItems: "center",
    gap: spacing.xs,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  actionTitle: {
    fontWeight: "600",
    textAlign: "center",
  },
});
