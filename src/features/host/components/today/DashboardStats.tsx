import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@core/hooks";
import { Text, BaseCard } from "@shared/components";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

interface DashboardStatsProps {
  data?: {
    totalEarnings: number;
    monthlyEarnings: number;
    activeListings: number;
    occupancyRate: number;
    totalReservations: number;
    averageRating: number;
  };
  loading?: boolean;
}

export default function DashboardStats({ data, loading }: DashboardStatsProps) {
  const { theme } = useTheme();

  const stats = [
    {
      title: "Total Earnings",
      value: data?.totalEarnings
        ? `$${data.totalEarnings.toLocaleString()}`
        : "$0",
      icon: "wallet-outline",
      color: theme.colors.success,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "This Month",
      value: data?.monthlyEarnings
        ? `$${data.monthlyEarnings.toLocaleString()}`
        : "$0",
      icon: "trending-up-outline",
      color: theme.colors.primary,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Active Listings",
      value: data?.activeListings?.toString() || "0",
      icon: "home-outline",
      color: theme.colors.warning,
      change: "",
      changeType: "neutral" as const,
    },
    {
      title: "Occupancy Rate",
      value: data?.occupancyRate ? `${data.occupancyRate}%` : "0%",
      icon: "bar-chart-outline",
      color: theme.colors.info,
      change: "+3%",
      changeType: "positive" as const,
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="h3" style={styles.sectionTitle}>
          Overview
        </Text>
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <BaseCard key={i} style={{...styles.statBaseCard, opacity: 0.6}}>
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.gray[200] },
                  ]}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={theme.colors.gray[400]}
                  />
                </View>
                <View style={styles.statText}>
                  <Text variant="caption" color={theme.text.secondary}>
                    Loading...
                  </Text>
                  <Text variant="h4">--</Text>
                </View>
              </View>
            </BaseCard>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="h3" style={styles.sectionTitle}>
        Overview
      </Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <BaseCard key={index} style={styles.statBaseCard}>
            <View style={styles.statContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${stat.color}15` },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={20}
                  color={stat.color}
                />
              </View>
              <View style={styles.statText}>
                <Text variant="caption" color={theme.text.secondary}>
                  {stat.title}
                </Text>
                <Text variant="h4">{stat.value}</Text>
                {stat.change && (
                  <Text
                    variant="caption"
                    color={
                      stat.changeType === "positive"
                        ? theme.colors.success
                        : theme.colors.error
                    }
                  >
                    {stat.change}
                  </Text>
                )}
              </View>
            </View>
          </BaseCard>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statBaseCard: {
    flex: 1,
    minWidth: "47%",
    padding: spacing.md,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statText: {
    flex: 1,
  },
});
