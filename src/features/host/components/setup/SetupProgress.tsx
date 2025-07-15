import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Icon } from "@shared/components";
import { spacing, radius, iconSize } from "@core/design";
import { SetupStepType, SetupStepStatus } from "@core/types/host.types";
import { BETA_CONFIG } from "@core/config/beta";

export type StepStatus = "pending" | "in_progress" | "completed" | "error";

interface SetupStep {
  id: SetupStepType;
  status: StepStatus;
  title: string;
  icon: string;
}

interface SetupProgressProps {
  currentStep: SetupStepType;
  steps: SetupStep[];
  onStepPress?: (step: SetupStepType) => void;
  canNavigateToStep?: (step: SetupStepType) => boolean;
  showStepNames?: boolean;
  variant?: "horizontal" | "vertical";
}

interface NewSetupProgressProps {
  currentStep: SetupStepType;
  stepStatus: Record<SetupStepType, SetupStepStatus>;
  onStepPress?: (step: SetupStepType) => void;
  showStepNames?: boolean;
  variant?: "horizontal" | "vertical";
}

export const SetupProgress: React.FC<SetupProgressProps> = ({
  currentStep,
  steps,
  onStepPress,
  canNavigateToStep,
  showStepNames = true,
  variant = "horizontal",
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const getStepIcon = (step: SetupStep, index: number) => {
    switch (step.status) {
      case "completed":
        return "checkmark-circle";
      case "in_progress":
        return "ellipse-outline";
      case "error":
        return "alert-circle";
      default:
        return "ellipse-outline";
    }
  };

  const getStepColor = (step: SetupStep, isCurrent: boolean) => {
    switch (step.status) {
      case "completed":
        return theme.colors.success;
      case "in_progress":
        return theme.colors.primary;
      case "error":
        return theme.colors.error;
      default:
        return isCurrent ? theme.colors.primary : theme.colors.gray[400];
    }
  };

  const getStepBackgroundColor = (step: SetupStep, isCurrent: boolean) => {
    switch (step.status) {
      case "completed":
        return theme.colors.success + "20";
      case "in_progress":
        return theme.colors.primary + "20";
      case "error":
        return theme.colors.error + "20";
      default:
        return isCurrent ? theme.colors.primary + "20" : theme.colors.gray[100];
    }
  };

  const handleStepPress = (step: SetupStep) => {
    if (onStepPress && canNavigateToStep?.(step.id)) {
      onStepPress(step.id);
    }
  };

  const renderHorizontalProgress = () => (
    <Container paddingVertical="md">
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ gap: spacing.xs }}
      >
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const canNavigate = canNavigateToStep?.(step.id) ?? false;
          const isInteractive = canNavigate && onStepPress;

          return (
            <TouchableOpacity
              key={step.id}
              onPress={() => handleStepPress(step)}
              disabled={!isInteractive}
              style={[
                styles.stepRectangle,
                {
                  backgroundColor: getStepColor(step, isCurrent),
                  opacity: isInteractive ? 1 : 0.6,
                },
              ]}
            />
          );
        })}
      </Container>
    </Container>
  );

  const renderVerticalProgress = () => (
    <Container paddingVertical="md">
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        const canNavigate = canNavigateToStep?.(step.id) ?? false;
        const isInteractive = canNavigate && onStepPress;
        const isLast = index === steps.length - 1;

        return (
          <Container key={step.id} flexDirection="row" alignItems="flex-start">
            {/* Step indicator column */}
            <Container alignItems="center" style={{ width: 40 }}>
              <TouchableOpacity
                onPress={() => handleStepPress(step)}
                disabled={!isInteractive}
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: getStepBackgroundColor(step, isCurrent),
                    borderColor: getStepColor(step, isCurrent),
                    borderWidth: 2,
                  },
                ]}
              >
                <Icon
                  name={getStepIcon(step, index)}
                  size={iconSize.sm}
                  color={getStepColor(step, isCurrent)}
                />
              </TouchableOpacity>

              {/* Connecting line */}
              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,
                    {
                      backgroundColor:
                        step.status === "completed"
                          ? theme.colors.primary
                          : theme.colors.gray[200],
                    },
                  ]}
                />
              )}
            </Container>

            {/* Step content */}
            <Container flex={1} paddingLeft="md" paddingBottom="lg">
              <TouchableOpacity
                onPress={() => handleStepPress(step)}
                disabled={!isInteractive}
              >
                <Text
                  variant="body"
                  color={isCurrent ? "primary" : "secondary"}
                  style={{
                    fontWeight: isCurrent ? "600" : "400",
                    marginBottom: spacing.xs,
                  }}
                >
                  {step.title}
                </Text>

                {/* Step status indicator */}
                <Text
                  variant="caption"
                  color={
                    step.status === "completed"
                      ? "success"
                      : step.status === "error"
                      ? "error"
                      : isCurrent
                      ? "primary"
                      : "secondary"
                  }
                >
                  {step.status === "completed"
                    ? t("host.setup.completed")
                    : step.status === "in_progress"
                    ? t("host.setup.inProgress")
                    : step.status === "error"
                    ? t("host.setup.error")
                    : t("host.setup.pending")}
                </Text>
              </TouchableOpacity>
            </Container>
          </Container>
        );
      })}
    </Container>
  );

  return variant === "horizontal"
    ? renderHorizontalProgress()
    : renderVerticalProgress();
};

const styles = StyleSheet.create({
  stepRectangle: {
    flex: 1,
    height: 4,
    borderRadius: radius.sm,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNameContainer: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  stepName: {
    fontSize: 12,
    lineHeight: 16,
  },
  verticalLine: {
    width: 2,
    height: 40,
    marginTop: spacing.xs,
  },
});

// Legacy interface for backward compatibility
interface LegacySetupProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const LegacySetupProgress: React.FC<LegacySetupProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  const { theme } = useTheme();

  return (
    <Container paddingVertical="md">
      <Container
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        style={{ gap: spacing.xs }}
      >
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <View
              key={index}
              style={[
                legacyStyles.legacyStep,
                {
                  backgroundColor:
                    isCompleted || isCurrent
                      ? theme.colors.primary
                      : theme.colors.gray[300],
                },
              ]}
            />
          );
        })}
      </Container>
    </Container>
  );
};

const legacyStyles = StyleSheet.create({
  legacyStep: {
    width: 60,
    height: 4,
    borderRadius: radius.sm,
  },
});

// New setup progress component that works with the new hook
export const NewSetupProgress: React.FC<NewSetupProgressProps> = ({
  currentStep,
  stepStatus,
  onStepPress,
  showStepNames = true,
  variant = "horizontal",
}) => {
  const { t } = useTranslation();

  // Convert stepStatus to steps array based on beta configuration
  const steps: SetupStep[] = [];

  if (BETA_CONFIG.setup.includeVerification) {
    steps.push({
      id: SetupStepType.VERIFICATION,
      status: stepStatus[SetupStepType.VERIFICATION] as StepStatus,
      title: t("host.setup.steps.verification.title"),
      icon: "shield-checkmark",
    });
  }

  if (BETA_CONFIG.setup.includeAgreement) {
    steps.push({
      id: SetupStepType.AGREEMENT,
      status: stepStatus[SetupStepType.AGREEMENT] as StepStatus,
      title: t("host.setup.steps.agreement.title"),
      icon: "document-text",
    });
  }

  if (BETA_CONFIG.setup.includePolicies) {
    steps.push({
      id: SetupStepType.POLICIES,
      status: stepStatus[SetupStepType.POLICIES] as StepStatus,
      title: t("host.setup.steps.policies.title"),
      icon: "settings",
    });
  }

  if (BETA_CONFIG.setup.includePreferences) {
    steps.push({
      id: SetupStepType.PREFERENCES,
      status: stepStatus[SetupStepType.PREFERENCES] as StepStatus,
      title: t("host.setup.steps.preferences.title"),
      icon: "options",
    });
  }

  if (BETA_CONFIG.setup.includeProfile) {
    steps.push({
      id: SetupStepType.PROFILE,
      status: stepStatus[SetupStepType.PROFILE] as StepStatus,
      title: t("host.setup.steps.profile.title"),
      icon: "person",
    });
  }

  return (
    <SetupProgress
      currentStep={currentStep}
      steps={steps}
      onStepPress={onStepPress}
      showStepNames={false}
      variant={variant}
    />
  );
};

// Export both for backward compatibility
export { LegacySetupProgress as SetupProgressLegacy };
