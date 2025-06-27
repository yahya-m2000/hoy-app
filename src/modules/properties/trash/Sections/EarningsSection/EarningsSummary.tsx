import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@shared/hooks/useTheme";
import { useCurrency } from "@shared/hooks/useCurrency";

import { DetailCard as Card } from "@shared/components";

import { spacing, fontSize, radius } from "@shared/constants";

import { HostDashboard } from "@shared/types";

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
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
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
                  { color: isDark ? theme.colors.white : theme.colors.black },
                ]}
              >
                {getSymbol()}
                {data?.earnings?.thisMonth?.toFixed(2) || "0.00"}
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
                  { color: isDark ? theme.colors.white : theme.colors.black },
                ]}
              >
                {getSymbol()}
                {data?.earnings?.lastMonth?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[300],
              },
            ]}
          />

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
                {t("host.forYear")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  { color: isDark ? theme.colors.white : theme.colors.black },
                ]}
              >
                {getSymbol()}
                {data?.earnings?.yearToDate?.toFixed(2) || "0.00"}
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
                {t("host.upcoming")}
              </Text>
              <Text
                style={[
                  styles.earningsValue,
                  { color: isDark ? theme.colors.white : theme.colors.black },
                ]}
              >
                {getSymbol()}
                {data?.earnings?.upcoming?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.viewMoreButton,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[200],
              },
            ]}
            onPress={() => router.push("/host/earnings")}
          >
            <Text
              style={[
                styles.viewMoreText,
                { color: isDark ? theme.colors.white : theme.colors.black },
              ]}
            >
              {t("host.viewMoreEarnings")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isDark ? theme.colors.white : theme.colors.black}
            />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fontSize.md,
  },
  earningsContainer: {
    padding: spacing.md,
  },
  earningsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.sm,
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
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  viewMoreText: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
});

export default EarningsSummary;
