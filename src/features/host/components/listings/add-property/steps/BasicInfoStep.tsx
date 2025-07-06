import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Container, Text, Input, Icon } from "@shared/components";
import { PropertyFormData, PROPERTY_TYPES } from "@core/types";
import { spacing, iconSize } from "@core/design";
import SelectInput from "../../SelectInput";
import StepHeader from "../StepHeader";
import { useTheme } from "@core/hooks";

interface BasicInfoStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  updateNestedFormData: (
    field: keyof PropertyFormData,
    nestedField: string,
    value: any
  ) => void;
  errors: Record<string, string>;
  isEditMode?: boolean;
}

// Export validation function for parent component
export const validateBasicInfoStep = (
  formData: PropertyFormData,
  t: (key: string, options?: any) => string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.name?.trim()) {
    errors.name = t("validation.required", { field: t("property.name") });
  } else if (formData.name.length < 3) {
    errors.name = t("validation.minLength", {
      field: t("property.name"),
      length: 3,
    });
  }

  if (!formData.propertyType) {
    errors.propertyType = t("validation.required", {
      field: t("property.type"),
    });
  }

  if (!formData.type) {
    errors.type = t("validation.required", {
      field: t("property.listingType"),
    });
  }

  if (!formData.description?.trim()) {
    errors.description = t("validation.required", {
      field: t("property.description"),
    });
  } else if (formData.description.length < 50) {
    errors.description = t("validation.minLength", {
      field: t("property.description"),
      length: 50,
    });
  }

  return errors;
};

export default function BasicInfoStep({
  formData,
  updateFormData,
  updateNestedFormData,
  errors,
  isEditMode,
}: BasicInfoStepProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const propertyTypeOptions = PROPERTY_TYPES.map((type) => ({
    label: t(`property.types.${type.value}`),
    value: type.value,
  }));

  const typeOptions = [
    { label: t("property.listing.individual"), value: "INDIVIDUAL" },
    { label: t("property.listing.shared"), value: "SHARED" },
  ];

  const validateField = (field: string, value: any): string | null => {
    switch (field) {
      case "name":
        if (!value?.trim())
          return t("validation.required", { field: t("property.name") });
        if (value.length < 3)
          return t("validation.minLength", {
            field: t("property.name"),
            length: 3,
          });
        if (value.length > 100)
          return t("validation.maxLength", {
            field: t("property.name"),
            length: 100,
          });
        return null;
      case "description":
        if (!value?.trim())
          return t("validation.required", { field: t("property.description") });
        if (value.length < 50)
          return t("validation.minLength", {
            field: t("property.description"),
            length: 50,
          });
        if (value.length > 1000)
          return t("validation.maxLength", {
            field: t("property.description"),
            length: 1000,
          });
        return null;
      case "propertyType":
      case "type":
        if (!value)
          return t("validation.required", { field: t("property.type") });
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (field: keyof PropertyFormData, value: any) => {
    updateFormData(field, value);

    // Clear error when user starts typing
    if (errors[field]) {
      const validation = validateField(field, value);
      if (!validation) {
        // Clear the error by updating parent component
        updateFormData(field, value);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Container paddingBottom="xxl">
          <StepHeader
            title={t("property.steps.basicInfo.title")}
            description={t("property.steps.basicInfo.description")}
          />

          {/* Property Name */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.name")} *
              </Text>
            </Container>
            <Input
              value={formData.name}
              onChangeText={(value) => handleFieldChange("name", value)}
              placeholder={t("property.namePlaceholder")}
              error={errors.name}
              autoCapitalize="words"
              maxLength={100}
            />
          </Container>

          {/* Property Type */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.type")} *
              </Text>
            </Container>
            <SelectInput
              value={formData.propertyType}
              onValueChange={(value) =>
                handleFieldChange("propertyType", value)
              }
              options={propertyTypeOptions}
              placeholder={t("property.typePlaceholder")}
              error={!!errors.propertyType}
            />
          </Container>

          {/* Listing Type */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.listingType")} *
              </Text>
            </Container>
            <SelectInput
              value={formData.type}
              onValueChange={(value) => handleFieldChange("type", value)}
              options={typeOptions}
              placeholder={t("property.listingTypePlaceholder")}
              error={!!errors.type}
            />

            {/* Info Box */}
            <Container
              flexDirection="row"
              backgroundColor="surfaceVariant"
              padding="md"
              marginTop="sm"
              style={{ borderRadius: 8 }}
            >
              <Icon
                name="information-circle"
                size={iconSize.sm}
                color={theme.colors.primary}
                style={{ marginRight: spacing.sm }}
              />
              <Container flex={1}>
                <Text variant="caption" color="onSurfaceVariant">
                  {t("property.listingTypeHelp")}
                </Text>
              </Container>
            </Container>
          </Container>

          {/* Description */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.description")} *
              </Text>
            </Container>
            <Input
              value={formData.description}
              onChangeText={(value) => handleFieldChange("description", value)}
              placeholder={t("property.descriptionPlaceholder")}
              error={errors.description}
              multiline
              numberOfLines={6}
              maxLength={1000}
              style={{ minHeight: 120 }}
            />
            <Container
              flexDirection="row"
              justifyContent="space-between"
              marginTop="xs"
            >
              <Text variant="caption" color="onBackgroundVariant">
                {t("property.descriptionHelp")}
              </Text>
              <Text variant="caption" color="onBackgroundVariant">
                {formData.description?.length || 0}/1000
              </Text>
            </Container>
          </Container>
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
