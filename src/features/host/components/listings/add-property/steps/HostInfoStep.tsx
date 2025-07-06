import React from "react";
import {
  View,
  Switch,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Container, Text, Button } from "@shared/components";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { spacing } from "@core/design";
import { useTheme } from "@core/hooks";

interface HostInfoStepProps {
  formData: any;
  updateFormData: (field: keyof any, value: any) => void;
  errors: Record<string, string>;
}

export default function HostInfoStep({
  formData,
  updateFormData,
  errors,
}: HostInfoStepProps) {
  const { theme } = useTheme();

  const hostTypes = [
    { label: "Individual", value: "individual" },
    { label: "Business", value: "business" },
  ];

  const safetyDisclosures = [
    {
      key: "weaponsOnProperty",
      question: "Are there any weapons on the property?",
    },
    {
      key: "securityCameras",
      question: "Are there security cameras on the property?",
    },
  ];

  const toggleSafetyFeature = (key: string) => {
    const currentSafetyFeatures = formData.safetyFeatures || {};
    updateFormData("safetyFeatures", {
      ...currentSafetyFeatures,
      [key]: !currentSafetyFeatures[key],
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Container paddingBottom="xxl">
          <StepHeader
            title="Tell us about yourself"
            description="Are you listing as an individual or business?"
          />

          <Container marginTop="lg">
            {hostTypes.map((type) => (
              <Button
                key={type.value}
                title={type.label}
                variant={
                  formData.hostType === type.value ? "primary" : "outline"
                }
                onPress={() => updateFormData("hostType", type.value)}
                style={{ marginBottom: spacing.sm }}
              />
            ))}
          </Container>

          <Container marginTop="xl">
            <Text
              variant="subtitle"
              weight="medium"
              style={{ marginBottom: spacing.md }}
            >
              Safety disclosures
            </Text>

            {safetyDisclosures.map((item) => (
              <View key={item.key} style={styles.toggleRow}>
                <Text variant="body" style={styles.toggleLabel}>
                  {item.question}
                </Text>
                <Switch
                  value={formData.safetyFeatures?.[item.key] || false}
                  onValueChange={() => toggleSafetyFeature(item.key)}
                  trackColor={{
                    false: theme.colors.tertiary,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.white}
                />
              </View>
            ))}
          </Container>

          <InfoBox
            title="Safety & Legal"
            content="Being transparent about safety features and potential risks helps build trust with guests and ensures compliance with local regulations."
            icon="information-circle"
            variant="info"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  toggleLabel: {
    flex: 1,
    marginRight: spacing.md,
  },
});
