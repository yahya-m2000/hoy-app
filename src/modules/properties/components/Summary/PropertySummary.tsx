/**
 * PropertySummary Component
 * Displays property statistics for host dashboard
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@shared/context";
import { Card } from "@shared/components";
import { EmptyState } from "@shared/components/common";
import { spacing, fontSize, radius } from "@shared/constants";

import { HostDashboard } from "@shared/types";

interface PropertySummaryProps {
  isLoading: boolean;
  data: HostDashboard | undefined;
}

const PropertySummary = ({ isLoading, data }: PropertySummaryProps) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <Card
      title={t("host.yourProperties")}
      icon="business-outline"
      onPress={() => router.push("/host/properties")}
    >
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
      ) : data?.properties?.total ? (
        <>
          <View style={styles.propertySummary}>
            <View style={styles.propertyStat}>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.totalProperties")}
              </Text>
              <Text
                style={[
                  styles.statValue,
                  { color: isDark ? theme.colors.white : theme.colors.black },
                ]}
              >
                {data.properties.total}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.active")}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {data.properties.active}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
                  },
                ]}
              >
                {t("host.inactive")}
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {data.properties.inactive}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.occupancyContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[800]
                  : theme.colors.gray[200],
              },
            ]}
          >
            <Text
              style={[
                styles.occupancyLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("host.occupancyRate")}
            </Text>
            <Text
              style={[
                styles.occupancyValue,
                { color: isDark ? theme.colors.white : theme.colors.black },
              ]}
            >
              {data?.properties?.occupancyRate?.toFixed(0) || "0"}%
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addPropertyButton}
            onPress={() => router.push("/host/add-property")}
          >
            <Text
              style={[styles.addPropertyText, { color: theme.colors.primary }]}
            >
              {t("host.addNewProperty")}
            </Text>
            <Ionicons
              name="add-circle"
              size={18}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </>
      ) : (
        <EmptyState
          icon="business-outline"
          title={t("host.noProperties")}
          message={t("host.noPropertiesMessage")}
          action={{
            label: t("host.addProperty"),
            onPress: () => router.push("/host/add-property"),
          }}
        />
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
  propertySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  propertyStat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  occupancyContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  occupancyLabel: {
    fontSize: fontSize.md,
  },
  occupancyValue: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  addPropertyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  addPropertyText: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
});

export default PropertySummary;
