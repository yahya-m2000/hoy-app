import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useTheme } from "@core/hooks";
import { useCurrency } from "@core/context";
import { useCurrencyConversion } from "@core/hooks";
import { spacing } from "@core/design";
import { Ionicons } from "@expo/vector-icons";
import type { EarningsData } from "@features/host/types/dashboard.types";

interface EarningsModalProps {
  visible: boolean;
  onClose: () => void;
  earningsData?: EarningsData;
}

const EarningsModal: React.FC<EarningsModalProps> = ({
  visible,
  onClose,
  earningsData,
}) => {
  const { theme } = useTheme();
  const { currency, supportedCurrencies } = useCurrency();
  const { convertAmount } = useCurrencyConversion();

  // State for converted amounts
  const [convertedAmounts, setConvertedAmounts] = useState({
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    chartData: [] as { month: string; earnings: number }[],
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
      if (earningsData) {
        const thisMonth = await convertAmount(
          earningsData.thisMonth || 0,
          "USD"
        );
        const lastMonth = await convertAmount(
          earningsData.lastMonth || 0,
          "USD"
        );
        const thisYear = await convertAmount(earningsData.thisYear || 0, "USD");

        // Convert chart data
        const convertedChartData = await Promise.all(
          (earningsData.chartData || []).map(async (item) => ({
            month: item.month,
            earnings: await convertAmount(item.earnings, "USD"),
          }))
        );

        setConvertedAmounts({
          thisMonth,
          lastMonth,
          thisYear,
          chartData: convertedChartData,
        });
      }
    };

    convertAllAmounts();
  }, [earningsData, currency, convertAmount]);

  // Mock chart data if not provided
  const chartData = earningsData?.chartData || [
    { month: "Jan", earnings: 2400 },
    { month: "Feb", earnings: 1800 },
    { month: "Mar", earnings: 3200 },
    { month: "Apr", earnings: 2800 },
    { month: "May", earnings: 3800 },
    { month: "Jun", earnings: 4200 },
  ];

  const maxAmount = Math.max(...chartData.map((d) => d.earnings));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Earnings
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                This month
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {getCurrencySymbol()}
                {convertedAmounts.thisMonth.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.summaryLabel, { color: theme.text.secondary }]}
              >
                Last month
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.text.primary }]}
              >
                {getCurrencySymbol()}
                {convertedAmounts.lastMonth.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <View
            style={[
              styles.chartContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: theme.text.primary }]}>
              Monthly earnings
            </Text>

            <View style={styles.chart}>
              {convertedAmounts.chartData.map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (data.earnings / maxAmount) * 120,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.barLabel, { color: theme.text.secondary }]}
                  >
                    {data.month}
                  </Text>
                  <Text
                    style={[styles.barValue, { color: theme.text.primary }]}
                  >
                    {getCurrencySymbol()}
                    {(data.earnings / 1000).toFixed(1)}k
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Details Section */}
          <View
            style={[
              styles.detailsContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.detailsTitle, { color: theme.text.primary }]}>
              Year to date
            </Text>
            <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
              {getCurrencySymbol()}
              {convertedAmounts.thisYear.toLocaleString()}
            </Text>
            <Text
              style={[styles.detailsSubtext, { color: theme.text.secondary }]}
            >
              Total earnings this year
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  summarySection: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  chartContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingHorizontal: spacing.sm,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: "#FF5A5F",
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  barLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "500",
  },
  detailsContainer: {
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  detailsValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  detailsSubtext: {
    fontSize: 14,
  },
});

export default EarningsModal;
