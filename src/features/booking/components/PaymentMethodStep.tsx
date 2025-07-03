/**
 * Payment Method Step Component
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Context & Hooks
import { useTheme } from "@core/hooks";

// Components
import PaymentMethodSelector from "./Forms/PaymentMethodSelector";

// Utils & Types
import { createZaadPaymentMethod } from "../utils";
import type { BookingStepProps } from "@core/types";

// Constants
import { spacing, fontSize, radius } from "@core/design";
import { TEST_PAYMENT_METHOD, ZAAD_CONFIG } from "../constants";

import type { PaymentMethod } from "@core/types/booking.types";

interface PaymentMethodStepProps extends BookingStepProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  selectedMethod,
  onSelectMethod,
  onNext,
  onBack,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const handleTestPayment = () => {
    onSelectMethod(TEST_PAYMENT_METHOD);
    onNext();
  };

  const handleZaadPayment = () => {
    const zaadPaymentMethod = createZaadPaymentMethod();
    onSelectMethod(zaadPaymentMethod);
    onNext();
  };
  return (
    <View>
      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethod={
          selectedMethod?.type === "zaad" ? (selectedMethod as any) : null
        }
        onSelect={onSelectMethod as any}
      />
      {/* Skip payment option for testing */}
      <TouchableOpacity
        style={[
          styles.testPaymentButton,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderColor: theme.colors.warning[500],
          },
        ]}
        onPress={handleTestPayment}
      >
        <Ionicons
          name="construct-outline"
          size={20}
          color={theme.colors.warning[500]}
        />
        <Text
          style={[styles.testPaymentText, { color: theme.colors.warning[500] }]}
        >
          Skip Payment (Testing Only)
        </Text>
      </TouchableOpacity>
      {/* ZAAD Mobile Payment Option */}
      <TouchableOpacity
        style={[
          styles.zaadPaymentButton,
          {
            backgroundColor: isDark
              ? theme.colors.gray[800]
              : theme.colors.gray[100],
            borderColor: ZAAD_CONFIG.BRAND_COLOR,
          },
        ]}
        onPress={handleZaadPayment}
      >
        <View style={styles.zaadLogoContainer}>
          <Text style={styles.zaadLogoText}>ZAAD</Text>
        </View>
        <Text
          style={[styles.zaadPaymentText, { color: ZAAD_CONFIG.BRAND_COLOR }]}
        >
          Pay with ZAAD (Mobile Money)
        </Text>
      </TouchableOpacity>
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={20}
              color={theme.colors.gray[700]}
            />
            <Text
              style={[styles.backButtonText, { color: theme.colors.gray[700] }]}
            >
              {t("common.back")}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedMethod
                ? theme.colors.primary
                : theme.colors.gray[400],
            },
          ]}
          disabled={!selectedMethod}
          onPress={onNext}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  testPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  testPaymentText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  zaadPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
  },
  zaadPaymentText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  zaadLogoContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ZAAD_CONFIG.BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  zaadLogoText: {
    color: "white",
    fontWeight: "700",
    fontSize: fontSize.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    flex: 1,
    marginLeft: spacing.md,
  },
  continueButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
});

export default PaymentMethodStep;
