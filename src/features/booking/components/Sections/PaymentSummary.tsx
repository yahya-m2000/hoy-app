/**
 * Payment Summary Card Component
 * Displays payment details in a clean card format
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@shared/components";
import { useTranslation } from "react-i18next";
// Context
import { useTheme } from "@core/hooks";

// Constants
import { fontSize, spacing, radius } from "@core/design";

interface PriceDetails {
  basePrice: number | undefined;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  nights: number;
  pricePerNight: number;
}

interface PaymentSummaryProps {
  priceDetails: PriceDetails;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ priceDetails }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
          borderColor: isDark ? theme.colors.gray[700] : theme.colors.gray[200],
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.white : theme.colors.gray[900] },
        ]}
      >
        {t("features.booking.payment.paymentDetails")}
      </Text>
      <View style={styles.contentContainer}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.gray[600] }]}>
            {t("features.booking.payment.basePrice")}
          </Text>
          <Text
            style={[
              styles.priceValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            ${priceDetails.basePrice || 0}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.gray[600] }]}>
            {t("features.booking.payment.cleaningFee")}
          </Text>
          <Text
            style={[
              styles.priceValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            ${priceDetails.cleaningFee}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.gray[600] }]}>
            {t("features.booking.payment.serviceFee")}
          </Text>
          <Text
            style={[
              styles.priceValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            ${priceDetails.serviceFee}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.gray[600] }]}>
            {t("features.booking.payment.taxes")}
          </Text>
          <Text
            style={[
              styles.priceValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            ${priceDetails.taxes}
          </Text>
        </View>

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text
            style={[
              styles.totalLabel,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("features.booking.payment.total")}
          </Text>
          <Text
            style={[
              styles.totalValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            $
            {(priceDetails.basePrice || 0) +
              priceDetails.cleaningFee +
              priceDetails.serviceFee +
              priceDetails.taxes}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  priceValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
    flex: 1,
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});

export default PaymentSummary;
