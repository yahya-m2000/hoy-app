import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@core/hooks";
import { Text, BaseCard } from "@shared/components";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

interface TodaysActivityProps {
  data?: {
    checkIns: number;
    checkOuts: number;
    newReservations: number;
    messages: number;
    reviewsToRespond: number;
  };
  loading?: boolean;
}

export default function TodaysActivity({ data, loading }: TodaysActivityProps) {
  const { theme } = useTheme();

  const activities = [
    {
      title: "Check-ins Today",
      count: data?.checkIns || 0,
      icon: "log-in-outline",
      color: theme.colors.success,
      description: "Guests arriving",
    },
    {
      title: "Check-outs Today",
      count: data?.checkOuts || 0,
      icon: "log-out-outline",
      color: theme.colors.warning,
      description: "Guests departing",
    },
    {
      title: "New Reservations",
      count: data?.newReservations || 0,
      icon: "calendar-outline",
      color: theme.colors.primary,
      description: "Since yesterday",
    },
    {
      title: "Unread Messages",
      count: data?.messages || 0,
      icon: "chatbubble-outline",
      color: theme.colors.info,
      description: "Require response",
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="h3" style={styles.sectionTitle}>
          Today&apos;s Activity
        </Text>
        <BaseCard style={styles.activityCard}>
          <View style={styles.loadingContainer}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={theme.colors.gray[400]}
            />
            <Text variant="body" color={theme.text.secondary}>
              Loading today&apos;s activity...
            </Text>
          </View>
        </BaseCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.sectionTitle}>
        Today&apos;s Activity
      </Text>
      <BaseCard style={styles.activityCard}>
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.activityItem,
              index < activities.length - 1 && styles.activityItemBorder,
            ]}
          >
            <View style={styles.activityContent}>
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${activity.color}15` },
                ]}
              >
                <Ionicons
                  name={activity.icon as any}
                  size={20}
                  color={activity.color}
                />
              </View>
              <View style={styles.activityText}>
                <Text variant="body" style={styles.activityTitle}>
                  {activity.title}
                </Text>
                <Text variant="caption" color={theme.text.secondary}>
                  {activity.description}
                </Text>
              </View>
              <View style={styles.activityCount}>
                <Text variant="h3" color={activity.color}>
                  {activity.count}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </BaseCard>
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
  activityCard: {
    padding: 0,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  activityItem: {
    padding: spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    marginBottom: spacing.xs / 2,
  },
  activityCount: {
    alignItems: "center",
  },
});
