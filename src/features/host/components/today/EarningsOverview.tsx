import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@core/hooks";
import { Text, BaseCard } from "@shared/components";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";

interface EarningsOverviewProps {
  data?: {
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    yearToDate: number;
    nextPayout: {
      amount: number;
      date: string;
    };
  };
  loading?: boolean;
}

export default function EarningsOverview({
  data,
  loading,
}: EarningsOverviewProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="h3" style={styles.sectionTitle}>
          Earnings
        </Text>
        <BaseCard style={styles.earningsCard}>
          <View style={styles.loadingContainer}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={theme.colors.gray[400]}
            />
            <Text variant="body" color={theme.text.secondary}>
              Loading earnings...
            </Text>
          </View>
        </BaseCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text variant="h3" style={styles.sectionTitle}>
          Earnings
        </Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text variant="caption" color={theme.colors.primary}>
            View All
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <BaseCard style={styles.earningsCard}>
        {/* Next Payout */}
        <View style={styles.payoutSection}>
          <View style={styles.payoutHeader}>
            <Ionicons
              name="card-outline"
              size={20}
              color={theme.colors.success}
            />
            <Text variant="body" style={styles.payoutTitle}>
              Next Payout
            </Text>
          </View>
          <Text variant="h2" color={theme.colors.success}>
            ${data?.nextPayout?.amount?.toLocaleString() || "0"}
          </Text>
          <Text variant="caption" color={theme.text.secondary}>
            {data?.nextPayout?.date || "No upcoming payouts"}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Earnings Breakdown */}
        <View style={styles.earningsBreakdown}>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              This Week
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              ${data?.thisWeek?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              This Month
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              ${data?.thisMonth?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              Last Month
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              ${data?.lastMonth?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              Year to Date
            </Text>
            <Text variant="h4" color={theme.colors.primary}>
              ${data?.yearToDate?.toLocaleString() || "0"}
            </Text>
          </View>
        </View>
      </BaseCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    flex: 1,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  earningsCard: {
    padding: spacing.md,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  payoutSection: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  payoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  payoutTitle: {
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: spacing.md,
  },
  earningsBreakdown: {
    gap: spacing.sm,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  earningsAmount: {
    fontWeight: "600",
  },
});
