import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Container, Text, Input } from "@shared/components";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { spacing } from "@core/design";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
            title={t("features.property.listing.steps.description.title")}
            description={t("features.property.listing.steps.description.description")}
          />

          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("features.property.listing.steps.description.label")} *
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
              placeholder={t("features.property.listing.steps.description.placeholder")}
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
                    {t("features.property.listing.forms.validation.minLengthWarning", {
                      min: minLength,
                      remaining: minLength - characterCount,
                    })}
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
            title={t("features.property.listing.steps.description.tipTitle")}
            content={t("features.property.listing.steps.description.tipContent")}
            icon="bulb"
            variant="tip"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
