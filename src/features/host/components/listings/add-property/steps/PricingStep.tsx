import React from "react";
import { View, StyleSheet } from "react-native";
import { Container, Text, Button, Input } from "@shared/components";
import StepHeader from "../StepHeader";
import { spacing } from "@core/design";
import { formatCurrency } from "@core/utils/data/currency";
import { useTranslation } from "react-i18next";

interface PricingStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
  isWeekend?: boolean;
}

export default function PricingStep({
  formData,
  updateFormData,
  errors,
  isWeekend = false,
}: PricingStepProps) {
  const { t } = useTranslation();
  const priceKey = isWeekend ? "weekendPrice" : "weekdayPrice";
  const currentPrice = formData[priceKey] || 0;
  const error = errors[priceKey];

  const adjustPrice = (amount: number) => {
    const newPrice = Math.max(0, currentPrice + amount);
    updateFormData(priceKey, newPrice);
  };

  const handlePriceInput = (text: string) => {
    const numericValue = parseFloat(text.replace(/[^0-9.]/g, "")) || 0;
    updateFormData(priceKey, numericValue);
  };

  return (
    <Container>
      <StepHeader
        title={t(`property.steps.pricing.title`, {
          type: t(
            isWeekend
              ? "property.steps.pricing.weekend"
              : "property.steps.pricing.weekday"
          ),
        })}
        description={t("property.steps.pricing.description")}
      />

      <Container alignItems="center" marginVertical="xl">
        <View style={styles.priceInputContainer}>
          <Text
            variant="h2"
            weight="bold"
            color="primary"
            style={styles.currencySymbol}
          >
            $
          </Text>
          <Input
            style={[styles.priceInput, error && styles.priceInputError]}
            value={currentPrice.toString()}
            onChangeText={handlePriceInput}
            keyboardType="numeric"
            placeholder={t("property.steps.pricing.pricePlaceholder")}
          />
        </View>
        <Text
          variant="body"
          color="secondary"
          style={{ marginTop: spacing.xs }}
        >
          {t("property.steps.pricing.perNight")}
        </Text>
        {error && (
          <Text variant="caption" color="error" style={styles.errorText}>
            {error}
          </Text>
        )}
        {currentPrice > 0 && currentPrice < 10 && !error && (
          <Text variant="caption" color="warning" style={styles.warningText}>
            {t("property.steps.pricing.lowPriceWarning")}
          </Text>
        )}
      </Container>

      <View style={styles.priceControls}>
        <Button
          title={t("property.steps.pricing.minusTen")}
          variant="outline"
          onPress={() => adjustPrice(-10)}
          style={styles.priceButton}
        />
        <Button
          title={t("property.steps.pricing.minusFive")}
          variant="outline"
          onPress={() => adjustPrice(-5)}
          style={styles.priceButton}
        />
        <Button
          title={t("property.steps.pricing.plusFive")}
          variant="primary"
          onPress={() => adjustPrice(5)}
          style={styles.priceButton}
        />
        <Button
          title={t("property.steps.pricing.plusTen")}
          variant="primary"
          onPress={() => adjustPrice(10)}
          style={styles.priceButton}
        />
      </View>

      <Container
        marginTop="lg"
        padding="md"
        backgroundColor="surfaceVariant"
        style={styles.tipContainer}
      >
        <Text variant="caption" color="onSurfaceVariant">
          {t("property.steps.pricing.tip")}
        </Text>
      </Container>
    </Container>
  );
}

const styles = StyleSheet.create({
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    marginRight: spacing.xs,
  },
  priceInput: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#0066FF",
    borderBottomWidth: 2,
    borderBottomColor: "#0066FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 120,
    textAlign: "center",
  },
  priceInputError: {
    borderBottomColor: "#FF6B6B",
  },
  errorText: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  warningText: {
    marginTop: spacing.sm,
    textAlign: "center",
    color: "#FFA500",
  },
  priceControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.xl,
  },
  priceButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  tipContainer: {
    borderRadius: 8,
  },
});
