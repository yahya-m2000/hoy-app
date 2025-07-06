import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Container, Text, Input } from "@shared/components";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { spacing } from "@core/design";

interface DescriptionStepProps {
  formData: any;
  updateFormData: (field: keyof any, value: any) => void;
  errors: Record<string, string>;
}

export default function DescriptionStep({
  formData,
  updateFormData,
  errors,
}: DescriptionStepProps) {
  const characterCount = formData.description?.length || 0;
  const maxLength = 3000;
  const minLength = 50;
  const isNearLimit = characterCount > maxLength * 0.8;

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
            title="Describe your property"
            description="Tell guests what makes your place special (minimum 50 characters)"
          />

          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                Description *
              </Text>
            </Container>
            <Input
              value={formData.description || ""}
              onChangeText={(text: string) =>
                updateFormData("description", text)
              }
              error={errors.description}
              multiline
              numberOfLines={8}
              maxLength={maxLength}
              placeholder="Describe your property's unique features, nearby attractions, and what makes it special..."
              style={{ minHeight: 120 }}
            />
            <Container
              flexDirection="row"
              justifyContent="space-between"
              marginTop="xs"
            >
              <Container>
                {characterCount > 0 && characterCount < minLength && (
                  <Text variant="caption" style={{ color: "#FFA500" }}>
                    {minLength - characterCount} more characters needed
                  </Text>
                )}
              </Container>
              <Text
                variant="caption"
                style={{
                  color: errors.description
                    ? "#FF6B6B"
                    : isNearLimit
                    ? "#FFA500"
                    : "#666",
                }}
              >
                {characterCount}/{maxLength}
              </Text>
            </Container>
          </Container>

          <InfoBox
            title="Writing Tips"
            content="• Highlight unique features and amenities
• Mention nearby attractions and transportation
• Describe the neighborhood vibe and character
• Set clear expectations about the space
• Use descriptive but honest language"
            icon="bulb"
            variant="tip"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
