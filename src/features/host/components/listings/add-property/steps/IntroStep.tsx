import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Text, Icon } from "@shared/components";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { spacing, iconSize } from "@core/design";
import { useTheme } from "@core/hooks";

interface IntroStepProps {
  formData: any;
  updateFormData: (field: keyof any, value: any) => void;
  errors: Record<string, string>;
}

export default function IntroStep({
  formData,
  updateFormData,
  errors,
}: IntroStepProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const benefits = [
    {
      icon: "globe" as const,
      text: t("property.steps.intro.benefit1"),
    },
    {
      icon: "cash" as const,
      text: t("property.steps.intro.benefit2"),
    },
    {
      icon: "shield-checkmark" as const,
      text: t("property.steps.intro.benefit3"),
    },
  ];

  return (
    <Container paddingBottom="xxl">
      <StepHeader
        title={t("property.steps.intro.title")}
        description={t("property.steps.intro.description")}
      />

      <Container marginTop="xl">
        {benefits.map((benefit, index) => (
          <Container
            key={index}
            flexDirection="row"
            alignItems="center"
            marginBottom="md"
          >
            <Icon
              name={benefit.icon as any}
              size={iconSize.lg}
              color={theme.text?.primary || theme.colors.primary}
              style={{ marginRight: spacing.md }}
            />
            <Container flex={1}>
              <Text variant="body" color="onBackground">
                {benefit.text}
              </Text>
            </Container>
          </Container>
        ))}
      </Container>

      {/* Get Started Info */}
      <InfoBox
        title={t("property.steps.intro.infoTitle")}
        content={t("property.steps.intro.infoText")}
        icon="information-circle"
        variant="info"
      />
    </Container>
  );
}
