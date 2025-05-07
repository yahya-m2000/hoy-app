/**
 * Payment Summary component for the Hoy application
 * Displays a summary of the payment details for a reservation
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

import CardLogo from "./CardLogo";
import { fontSize } from "../constants/typography";
import { spacing } from "../constants/spacing";
import { useCurrency } from "../hooks/useCurrency";

interface PaymentSummaryProps {
  priceDetails: {
    basePrice: number;
    cleaningFee?: number;
    serviceFee?: number;
    taxes?: number;
    totalPrice: number;
    currency?: string;
    nights: number;
    pricePerNight: number;
  };
  paymentMethod?: {
    id: string;
    type: string;
    details: {
      brand?: string;
      last4?: string;
      expiry?: string;
    };
  };
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  priceDetails,
  paymentMethod,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { currency, formatAmount } = useCurrency();

  // Format number with currency
  const formatPrice = (amount: number) => {
    return formatAmount(amount, priceDetails?.currency || currency);
  };

  return (
    <View style={styles.container}>
      {/* Pricing Breakdown */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? theme.colors.gray[200] : theme.colors.gray[800] },
          ]}
        >
          {t("payment.priceSummary")}
        </Text>

        <View style={styles.priceRow}>
          <Text
            style={[
              styles.priceLabel,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {formatPrice(priceDetails.pricePerNight)} × {priceDetails.nights}
            {priceDetails.nights === 1 ? t("common.night") : t("common.nights")}
          </Text>
          <Text
            style={[
              styles.priceValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {formatPrice(priceDetails.basePrice)}
          </Text>
        </View>

        {priceDetails.cleaningFee && priceDetails.cleaningFee > 0 && (
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("payment.cleaningFee")}
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {formatPrice(priceDetails.cleaningFee)}
            </Text>
          </View>
        )}

        {priceDetails.serviceFee && priceDetails.serviceFee > 0 && (
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("payment.serviceFee")}
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {formatPrice(priceDetails.serviceFee)}
            </Text>
          </View>
        )}

        {priceDetails.taxes && priceDetails.taxes > 0 && (
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.priceLabel,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("payment.taxes")}
            </Text>
            <Text
              style={[
                styles.priceValue,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {formatPrice(priceDetails.taxes)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />

        <View style={styles.totalRow}>
          <Text
            style={[
              styles.totalLabel,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {t("payment.total")}
          </Text>
          <Text
            style={[
              styles.totalValue,
              { color: isDark ? theme.white : theme.colors.gray[900] },
            ]}
          >
            {formatPrice(priceDetails.totalPrice)}
          </Text>
        </View>
      </View>

      {/* Payment Method */}
      {paymentMethod && (
        <View style={[styles.section, styles.paymentMethodSection]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? theme.colors.gray[200] : theme.colors.gray[800],
              },
            ]}
          >
            {t("payment.paymentMethod")}
          </Text>

          <View style={styles.paymentMethodRow}>
            {paymentMethod.details.brand && (
              <CardLogo brand={paymentMethod.details.brand} size="small" />
            )}

            <Text
              style={[
                styles.paymentMethodText,
                { color: isDark ? theme.white : theme.colors.gray[900] },
              ]}
            >
              {paymentMethod.details.brand} •••• {paymentMethod.details.last4}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  paymentMethodSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: fontSize.sm,
  },
  priceValue: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
});

export default PaymentSummary;
