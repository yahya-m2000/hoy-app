/**
 * Host Earnings Screen
 * Shows earnings statistics, transaction history, and payout information
 * Includes monthly earnings charts, transaction details, and payout management
 */

// React Native core
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";

// Expo and third-party libraries
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

// App context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useUserRole } from "@common/context/UserRoleContext";
import { useCurrency } from "@common/hooks/useCurrency";

// Components
import EmptyState from "@common/components/EmptyState";
import Card from "@common/components/Card";

// Services
import {
  fetchHostEarnings,
  HostEarningsResponse,
} from "@host/services/hostService";

// Types
import type { Transaction } from "@common/types/earnings";

// Constants
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";

// Screen width for the chart
const screenWidth = Dimensions.get("window").width - spacing.md * 2;

// Placeholder for API calls - replace with actual API calls
// const getHostEarnings = async (): Promise<EarningsData> => {
//   // Simulate network request
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         totalEarnings: 12580,
//         pendingPayouts: 2450,
//         thisMonth: 3500,
//         previousMonth: 2800,
//         monthlyData: [
//           { month: "Jan", amount: 1200 },
//           { month: "Feb", amount: 1500 },
//           { month: "Mar", amount: 1800 },
//           { month: "Apr", amount: 2800 },
//           { month: "May", amount: 3500 },
//           { month: "Jun", amount: 0 },
//           { month: "Jul", amount: 0 },
//           { month: "Aug", amount: 0 },
//           { month: "Sep", amount: 0 },
//           { month: "Oct", amount: 0 },
//           { month: "Nov", amount: 0 },
//           { month: "Dec", amount: 0 },
//         ],
//         transactions: [
//           {
//             id: "trans1",
//             date: "2025-05-02",
//             amount: 1575,
//             type: "payout",
//             status: "completed",
//             propertyId: "prop1",
//             propertyTitle: "Luxury Beach House",
//             reservationId: "res4",
//           },
//           {
//             id: "trans2",
//             date: "2025-04-28",
//             amount: 1134,
//             type: "payout",
//             status: "completed",
//             propertyId: "prop2",
//             propertyTitle: "Downtown Apartment",
//             reservationId: "res5",
//           },
//           {
//             id: "trans3",
//             date: "2025-04-15",
//             amount: 2205,
//             type: "earning",
//             status: "completed",
//             propertyId: "prop1",
//             propertyTitle: "Luxury Beach House",
//             reservationId: "res6",
//           },
//           {
//             id: "trans4",
//             date: "2025-04-10",
//             amount: 1350,
//             type: "earning",
//             status: "completed",
//             propertyId: "prop3",
//             propertyTitle: "Mountain Cabin",
//             reservationId: "res7",
//           },
//           {
//             id: "trans5",
//             date: "2025-04-05",
//             amount: 950,
//             type: "earning",
//             status: "completed",
//             propertyId: "prop2",
//             propertyTitle: "Downtown Apartment",
//             reservationId: "res8",
//           },
//           {
//             id: "trans6",
//             date: "2025-03-22",
//             amount: 1820,
//             type: "earning",
//             status: "completed",
//             propertyId: "prop1",
//             propertyTitle: "Luxury Beach House",
//             reservationId: "res9",
//           },
//           {
//             id: "trans7",
//             date: "2025-03-18",
//             amount: 450,
//             type: "refund",
//             status: "completed",
//             propertyId: "prop2",
//             propertyTitle: "Downtown Apartment",
//             reservationId: "res10",
//           },
//         ],
//       });
//     }, 1000);
//   });
// };

const EarningsScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { isHost } = useUserRole();
  const { getSymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState("6month"); // 1month, 3month, 6month, year
  const [filter, setFilter] = useState("all"); // all, earnings, payouts, refunds
  const [refreshing, setRefreshing] = useState(false); // Query for host earnings
  const {
    data: earnings = {
      totalEarnings: 0,
      pendingPayouts: 0,
      thisMonth: 0,
      previousMonth: 0,
      monthlyData: [],
      transactions: [],
    },
    isLoading,
    refetch,
  } = useQuery<HostEarningsResponse>({
    queryKey: ["hostEarnings"],
    queryFn: () => fetchHostEarnings("month"),
  });

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Redirect to traveler mode if not a host
  React.useEffect(() => {
    if (!isHost) {
      router.replace("/(tabs)");
    }
  }, [isHost]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter transactions based on selected filter
  const filteredTransactions = React.useMemo(() => {
    if (!earnings) return [];

    return earnings.transactions.filter((transaction) => {
      return (
        filter === "all" ||
        (filter === "earnings" && transaction.type === "earning") ||
        (filter === "payouts" && transaction.type === "payout") ||
        (filter === "refunds" && transaction.type === "refund")
      );
    });
  }, [earnings, filter]);

  // Get chart data based on timeframe
  const getChartData = () => {
    if (!earnings) return null;

    const monthlyData = [...earnings.monthlyData];
    const now = new Date();
    const currentMonth = now.getMonth();

    let labels: string[] = [];
    let data: number[] = [];

    switch (timeframe) {
      case "1month":
        // Just show current month daily data (simplified for demonstration)
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        data = [
          earnings.thisMonth * 0.2,
          earnings.thisMonth * 0.3,
          earnings.thisMonth * 0.25,
          earnings.thisMonth * 0.25,
        ];
        break;

      case "3month":
        // Show last 3 months
        labels = monthlyData
          .slice(Math.max(0, currentMonth - 2), currentMonth + 1)
          .map((item) => item.month);
        data = monthlyData
          .slice(Math.max(0, currentMonth - 2), currentMonth + 1)
          .map((item) => item.amount);
        break;

      case "year":
        // Show whole year
        labels = monthlyData.map((item) => item.month);
        data = monthlyData.map((item) => item.amount);
        break;

      case "6month":
      default:
        // Show last 6 months
        labels = monthlyData
          .slice(Math.max(0, currentMonth - 5), currentMonth + 1)
          .map((item) => item.month);
        data = monthlyData
          .slice(Math.max(0, currentMonth - 5), currentMonth + 1)
          .map((item) => item.amount);
        break;
    }

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => theme.colors.primary[500],
          strokeWidth: 2,
        },
      ],
    };
  };

  // Get icon and colors for transaction type
  const getTransactionIcon = (type: string, status: string) => {
    if (status !== "completed") {
      return {
        name: "time-outline",
        color: theme.colors.warning[500],
        bgColor: isDark ? theme.colors.warning[900] : theme.colors.warning[100],
      };
    }

    switch (type) {
      case "earning":
        return {
          name: "arrow-down",
          color: theme.colors.success[500],
          bgColor: isDark
            ? theme.colors.success[900]
            : theme.colors.success[100],
        };
      case "payout":
        return {
          name: "arrow-up",
          color: theme.colors.info[500],
          bgColor: isDark ? theme.colors.info[900] : theme.colors.info[100],
        };
      case "refund":
        return {
          name: "return-down-back",
          color: theme.colors.error[500],
          bgColor: isDark ? theme.colors.error[900] : theme.colors.error[100],
        };
      default:
        return {
          name: "cash-outline",
          color: theme.colors.gray[500],
          bgColor: isDark ? theme.colors.gray[800] : theme.colors.gray[200],
        };
    }
  };

  // Render transaction item for FlatList
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type, item.status);

    return (
      <TouchableOpacity
        style={[
          styles.transactionItem,
          {
            borderBottomColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[200],
          },
        ]}
        onPress={() => console.log("Transaction pressed", item.id)}
      >
        <View
          style={[
            styles.transactionIconContainer,
            { backgroundColor: icon.bgColor },
          ]}
        >
          <Ionicons name={icon.name as any} size={16} color={icon.color} />
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text
              style={[
                styles.transactionType,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {t(`host.transactionType.${item.type}`)}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                {
                  color:
                    item.type === "refund"
                      ? theme.colors.error[500]
                      : item.type === "earning"
                      ? theme.colors.success[500]
                      : isDark
                      ? theme.white
                      : theme.colors.gray[900],
                },
              ]}
            >
              {item.type === "refund" || item.type === "payout" ? "-" : "+"}
              {getSymbol()}
              {item.amount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.transactionSubHeader}>
            <Text
              style={[
                styles.propertyName,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
              numberOfLines={1}
            >
              {item.propertyTitle}
            </Text>
            <Text
              style={[
                styles.transactionDate,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {formatDate(item.date)}
            </Text>
          </View>

          {item.status !== "completed" && (
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isDark
                      ? theme.colors.warning[900]
                      : theme.colors.warning[100],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: theme.colors.warning[500] },
                  ]}
                >
                  {t(`host.transactionStatus.${item.status}`)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: isDark ? theme.colors.gray[800] : theme.white,
    backgroundGradientTo: isDark ? theme.colors.gray[800] : theme.white,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      isDark
        ? `rgba(${parseInt(
            theme.colors.primary[500].substring(1, 3),
            16
          )}, ${parseInt(
            theme.colors.primary[500].substring(3, 5),
            16
          )}, ${parseInt(
            theme.colors.primary[500].substring(5, 7),
            16
          )}, ${opacity})`
        : `rgba(${parseInt(
            theme.colors.primary[500].substring(1, 3),
            16
          )}, ${parseInt(
            theme.colors.primary[500].substring(3, 5),
            16
          )}, ${parseInt(
            theme.colors.primary[500].substring(5, 7),
            16
          )}, ${opacity})`,
    labelColor: (opacity = 1) =>
      isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: theme.colors.primary[500],
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  if (!isHost) return null;

  const chartData = getChartData();

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme.colors.gray[900]
            : theme.colors.gray[50],
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Earnings Summary */}
      <Card title={t("host.earningsSummary")}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("common.loading")}
            </Text>
          </View>
        ) : earnings ? (
          <View style={styles.earningsContainer}>
            <View style={styles.earningsRow}>
              <View style={styles.earningsColumn}>
                <Text
                  style={[
                    styles.earningsLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t("host.totalEarnings")}
                </Text>
                <Text
                  style={[
                    styles.earningsValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {getSymbol()}
                  {earnings.totalEarnings.toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsColumn}>
                <Text
                  style={[
                    styles.earningsLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t("host.pendingPayouts")}
                </Text>
                <Text
                  style={[
                    styles.earningsValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {getSymbol()}
                  {earnings.pendingPayouts.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.earningsRow}>
              <View style={styles.earningsColumn}>
                <Text
                  style={[
                    styles.earningsLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t("host.thisMonth")}
                </Text>
                <Text
                  style={[
                    styles.earningsValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {getSymbol()}
                  {earnings.thisMonth.toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsColumn}>
                <Text
                  style={[
                    styles.earningsLabel,
                    {
                      color: isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                    },
                  ]}
                >
                  {t("host.lastMonth")}
                </Text>
                <Text
                  style={[
                    styles.earningsValue,
                    { color: isDark ? theme.white : theme.colors.gray[900] },
                  ]}
                >
                  {getSymbol()}
                  {earnings.previousMonth.toLocaleString()}
                </Text>
                <Text
                  style={[
                    styles.percentChange,
                    {
                      color:
                        earnings.thisMonth > earnings.previousMonth
                          ? theme.colors.success[500]
                          : theme.colors.error[500],
                    },
                  ]}
                >
                  {earnings.thisMonth > earnings.previousMonth ? "+" : ""}
                  {Math.round(
                    ((earnings.thisMonth - earnings.previousMonth) /
                      earnings.previousMonth) *
                      100
                  )}
                  %
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </Card>

      {/* Earnings Chart */}
      <Card title={t("host.earningsOverTime")}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </View>
        ) : chartData ? (
          <View style={styles.chartContainer}>
            {/* Timeframe selection */}
            <View style={styles.timeframeContainer}>
              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === "1month" && {
                    backgroundColor: isDark
                      ? theme.colors.primary[800]
                      : theme.colors.primary[100],
                  },
                ]}
                onPress={() => setTimeframe("1month")}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color:
                        timeframe === "1month"
                          ? theme.colors.primary[500]
                          : isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      fontWeight: timeframe === "1month" ? "600" : "400",
                    },
                  ]}
                >
                  1M
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === "3month" && {
                    backgroundColor: isDark
                      ? theme.colors.primary[800]
                      : theme.colors.primary[100],
                  },
                ]}
                onPress={() => setTimeframe("3month")}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color:
                        timeframe === "3month"
                          ? theme.colors.primary[500]
                          : isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      fontWeight: timeframe === "3month" ? "600" : "400",
                    },
                  ]}
                >
                  3M
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === "6month" && {
                    backgroundColor: isDark
                      ? theme.colors.primary[800]
                      : theme.colors.primary[100],
                  },
                ]}
                onPress={() => setTimeframe("6month")}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color:
                        timeframe === "6month"
                          ? theme.colors.primary[500]
                          : isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      fontWeight: timeframe === "6month" ? "600" : "400",
                    },
                  ]}
                >
                  6M
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timeframeButton,
                  timeframe === "year" && {
                    backgroundColor: isDark
                      ? theme.colors.primary[800]
                      : theme.colors.primary[100],
                  },
                ]}
                onPress={() => setTimeframe("year")}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color:
                        timeframe === "year"
                          ? theme.colors.primary[500]
                          : isDark
                          ? theme.colors.gray[400]
                          : theme.colors.gray[600],
                      fontWeight: timeframe === "year" ? "600" : "400",
                    },
                  ]}
                >
                  1Y
                </Text>
              </TouchableOpacity>
            </View>

            {/* Earnings chart */}
            <LineChart
              data={chartData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: spacing.md,
                borderRadius: radius.md,
              }}
            />
          </View>
        ) : null}
      </Card>

      {/* Transaction History */}
      <View style={styles.transactionHistoryHeader}>
        <Text
          style={[
            styles.transactionHistoryTitle,
            { color: isDark ? theme.white : theme.colors.gray[900] },
          ]}
        >
          {t("host.transactionHistory")}
        </Text>

        <View style={styles.transactionFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "all" && {
                  backgroundColor: isDark
                    ? theme.colors.primary[800]
                    : theme.colors.primary[100],
                },
              ]}
              onPress={() => setFilter("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      filter === "all"
                        ? theme.colors.primary[500]
                        : isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.all")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "earnings" && {
                  backgroundColor: isDark
                    ? theme.colors.primary[800]
                    : theme.colors.primary[100],
                },
              ]}
              onPress={() => setFilter("earnings")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      filter === "earnings"
                        ? theme.colors.primary[500]
                        : isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.earnings")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "payouts" && {
                  backgroundColor: isDark
                    ? theme.colors.primary[800]
                    : theme.colors.primary[100],
                },
              ]}
              onPress={() => setFilter("payouts")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      filter === "payouts"
                        ? theme.colors.primary[500]
                        : isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.payouts")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "refunds" && {
                  backgroundColor: isDark
                    ? theme.colors.primary[800]
                    : theme.colors.primary[100],
                },
              ]}
              onPress={() => setFilter("refunds")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color:
                      filter === "refunds"
                        ? theme.colors.primary[500]
                        : isDark
                        ? theme.colors.gray[400]
                        : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.refunds")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Transactions list */}
      {isLoading ? (
        <View style={styles.loadingTransactionsContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : filteredTransactions.length > 0 ? (
        <Card plain>
          <FlatList
            data={filteredTransactions as Transaction[]}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </Card>
      ) : (
        <EmptyState
          icon="cash-outline"
          title={t("host.noTransactions")}
          message={t("host.noTransactionsDesc")}
          minimized
        />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={() => console.log("Request payout")}
        >
          <Ionicons name="cash-outline" size={20} color={theme.white} />
          <Text style={[styles.actionButtonText, { color: theme.white }]}>
            {t("host.requestPayout")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isDark
                ? theme.colors.gray[800]
                : theme.colors.gray[200],
            },
          ]}
          onPress={() => console.log("Payment methods")}
        >
          <Ionicons
            name="card-outline"
            size={20}
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {t("host.paymentMethods")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom padding */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
  },
  earningsContainer: {
    padding: spacing.md,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  earningsColumn: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  percentChange: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    marginTop: spacing.xs,
  },
  chartContainer: {
    padding: spacing.md,
  },
  timeframeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  timeframeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginHorizontal: spacing.xs,
  },
  timeframeText: {
    fontSize: fontSize.sm,
  },
  transactionHistoryHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  transactionHistoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  transactionFilters: {
    marginBottom: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
  },
  transactionItem: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  transactionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  transactionType: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  transactionSubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyName: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  transactionDate: {
    fontSize: fontSize.xs,
  },
  statusContainer: {
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  loadingTransactionsContainer: {
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionButtonText: {
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});

export default EarningsScreen;
