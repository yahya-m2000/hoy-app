/**
 * Payment Summary Card Component
 * Displays payment details in a clean card format
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@common/context/ThemeContext";
import { useTranslation } from "react-i18next";
import PaymentSummary from "@host-components/PaymentSummary";
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";

interface PriceDetails {
  basePrice: number | undefined;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  nights: number;
  pricePerNight: number;
}

interface PaymentSummaryCardProps {
  priceDetails: PriceDetails;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  priceDetails,
}) => {
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
      {" "}
      <Text
        style={[
          styles.title,
          { color: isDark ? theme.white : theme.colors.grayPalette[900] },
        ]}
      >
        {t("booking.paymentDetails")}
      </Text>
      <View style={styles.contentContainer}>
        <PaymentSummary priceDetails={priceDetails} />
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
});

export default PaymentSummaryCard;
