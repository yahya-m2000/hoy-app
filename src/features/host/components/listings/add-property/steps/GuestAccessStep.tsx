import React from "react";
import { Container, Button, Text } from "@shared/components";
import StepHeader from "../StepHeader";
import { GUEST_ACCESS_TYPES } from "@core/types/listings.types";
import { spacing } from "@core/design";

interface GuestAccessStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function GuestAccessStep({
  formData,
  updateFormData,
}: GuestAccessStepProps) {
  return (
    <Container>
      <StepHeader
        title="What will guests have access to?"
        description="Select the type of access your guests will have."
      />

      <Container marginTop="lg">
        {GUEST_ACCESS_TYPES.map((option) => (
          <Container key={option.value} marginBottom="md">
            <Button
              title={option.label}
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
              {option.description}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  );
}
