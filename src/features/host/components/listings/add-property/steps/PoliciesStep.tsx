import React from "react";
import { View, StyleSheet } from "react-native";
import { Container, Text, Button, Icon } from "@shared/components";
import StepHeader from "../StepHeader";
import { spacing, iconSize } from "@core/design";

interface PoliciesStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function PoliciesStep({
  formData,
  updateFormData,
}: PoliciesStepProps) {
  const policies = [
    {
      title: "Cancellation Policy",
      description: "Moderate - Full refund 5 days before arrival",
      icon: "close-circle-outline",
    },
    {
      title: "House Rules",
      description: "Check-in: 3:00 PM, Check-out: 11:00 AM",
      icon: "home-outline",
    },
    {
      title: "Safety Information",
      description: "Standard safety features included",
      icon: "shield-outline",
    },
  ];

  return (
    <Container>
      <StepHeader
        title="Review your policies"
        description="These are your default policies. You can customize them for this property."
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
              title="Modify"
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
