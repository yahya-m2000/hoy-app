import React from "react";
import { Container, Text } from "@shared/components";
import { spacing } from "@core/design";

interface StepHeaderProps {
  title: string;
  description?: string;
}

export default function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <Container>
      <Text variant="h2" weight="bold" style={{ marginBottom: spacing.xs }}>
        {title}
      </Text>
      {description && (
        <Text
          variant="body"
          color="secondary"
          style={{ marginBottom: spacing.lg }}
        >
          {description}
        </Text>
      )}
    </Container>
  );
}
