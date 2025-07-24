import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Text, Button, Icon, OverlayScreen } from "@shared/components";
import { spacing } from "@core/design";
import { useHostSetup, useHostSetupForm } from "../../hooks";
import { CancellationPolicyForm } from "./CancellationPolicyForm";
import { HouseRulesForm } from "./HouseRulesForm";
import { SafetyInformationForm } from "./SafetyInformationForm";
import { PropertyInformationForm } from "./PropertyInformationForm";
import { LegacySetupProgress } from "./SetupProgress";

export interface HostSetupStepperProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const SETUP_STEPS = [
  {
    id: "cancellation",
    title: "host.policies.cancellation.title",
    subtitle: "host.policies.cancellation.subtitle",
    icon: "calendar-outline",
  },
  {
    id: "rules",
    title: "host.policies.houseRules.title",
    subtitle: "host.policies.houseRules.subtitle",
    icon: "list-outline",
  },
  {
    id: "safety",
    title: "host.policies.safety.title",
    subtitle: "host.policies.safety.subtitle",
    icon: "shield-checkmark-outline",
  },
  {
    id: "property",
    title: "host.policies.property.title",
    subtitle: "host.policies.property.subtitle",
    icon: "home-outline",
  },
];

export const HostSetupStepper: React.FC<HostSetupStepperProps> = ({
  onComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    setupPolicies,
    loading: setupLoading,
    error: setupError,
  } = useHostSetup();
  const {
    formData,
    validationErrors,
    updateFormData,
    validateForm,
    createSetupRequest,
    resetForm,
  } = useHostSetupForm();

  const currentStepData = SETUP_STEPS[currentStep];
  const isLastStep = currentStep === SETUP_STEPS.length - 1;

  const handleNext = useCallback(async () => {
    if (isLastStep) {
      // Submit the form
      setIsSubmitting(true);
      try {
        if (!validateForm()) {
          setIsSubmitting(false);
          return;
        }

        const setupRequest = createSetupRequest();
        await setupPolicies(setupRequest);

        if (onComplete) {
          onComplete();
        } else {
          router.back();
        }
      } catch (error) {
        console.error("Setup failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [
    isLastStep,
    validateForm,
    createSetupRequest,
    setupPolicies,
    onComplete,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [currentStep, onCancel, router]);

  const handleSkip = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  }, [onCancel, router]);

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "cancellation":
        return (
          <CancellationPolicyForm
            data={formData.cancellationPolicy}
            errors={validationErrors}
            onChange={(data) => updateFormData("cancellationPolicy", data)}
          />
        );
      case "rules":
        return (
          <HouseRulesForm
            data={formData.houseRules}
            errors={validationErrors}
            onChange={(data) => updateFormData("houseRules", data)}
          />
        );
      case "safety":
        return (
          <SafetyInformationForm
            data={formData.safetyInformation}
            errors={validationErrors}
            onChange={(data) => updateFormData("safetyInformation", data)}
          />
        );
      case "property":
        return (
          <PropertyInformationForm
            data={formData.propertyInformation}
            errors={validationErrors}
            onChange={(data) => updateFormData("propertyInformation", data)}
          />
        );
      default:
        return null;
    }
  };
  if (setupLoading || isSubmitting) {
    return (
      <OverlayScreen
        headerIcon="settings-outline"
        headerTitle={t("host.setup.title")}
        headerSubtitle={t("host.setup.subtitle")}
        isLoading={true}
        loadingText={
          isSubmitting ? t("host.setup.finish") : t("common.loading")
        }
      >
        <View />
      </OverlayScreen>
    );
  }

  if (setupError) {
    return (
      <OverlayScreen
        headerIcon="alert-circle-outline"
        headerTitle={t("common.error")}
        headerSubtitle={setupError}
        errorText={setupError}
      >
        <View />
      </OverlayScreen>
    );
  }

  return (
    <OverlayScreen
      headerIcon={currentStepData.icon}
      headerTitle={t(currentStepData.title)}
      headerSubtitle={t(currentStepData.subtitle)}
    >
      {/* Progress Indicator */}
      <LegacySetupProgress
        currentStep={currentStep}
        totalSteps={SETUP_STEPS.length}
      />
      {/* Step Content */}
      <View style={styles.stepContent}>{renderStepContent()}</View>
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <Button
            title={currentStep === 0 ? t("common.cancel") : t("common.back")}
            variant="outline"
            onPress={handleBack}
            style={styles.backButton}
          />

          {currentStep === 0 && (
            <Button
              title={t("host.setup.skip")}
              variant="ghost"
              onPress={handleSkip}
              style={styles.skipButton}
            />
          )}

          <Button
            title={
              isLastStep ? t("host.setup.finish") : t("host.setup.continue")
            }
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
            loading={isSubmitting}
          />
        </View>
      </View>
    </OverlayScreen>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    flex: 0,
    minWidth: 80,
  },
  skipButton: {
    flex: 0,
    minWidth: 80,
  },
  nextButton: {
    flex: 1,
    maxWidth: 200,
  },
});
