import React from "react";
import { View, StyleSheet } from "react-native";
import { Container, Text, Button, Icon } from "@shared/components";
import StepHeader from "../StepHeader";
import { spacing, iconSize } from "@core/design";
import { useTranslation } from "react-i18next";

interface PoliciesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function PoliciesStep({
  formData,
  updateFormData,
}: PoliciesStepProps) {
  const { t } = useTranslation();
  const policies = [
    {
      title: t("property.pricing.cancellationPolicy"),
      description: t("property.pricing.cancellationPolicyDescription"),
      icon: "close-circle-outline",
    },
    {
      title: t("property.steps.policies.houseRules.title"),
      description: t("property.steps.policies.houseRules.description"),
      icon: "home-outline",
    },
    {
      title: t("property.steps.policies.safetyInfo.title"),
      description: t("property.steps.policies.safetyInfo.description"),
      icon: "shield-outline",
    },
  ];

  return (
    <Container>
      <StepHeader
        title={t("property.steps.policies.title")}
        description={t("property.steps.policies.description")}
      />

      <Container marginTop="lg">
        {policies.map((policy, index) => (
          <View key={index} style={styles.policyCard}>
            <Icon
              name={policy.icon as any}
              size={iconSize.lg}
              color="primary"
              style={styles.policyIcon}
            />
            <View style={styles.policyContent}>
              <Text variant="subtitle" weight="medium">
                {policy.title}
              </Text>
              <Text
                variant="caption"
                color="secondary"
                style={{ marginTop: spacing.xs }}
              >
                {policy.description}
              </Text>
            </View>
            <Button
              title={t("property.common.modify")}
              variant="outline"
              size="small"
              onPress={() => {}}
            />
          </View>
        ))}
      </Container>
    </Container>
  );
}

const styles = StyleSheet.create({
  policyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  policyIcon: {
    marginRight: spacing.md,
  },
  policyContent: {
    flex: 1,
    marginRight: spacing.md,
  },
});
