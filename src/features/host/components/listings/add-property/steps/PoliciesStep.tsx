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
      title: t("features.property.listing.policies.cancellationPolicy.title"),
      description: t("features.property.listing.policies.cancellationPolicy.description"),
      icon: "close-circle-outline",
    },
    {
      title: t("features.property.listing.policies.houseRules.title"),
      description: t("features.property.listing.policies.houseRules.description"),
      icon: "home-outline",
    },
    {
      title: t("features.property.listing.policies.safetyInfo.title"),
      description: t("features.property.listing.policies.safetyInfo.description"),
      icon: "shield-outline",
    },
  ];

  return (
    <Container>
      <StepHeader
        title={t("features.property.listing.steps.policies.title")}
        description={t("features.property.listing.steps.policies.description")}
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
              title={t("features.property.listing.actions.modify")}
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
