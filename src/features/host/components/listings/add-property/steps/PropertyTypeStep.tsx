import React from "react";
import { Container, Button } from "@shared/components";
import StepHeader from "../StepHeader";
import { PROPERTY_TYPES } from "@core/types/listings.types";
import { spacing } from "@core/design";

interface PropertyTypeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function PropertyTypeStep({
  formData,
  updateFormData,
}: PropertyTypeStepProps) {
  return (
    <Container>
      <StepHeader
        title="What type of property is this?"
        description="Choose the option that best describes your place"
      />

      <Container marginTop="lg">
        {PROPERTY_TYPES.map((type) => (
          <Button
            key={type.value}
            title={type.label}
            variant={
              formData.propertyType === type.value ? "primary" : "outline"
            }
            onPress={() => updateFormData({ propertyType: type.value })}
            style={{ marginBottom: spacing.sm }}
          />
        ))}
      </Container>
    </Container>
  );
}
