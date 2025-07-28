import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScrollView } from "react-native";
import { Container, Text, Input } from "@shared/components";
import { PropertyFormData } from "@core/types";
import { spacing } from "@core/design";
import { useTheme } from "@core/hooks";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { useTranslation } from "react-i18next";

interface TitleStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  errors: Record<string, string>;
}

export default function TitleStep({
  formData,
  updateFormData,
  errors,
}: TitleStepProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleTextChange = (text: string) => {
    updateFormData("name", text);
  };

  const characterCount = formData.name?.length || 0;
  const maxLength = 32;
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
            title={t("features.property.listing.steps.title.title")}
            description={t("features.property.listing.steps.title.description")}
          />

          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("features.property.listing.steps.title.label")} *
              </Text>
            </Container>
            <Input
              value={formData.name}
              maxLength={maxLength}
              onChangeText={handleTextChange}
              placeholder={t("features.property.listing.steps.title.placeholder")}
              error={errors.name}
              autoCapitalize="words"
            />
            <Container
              flexDirection="row"
              justifyContent="space-between"
              marginTop="xs"
            >
              <View />
              <Text
                variant="caption"
                style={{
                  color: errors.name
                    ? "#FF6B6B"
                    : isNearLimit
                    ? "#FFA500"
                    : "#666",
                }}
              >
                {characterCount}/{maxLength}
              </Text>
            </Container>
            {formData.name.length > 0 &&
              formData.name.length < 3 &&
              !errors.name && (
                <Container marginTop="xs">
                  <Text variant="caption" style={{ color: "#FFA500" }}>
                    {t("features.property.listing.forms.validation.minLengthWarning", { min: 3 })}
                  </Text>
                </Container>
              )}
          </Container>

          <InfoBox
            title={t("features.property.listing.steps.title.tipTitle")}
            content={t("features.property.listing.steps.title.tipContent")}
            icon="bulb"
            variant="tip"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
  warningText: {
    color: "#FFA500",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  charCountError: {
    color: "#FF6B6B",
  },
});
