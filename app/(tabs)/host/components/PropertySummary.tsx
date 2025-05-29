/**
 * PropertySummary Component
 * Displays property statistics for host dashboard
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@common/context/ThemeContext";
import { spacing } from "@common/constants/spacing";
import { fontSize } from "@common/constants/typography";
import { radius } from "@common/constants/radius";
import Card from "@common-components/Card";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "@common-components/EmptyState";
import { HostDashboard } from "@common/types/dashboard";

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
                color: isDark
                  ? theme.colors.grayPalette[400]
                  : theme.colors.grayPalette[600],
              },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      ) : data?.properties?.length ? (
        <>
          <View style={styles.propertySummary}>
            <View style={styles.propertyStat}>
              <Text
                style={[
                  styles.propertyStatValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {data.properties.length}
              </Text>
              <Text
                style={[
                  styles.propertyStatLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.totalProperties")}
              </Text>
            </View>{" "}
            <View style={styles.propertyStat}>
              <Text
                style={[
                  styles.propertyStatValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {(() => {
                  const properties = data?.properties;
                  if (!properties || !Array.isArray(properties)) return 0;
                  return properties.filter((p) => p.isActive).length;
                })()}
              </Text>
              <Text
                style={[
                  styles.propertyStatLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.activeProperties")}
              </Text>
            </View>
            <View style={styles.propertyStat}>
              {" "}
              <Text
                style={[
                  styles.propertyStatValue,
                  {
                    color: isDark
                      ? theme.colors.white
                      : theme.colors.grayPalette[900],
                  },
                ]}
              >
                {" "}
                {(() => {
                  const properties = data?.properties;
                  if (
                    !properties ||
                    !Array.isArray(properties) ||
                    properties.length === 0
                  )
                    return 0;
                  const activeProperties = properties.filter((p) => p.isActive);
                  if (activeProperties.length === 0) return 0;
                  const totalOccupancy = properties.reduce(
                    (sum, p) => (p.isActive ? sum + p.occupancyRate : sum),
                    0
                  );
                  return Math.round(totalOccupancy / activeProperties.length);
                })()}
                %
              </Text>
              <Text
                style={[
                  styles.propertyStatLabel,
                  {
                    color: isDark
                      ? theme.colors.grayPalette[400]
                      : theme.colors.grayPalette[600],
                  },
                ]}
              >
                {t("host.avgOccupancy")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addPropertyButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/host/add-property")}
          >
            <Ionicons name="add" size={20} color={theme.colors.white} />
            <Text
              style={[
                styles.addPropertyButtonText,
                { color: theme.colors.white },
              ]}
            >
              {t("host.addProperty")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <EmptyState
          icon="business-outline"
          title={t("host.noProperties")}
          message={t("host.noPropertiesDesc")}
          action={{
            label: t("host.addProperty"),
            onPress: () => router.push("/host/add-property"),
          }}
          minimized
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  propertySummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  propertyStat: {
    alignItems: "center",
    flex: 1,
  },
  propertyStatValue: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  propertyStatLabel: {
    fontSize: fontSize.sm,
    textAlign: "center",
  },
  addPropertyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  addPropertyButtonText: {
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.md,
    alignItems: "center",
  },
  loadingText: {
    fontSize: fontSize.md,
  },
});

export default PropertySummary;
