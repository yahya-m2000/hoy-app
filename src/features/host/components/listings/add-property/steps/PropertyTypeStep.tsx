import React from "react";
import { Container, Button, Text } from "@shared/components";
import StepHeader from "../StepHeader";
import { PROPERTY_TYPES } from "@core/types/listings.types";
import { spacing } from "@core/design";
import { useTranslation } from "react-i18next";

interface PropertyTypeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export default function PropertyTypeStep({
  formData,
  updateFormData,
}: PropertyTypeStepProps) {
  const { t, i18n, ready } = useTranslation();

  // Debug: Log the translation keys and current language
  console.log("PropertyTypeStep - Debug:");
  console.log("i18n ready:", ready);
  console.log("Current language:", i18n.language);
  console.log("Available languages:", i18n.languages);

  // Test basic translation functionality
  const testTranslation = t("common.save");
  console.log("Test translation (common.save):", testTranslation);

  // Test direct key access
  const testKeys = [
    "property.steps.propertyType.title",
    "property.steps.propertyType.description",
    "property.types.apartment",
    "property.types.house",
    "property.types.loft",
    "property.types.penthouse",
    "property.types.studio",
  ];

  testKeys.forEach((key) => {
    const translation = t(key);
    console.log(`${key}:`, translation);
    // Check if translation is the same as the key (indicating it wasn't found)
    if (translation === key) {
      console.warn(`Translation not found for key: ${key}`);
    }
  });

  // Wait for i18n to be ready
  if (!ready) {
    return (
      <Container>
        <Text>Loading translations...</Text>
      </Container>
    );
  }

  // Test if we can access the translation object directly
  console.log("Direct access test:");
  console.log("property.types:", i18n.t("property.types"));
  console.log("property.types.apartment:", i18n.t("property.types.apartment"));

  // Fallback translations in case i18n is not working
  const fallbackTranslations = {
    title: "Property Type",
    description: "Select the type of property you're listing",
    apartment: "Apartment",
    house: "House",
    loft: "Loft",
    penthouse: "Penthouse",
    studio: "Studio",
  };

  const getTranslation = (key: string, fallback: string) => {
    const translation = t(key);
    return translation === key ? fallback : translation;
  };

  return (
    <Container>
      <StepHeader
        title={getTranslation(
          "property.steps.propertyType.title",
          fallbackTranslations.title
        )}
        description={getTranslation(
          "property.steps.propertyType.description",
          fallbackTranslations.description
        )}
      />

      <Container marginTop="lg">
        {PROPERTY_TYPES.map((type) => {
          const translationKey = `property.types.${type.value}`;
          const fallbackText =
            fallbackTranslations[
              type.value as keyof typeof fallbackTranslations
            ] || type.value;
          const translatedText = getTranslation(translationKey, fallbackText);

          console.log(
            `Rendering ${type.value}: ${translationKey} = "${translatedText}"`
          );

          return (
            <Button
              key={type.value}
              title={translatedText}
              variant={
                formData.propertyType === type.value ? "primary" : "outline"
              }
              onPress={() => updateFormData({ propertyType: type.value })}
              style={{ marginBottom: spacing.sm }}
            />
          );
        })}
      </Container>
    </Container>
  );
}
