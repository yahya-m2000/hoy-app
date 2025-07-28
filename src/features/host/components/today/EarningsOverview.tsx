import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useCurrencyConversion } from "@core/hooks";
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
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { currency, supportedCurrencies } = useCurrency();
  const { convertAmount } = useCurrencyConversion();

  // State for converted amounts
  const [convertedData, setConvertedData] = useState({
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    yearToDate: 0,
    nextPayout: { amount: 0, date: "" },
  });

  // Get currency symbol
  const getCurrencySymbol = () => {
    const currencyInfo = supportedCurrencies.find(
      (curr) => curr.code === currency
    );
    return currencyInfo?.symbol || currency;
  };

  // Convert amounts when currency or data changes
  useEffect(() => {
    const convertAllAmounts = async () => {
      if (data) {
        const thisWeek = await convertAmount(data.thisWeek || 0, "USD");
        const thisMonth = await convertAmount(data.thisMonth || 0, "USD");
        const lastMonth = await convertAmount(data.lastMonth || 0, "USD");
        const yearToDate = await convertAmount(data.yearToDate || 0, "USD");
        const nextPayoutAmount = await convertAmount(
          data.nextPayout?.amount || 0,
          "USD"
        );

        setConvertedData({
          thisWeek,
          thisMonth,
          lastMonth,
          yearToDate,
          nextPayout: {
            amount: nextPayoutAmount,
            date: data.nextPayout?.date || "",
          },
        });
      }
    };

    convertAllAmounts();
  }, [data, currency, convertAmount]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text variant="h3" style={styles.sectionTitle}>
          {t("features.host.dashboard.earnings.title")}
        </Text>
        <BaseCard style={styles.earningsCard}>
          <View style={styles.loadingContainer}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={theme.colors.gray[400]}
            />
            <Text variant="body" color={theme.text.secondary}>
              {t("features.host.dashboard.earnings.loadingEarnings")}
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
          {t("features.host.dashboard.earnings.title")}
        </Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text variant="caption" color={theme.colors.primary}>
            {t("features.host.dashboard.earnings.viewAll")}
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
              {t("features.host.dashboard.earnings.nextPayout")}
            </Text>
          </View>
          <Text variant="h2" color={theme.colors.success}>
            {getCurrencySymbol()}{" "}
            {convertedData.nextPayout.amount?.toLocaleString() || "0"}
          </Text>
          <Text variant="caption" color={theme.text.secondary}>
            {convertedData.nextPayout.date ||
              t("features.host.dashboard.earnings.noUpcomingPayouts")}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Earnings Breakdown */}
        <View style={styles.earningsBreakdown}>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              {t("features.host.dashboard.earnings.thisWeek")}
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              {getCurrencySymbol()}{" "}
              {convertedData.thisWeek?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              {t("features.host.dashboard.earnings.thisMonth")}
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              {getCurrencySymbol()}{" "}
              {convertedData.thisMonth?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              {t("features.host.dashboard.earnings.lastMonth")}
            </Text>
            <Text variant="body" style={styles.earningsAmount}>
              {getCurrencySymbol()}{" "}
              {convertedData.lastMonth?.toLocaleString() || "0"}
            </Text>
          </View>
          <View style={styles.earningsRow}>
            <Text variant="body" color={theme.text.secondary}>
              {t("features.host.dashboard.earnings.yearToDate")}
            </Text>
            <Text variant="h4" color={theme.colors.primary}>
              {getCurrencySymbol()}{" "}
              {convertedData.yearToDate?.toLocaleString() || "0"}
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
