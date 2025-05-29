import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "src/common/context/ThemeContext";
import { useCurrency } from "@common-hooks/useCurrency";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";
import Card from "@common-components/Card";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HostDashboard } from "@common/types/dashboard";

interface EarningsSummaryProps {
  isLoading: boolean;
  data: HostDashboard | undefined;
}

const EarningsSummary = ({ isLoading, data }: EarningsSummaryProps) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { getSymbol } = useCurrency();

  return (
    <Card title={t("host.earnings")}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text
            style={[
              styles.loadingText,
              {
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : (
        <View style={styles.earningsContainer}>
          <View style={styles.earningsRow}>
            <View style={styles.earningsColumn}>
              <Text
                style={[
                  styles.earningsLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.totalEarnings")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {getSymbol()}
                {data?.totalEarnings?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.earningsColumn}>
              <Text
                style={[
                  styles.earningsLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.pendingPayouts")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {getSymbol()}
                {data?.pendingPayouts?.toLocaleString() || "0"}
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
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.thisMonth")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {getSymbol()}
                {data?.thisMonth?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.earningsColumn}>
              <Text
                style={[
                  styles.earningsLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.lastMonth")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {getSymbol()}
                {data?.lastMonth?.toLocaleString() || "0"}
              </Text>{" "}
              <Text
                style={[
                  styles.percentChange,
                  {
                    color:
                      data &&
                      data.thisMonth !== undefined &&
                      data.lastMonth !== undefined &&
                      data.thisMonth > data.lastMonth
                        ? theme.colors.successPalette[500]
                        : theme.colors.errorPalette[500],
                  },
                ]}
              >
                {data &&
                data.thisMonth !== undefined &&
                data.lastMonth !== undefined &&
                data.lastMonth > 0
                  ? (data.thisMonth > data.lastMonth ? "+" : "") +
                    Math.round(
                      ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100
                    ) +
                    "%"
                  : ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.viewAllButton,
              {
                backgroundColor: isDark
                  ? theme.colors.grayPalette[800]
                  : theme.colors.grayPalette[200],
              },
            ]}
            onPress={() => router.push("/host/earnings")}
          >
            <Text
              style={[
                styles.viewAllButtonText,
                {
                  color: isDark
                    ? theme.colors.grayPalette[300]
                    : theme.colors.grayPalette[700],
                },
              ]}
            >
              {t("host.viewAllEarnings")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={
                isDark
                  ? theme.colors.grayPalette[300]
                  : theme.colors.grayPalette[700]
              }
            />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
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
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  viewAllButtonText: {
    fontWeight: "500",
    marginRight: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
  },
  loadingText: {
    fontSize: fontSize.md,
  },
});

export default EarningsSummary;
