import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useTheme } from "@core/hooks";
import { Text, Button } from "@shared/components";
import { spacing } from "@core/design";
import { useHostSetup, useHostSetupForm } from "../hooks";
import {
  LegacySetupProgress,
  CancellationPolicyForm,
  HouseRulesForm,
  SafetyInformationForm,
  PropertyInformationForm,
} from "../components/setup";

export const HostSetupScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { setupPolicies, loading } = useHostSetup();
  const {
    formData,
    validationErrors,
    updateFormData,
    validateForm,
    createSetupRequest,
  } = useHostSetupForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 4;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await handleCompleteSetup();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      console.log("Starting setup completion...");
      console.log("Form data:", JSON.stringify(formData, null, 2));

      const isValid = validateForm();
      console.log("Validation result:", isValid);
      console.log("Validation errors:", validationErrors);
      if (!isValid) {
        console.log("Validation failed, showing error alert");
        const errorMessages = Object.values(validationErrors).join("\n");
        const alertMessage =
          errorMessages.length > 0
            ? `${t("system.errors.validation.invalidInput")}\n\n${errorMessages}`
            : t("system.errors.validation.invalidInput");

        Alert.alert(t("common.error"), alertMessage);
        return;
      }

      const setupRequest = createSetupRequest();
      console.log("Setup request:", JSON.stringify(setupRequest, null, 2));

      const result = await setupPolicies(setupRequest);
      console.log("Setup result:", result);

      Alert.alert(
        t("features.host.setup.success.title"),
        t("features.host.setup.success.message"),
        [
          {
            text: t("common.ok"),
            onPress: () => router.replace("/(tabs)/host/today"),
          },
        ]
      );
    } catch (error) {
      console.error("Setup failed with error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      Alert.alert(t("common.error"), t("system.errors.data.saveFailed"), [
        { text: t("common.ok") },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(t("features.host.setup.navigation.cancelTitle"), t("features.host.setup.navigation.cancelMessage"), [
      {
        text: t("common.continue"),
        style: "default",
      },
      {
        text: t("features.host.setup.navigation.cancelConfirm"),
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  };
  const getCurrentStepErrors = () => {
    // Return validation errors specific to the current step
    const stepFields = [
      [
        "refundPeriodDays",
        "fullRefundDays",
        "partialRefundDays",
        "noRefundDays",
      ], // Cancellation policy
      ["checkInTime", "checkOutTime", "quietHoursStart", "quietHoursEnd"], // House rules
      [], // Safety (mostly optional)
      [], // Property (mostly optional)
    ];

    const currentStepFields = stepFields[currentStep] || [];
    const errors: Record<string, string> = {};

    currentStepFields.forEach((field) => {
      if (validationErrors[field]) {
        errors[field] = validationErrors[field];
      }
    });

    return errors;
  };

  const renderCurrentStepForm = () => {
    const errors = getCurrentStepErrors();

    switch (currentStep) {
      case 0:
        return (
          <CancellationPolicyForm
            data={formData.cancellationPolicy}
            errors={errors}
            onChange={(data) => updateFormData("cancellationPolicy", data)}
          />
        );
      case 1:
        return (
          <HouseRulesForm
            data={formData.houseRules}
            errors={errors}
            onChange={(data) => updateFormData("houseRules", data)}
          />
        );
      case 2:
        return (
          <SafetyInformationForm
            data={formData.safetyInformation}
            errors={errors}
            onChange={(data) => updateFormData("safetyInformation", data)}
          />
        );
      case 3:
        return (
          <PropertyInformationForm
            data={formData.propertyInformation}
            errors={errors}
            onChange={(data) => updateFormData("propertyInformation", data)}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text variant="h3">{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text variant="h2" style={styles.title}>
          {t("features.host.setup.main.title")}
        </Text>
        <Text
          variant="body"
          color={theme.text.secondary}
          style={styles.subtitle}
        >
          {t("features.host.setup.main.subtitle")}
        </Text>
      </View>

      {/* Form Content with ScrollView */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStepForm()}
      </ScrollView>

      {/* Progress Dots - positioned above footer */}
      <LegacySetupProgress currentStep={currentStep} totalSteps={totalSteps} />

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.colors.white, borderTopColor: theme.border },
        ]}
      >
        <View style={styles.buttonRow}>
          <Button
            variant="outline"
            onPress={handleCancel}
            style={styles.cancelButton}
            title={t("common.cancel")}
          />

          <View style={styles.navigationButtons}>
            {canGoPrevious && (
              <Button
                variant="outline"
                onPress={handlePrevious}
                style={styles.navButton}
                title={t("common.back")}
              />
            )}

            <Button
              onPress={handleNext}
              disabled={isSaving}
              loading={isSaving}
              style={styles.navButton}
              title={isLastStep ? t("features.host.setup.navigation.finish") : t("common.continue")}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    elevation: 8, // Add shadow on Android
    shadowColor: "#000", // Add shadow on iOS
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelButton: {
    minWidth: 100,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  navButton: {
    minWidth: 100,
  },
});
