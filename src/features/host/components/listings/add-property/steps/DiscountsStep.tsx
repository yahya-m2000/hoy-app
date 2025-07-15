import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import { Container, Text } from "@shared/components";
import StepHeader from "../StepHeader";
import { spacing } from "@core/design";
import { useTheme } from "@core/hooks";
import { useTranslation } from "react-i18next";

interface DiscountsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function DiscountsStep({
  formData,
  updateFormData,
}: DiscountsStepProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const discounts = [
    {
      key: "newListingPromo",
      label: t("property.pricing.newListingDiscount"),
      description: t("property.pricing.newListingDiscountDescription"),
    },
    {
      key: "lastMinuteDiscount",
      label: t("property.pricing.lastMinuteDiscount"),
      description: t("property.pricing.lastMinuteDiscountDescription"),
    },
  ];

  const toggleDiscount = (key: string) => {
    updateFormData({
      discounts: {
        ...formData.discounts,
        [key]: !formData.discounts?.[key],
      },
    });
  };

  return (
    <Container>
      <StepHeader
        title={t("property.steps.discounts.title")}
        description={t("property.steps.discounts.description")}
      />

      <Container marginTop="lg">
        {discounts.map((discount) => (
          <View key={discount.key} style={styles.discountRow}>
            <View style={styles.discountInfo}>
              <Text variant="body" weight="medium">
                {discount.label}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={{ marginTop: spacing.xs }}
              >
                {discount.description}
              </Text>
            </View>
            <Switch
              value={formData.discounts?.[discount.key] || false}
              onValueChange={() => toggleDiscount(discount.key)}
              trackColor={{
                false: theme.colors.tertiary,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.white}
            />
          </View>
        ))}
      </Container>
    </Container>
  );
}

const styles = StyleSheet.create({
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  discountInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
});
