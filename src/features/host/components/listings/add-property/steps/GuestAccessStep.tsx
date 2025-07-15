import React from "react";
import { Container, Button, Text } from "@shared/components";
import StepHeader from "../StepHeader";
import { GUEST_ACCESS_TYPES } from "@core/types/listings.types";
import { spacing } from "@core/design";
import { useTranslation } from "react-i18next";

interface GuestAccessStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function GuestAccessStep({
  formData,
  updateFormData,
}: GuestAccessStepProps) {
  const { t } = useTranslation();
  return (
    <Container>
      <StepHeader
        title={t("property.steps.guestAccess.title")}
        description={t("property.steps.guestAccess.description")}
      />

      <Container marginTop="lg">
        {GUEST_ACCESS_TYPES.map((option) => (
          <Container key={option.value} marginBottom="md">
            <Button
              title={t(`property.types.${option.value}`)}
              onPress={() => updateFormData({ guestAccessType: option.value })}
              variant={
                formData.guestAccessType === option.value
                  ? "primary"
                  : "outline"
              }
              style={{ marginBottom: spacing.xs }}
            />
            <Text
              variant="caption"
              color="secondary"
              style={{ marginLeft: spacing.sm }}
            >
              {t(`property.types.${option.value}Description`)}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  );
}
