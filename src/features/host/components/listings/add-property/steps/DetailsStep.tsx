import React from "react";
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScrollView } from "react-native";
import { Container, Text, Input, Icon } from "@shared/components";
import { PropertyFormData } from "@core/types";
import { spacing, iconSize } from "@core/design";
import { useTheme } from "@core/hooks";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import { useTranslation } from "react-i18next";

interface DetailsStepProps {
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

export default function DetailsStep({
  formData,
  updateFormData,
  errors,
}: DetailsStepProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const incrementValue = (field: keyof PropertyFormData) => {
    const currentValue = formData[field] as number;
    updateFormData(field, currentValue + 1);
  };

  const decrementValue = (field: keyof PropertyFormData, minValue = 0) => {
    const currentValue = formData[field] as number;
    if (currentValue > minValue) {
      updateFormData(field, currentValue - 1);
    }
  };

  const CounterInput = ({
    label,
    value,
    onIncrement,
    onDecrement,
    error,
    required = false,
  }: {
    label: string;
    value: number;
    onIncrement: () => void;
    onDecrement: () => void;
    error?: string;
    required?: boolean;
  }) => (
    <Container marginBottom="lg">
      <Container marginBottom="sm">
        <Text variant="label" color="onBackground">
          {label} {required && "*"}
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <TouchableOpacity
          onPress={onDecrement}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.surface,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="remove" size={iconSize.sm} color={theme.text.primary} />
        </TouchableOpacity>
        <Container flex={1} alignItems="center">
          <Text variant="h6" weight="semibold" color="onBackground">
            {value}
          </Text>
        </Container>
        <TouchableOpacity
          onPress={onIncrement}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.surface,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="add" size={iconSize.sm} color={theme.text.primary} />
        </TouchableOpacity>
      </Container>
      {error && (
        <Container marginTop="xs">
          <Text variant="body" color="error">
            {error}
          </Text>
        </Container>
      )}
    </Container>
  );

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
            title={t("features.property.listing.steps.details.title")}
            description={t("features.property.listing.steps.details.description")}
          />

          {/* Price per Night */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("features.property.listing.forms.sections.details.pricePerNight")} *
              </Text>
            </Container>
            <Container flexDirection="row" alignItems="center">
              <Input
                value={formData.price.toString()}
                onChangeText={(value) => {
                  const numValue = parseFloat(value) || 0;
                  updateFormData("price", numValue);
                }}
                placeholder={t("features.property.listing.forms.sections.details.pricePlaceholder")}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
              />
              <Container paddingHorizontal="md">
                <Text variant="body" color="onBackgroundVariant">
                  {formData.currency}
                </Text>
              </Container>
            </Container>
            {errors.price && (
              <Container marginTop="xs">
                <Text variant="caption" color="error">
                  {errors.price}
                </Text>
              </Container>
            )}
          </Container>

          {/* Bedrooms */}
          <CounterInput
            label={t("features.property.listing.forms.sections.details.bedrooms")}
            value={formData.bedrooms}
            onIncrement={() => incrementValue("bedrooms")}
            onDecrement={() => decrementValue("bedrooms")}
            error={errors.bedrooms}
          />

          {/* Beds */}
          <CounterInput
            label={t("features.property.listing.forms.sections.details.beds")}
            value={formData.beds}
            onIncrement={() => incrementValue("beds")}
            onDecrement={() => decrementValue("beds", 1)}
            error={errors.beds}
            required
          />

          {/* Bathrooms */}
          <CounterInput
            label={t("features.property.listing.forms.sections.details.bathrooms")}
            value={formData.bathrooms}
            onIncrement={() => incrementValue("bathrooms")}
            onDecrement={() => decrementValue("bathrooms", 1)}
            error={errors.bathrooms}
            required
          />

          {/* Max Guests */}
          <CounterInput
            label={t("features.property.listing.forms.sections.details.maxGuests")}
            value={formData.maxGuests}
            onIncrement={() => incrementValue("maxGuests")}
            onDecrement={() => decrementValue("maxGuests", 1)}
            error={errors.maxGuests}
            required
          />

          {/* Info Box */}
          <InfoBox
            title={t("features.property.listing.steps.details.tipTitle")}
            content={t("features.property.listing.steps.details.tipContent")}
            icon="bulb"
            variant="tip"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
