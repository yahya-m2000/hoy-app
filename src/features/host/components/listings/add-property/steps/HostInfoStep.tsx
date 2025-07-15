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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const hostTypes = [
    { label: t("property.common.individual"), value: "individual" },
    { label: t("property.common.business"), value: "business" },
  ];

  const safetyDisclosures = [
    {
      key: "weaponsOnProperty",
      question: t(
        "property.steps.hostInfo.safetyDisclosures.weaponsOnProperty"
      ),
    },
    {
      key: "securityCameras",
      question: t("property.steps.hostInfo.safetyDisclosures.securityCameras"),
    },
  ];

  const toggleSafetyFeature = (key: string) => {
    const currentSafetyFeatures = formData.safetyFeatures || {};
    let updatedSafetyFeatures = { ...currentSafetyFeatures };
    if (key === "securityCameras") {
      const isOn = !!(
        currentSafetyFeatures.securityCameras &&
        currentSafetyFeatures.securityCameras.exterior
      );
      updatedSafetyFeatures.securityCameras = isOn
        ? { exterior: false, interior: false, description: "" }
        : { exterior: true, interior: false, description: "" };
    } else if (key === "weaponsOnProperty") {
      updatedSafetyFeatures.weaponsOnProperty =
        !currentSafetyFeatures.weaponsOnProperty;
    }
    updateFormData("safetyFeatures", updatedSafetyFeatures);
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
            title={t("property.steps.hostInfo.title")}
            description={t("property.steps.hostInfo.description")}
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
              {t("property.steps.hostInfo.safetyDisclosures.title")}
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
            title={t("property.steps.hostInfo.infoBox.title")}
            content={t("property.steps.hostInfo.infoBox.content")}
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
