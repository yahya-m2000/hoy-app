import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Container,
  Text,
  Input,
  Icon,
  AutocompleteInput,
} from "@shared/components";
import { PropertyFormData } from "@core/types";
import { spacing, iconSize } from "@core/design";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import {
  searchCountriesForAutocomplete,
  getCitiesByCountryForAutocomplete,
  getStateByCity,
  getCountryByCode,
  validateCountryCityState,
  COUNTRIES,
  isCountryValid,
  isCityValidForCountry,
} from "@core/utils/data/countries";

interface LocationStepProps {
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
export const validateLocationStep = (
  formData: PropertyFormData,
  t: (key: string, options?: any) => string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.address?.street?.trim()) {
    errors["address.street"] = t("validation.required", {
      field: t("property.location.street"),
    });
  }

  if (!formData.address?.city?.trim()) {
    errors["address.city"] = t("validation.required", {
      field: t("property.location.city"),
    });
  }

  if (!formData.address?.state?.trim()) {
    errors["address.state"] = t("validation.required", {
      field: t("property.location.state"),
    });
  }

  if (!formData.address?.postalCode?.trim()) {
    errors["address.postalCode"] = t("validation.required", {
      field: t("property.location.postalCode"),
    });
  }

  if (!formData.address?.country?.trim()) {
    errors["address.country"] = t("validation.required", {
      field: t("property.location.country"),
    });
  }

  // Required: Validate coordinates
  if (!formData.coordinates?.latitude || formData.coordinates.latitude === 0) {
    errors["coordinates.latitude"] = t("validation.required", {
      field: t("property.location.latitude"),
    });
  } else if (
    formData.coordinates.latitude < -90 ||
    formData.coordinates.latitude > 90
  ) {
    errors["coordinates.latitude"] = t("property.location.invalidLatitude");
  }

  if (
    !formData.coordinates?.longitude ||
    formData.coordinates.longitude === 0
  ) {
    errors["coordinates.longitude"] = t("validation.required", {
      field: t("property.location.longitude"),
    });
  } else if (
    formData.coordinates.longitude < -180 ||
    formData.coordinates.longitude > 180
  ) {
    errors["coordinates.longitude"] = t("property.location.invalidLongitude");
  }

  return errors;
};

export default function LocationStep({
  formData,
  updateNestedFormData,
  errors,
}: LocationStepProps) {
  const { t } = useTranslation();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [latitudeStr, setLatitudeStr] = useState(
    formData.coordinates?.latitude ? String(formData.coordinates.latitude) : ""
  );
  const [longitudeStr, setLongitudeStr] = useState(
    formData.coordinates?.longitude
      ? String(formData.coordinates.longitude)
      : ""
  );

  useEffect(() => {
    const newLat = formData.coordinates?.latitude;
    if (newLat && newLat !== parseFloat(latitudeStr)) {
      setLatitudeStr(String(newLat));
    } else if (!newLat) {
      setLatitudeStr("");
    }
  }, [formData.coordinates?.latitude]);

  useEffect(() => {
    const newLon = formData.coordinates?.longitude;
    if (newLon && newLon !== parseFloat(longitudeStr)) {
      setLongitudeStr(String(newLon));
    } else if (!newLon) {
      setLongitudeStr("");
    }
  }, [formData.coordinates?.longitude]);

  const handleFieldChange = (
    field: string,
    nestedField: string,
    value: any
  ) => {
    updateNestedFormData(field as keyof PropertyFormData, nestedField, value);
  };

  const handleCoordinateChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    const setter = field === "latitude" ? setLatitudeStr : setLongitudeStr;

    if (value === "" || value === "-" || /^-?\d*\.?\d*$/.test(value)) {
      setter(value);
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        updateNestedFormData("coordinates", field, parsedValue);
      } else if (value === "" || value === "-") {
        updateNestedFormData("coordinates", field, 0);
      }
    }
  };

  // Handle country selection
  const handleCountryChange = (value: string) => {
    const suggestions = searchCountriesForAutocomplete(value).map(
      (c) => c.name
    );
    setCountrySuggestions(suggestions);
  };

  const handleCountrySelect = (countryName: string) => {
    const countryData = searchCountriesForAutocomplete(countryName)[0];
    if (countryData) {
      handleFieldChange("address", "country", countryData.name);
      setSelectedCountryCode(countryData.code);
      handleFieldChange("address", "city", "");
      handleFieldChange("address", "state", "");
    }
  };

  // Handle city selection
  const handleCityChange = (value: string) => {
    if (selectedCountryCode) {
      const suggestions = getCitiesByCountryForAutocomplete(
        selectedCountryCode,
        value
      );
      setCitySuggestions(suggestions);
    }
  };

  const handleCitySelect = (cityName: string) => {
    handleFieldChange("address", "city", cityName);
    if (selectedCountryCode) {
      const state = getStateByCity(selectedCountryCode, cityName);
      if (state) {
        handleFieldChange("address", "state", state);
      }
    }
  };

  // Pre-load all country suggestions on mount
  useEffect(() => {
    const suggestions = searchCountriesForAutocomplete("").map((c) => c.name);
    setCountrySuggestions(suggestions);
  }, []);

  // Clear city suggestions when country changes
  useEffect(() => {
    if (selectedCountryCode) {
      const suggestions = getCitiesByCountryForAutocomplete(
        selectedCountryCode,
        formData.address?.city || ""
      );
      setCitySuggestions(suggestions);
    } else {
      setCitySuggestions([]);
    }
  }, [selectedCountryCode, formData.address?.city]);

  // Custom render functions for suggestions
  const renderCountrySuggestion = (country: any, onPress: () => void) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        zIndex: 1000,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text variant="body" color="onBackground">
        {country.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCitySuggestion = (city: string, onPress: () => void) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text variant="body" color="onBackground">
        {city}
      </Text>
    </TouchableOpacity>
  );

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
            title={t("property.location.title")}
            description={t("property.location.description")}
          />

          {/* Country */}
          <Container marginBottom="xl" style={{ zIndex: 3 }}>
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.location.country")} *
              </Text>
            </Container>
            <AutocompleteInput
              value={formData.address?.country || ""}
              onSearchTextChange={handleCountryChange}
              onSelect={handleCountrySelect}
              placeholder={t("property.location.countryPlaceholder")}
              suggestions={countrySuggestions}
              error={errors["address.country"]}
              label={t("property.location.country")}
              modalTitle={t("property.location.selectCountry")}
            />
          </Container>

          {/* City */}
          <Container marginBottom="lg" style={{ zIndex: 2 }}>
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.location.city")} *
              </Text>
            </Container>
            <AutocompleteInput
              value={formData.address?.city || ""}
              onSearchTextChange={handleCityChange}
              onSelect={handleCitySelect}
              placeholder={t("property.location.cityPlaceholder")}
              suggestions={citySuggestions}
              error={errors["address.city"]}
              disabled={!selectedCountryCode}
              label={t("property.location.city")}
              modalTitle={t("property.location.selectCity")}
            />
          </Container>

          {/* Street Address */}
          <Container marginBottom="lg" style={{ zIndex: 1 }}>
            <Container marginBottom="sm">
              <Text variant="label" color="onBackground">
                {t("property.location.street")} *
              </Text>
            </Container>
            <Input
              value={formData.address?.street || ""}
              onChangeText={(value) =>
                handleFieldChange("address", "street", value)
              }
              placeholder={t("property.location.streetPlaceholder")}
              error={errors["address.street"]}
              autoCapitalize="words"
              maxLength={200}
            />
          </Container>

          {/* State and Postal Code Row */}
          <Container
            flexDirection="row"
            marginBottom="lg"
            style={{ zIndex: 1 }}
          >
            <Container flex={1} marginRight="sm">
              <Container marginBottom="sm">
                <Text variant="label" color="onBackground">
                  {t("property.location.state")} *
                </Text>
              </Container>
              <Input
                value={formData.address?.state || ""}
                onChangeText={(value) =>
                  handleFieldChange("address", "state", value)
                }
                placeholder={t("property.location.statePlaceholder")}
                error={errors["address.state"]}
                autoCapitalize="words"
                maxLength={100}
              />
            </Container>

            <Container flex={1} marginLeft="sm">
              <Container marginBottom="sm">
                <Text variant="label" color="onBackground">
                  {t("property.location.postalCode")} *
                </Text>
              </Container>
              <Input
                value={formData.address?.postalCode || ""}
                onChangeText={(value) =>
                  handleFieldChange("address", "postalCode", value)
                }
                placeholder={t("property.location.postalCodePlaceholder")}
                error={errors["address.postalCode"]}
                keyboardType="default"
                maxLength={20}
              />
            </Container>
          </Container>

          {/* Coordinates Section */}
          <Container marginBottom="lg">
            <Container marginBottom="sm">
              <Text variant="h6" color="onBackground">
                {t("property.location.coordinates")}
              </Text>
              <Text variant="body" color="onBackgroundVariant">
                {t("property.location.coordinatesHelp")}
              </Text>
            </Container>

            <Container flexDirection="row" marginTop="md">
              {/* Latitude */}
              <Container flex={1} marginRight="sm">
                <Container marginBottom="sm">
                  <Text variant="label" color="onBackground">
                    {t("property.location.latitude")} *
                  </Text>
                </Container>
                <Input
                  value={latitudeStr}
                  onChangeText={(value) =>
                    handleCoordinateChange("latitude", value)
                  }
                  placeholder="0.000000"
                  error={errors["coordinates.latitude"] || errors.coordinates}
                  keyboardType="decimal-pad"
                  maxLength={20}
                />
              </Container>

              {/* Longitude */}
              <Container flex={1} marginLeft="sm">
                <Container marginBottom="sm">
                  <Text variant="label" color="onBackground">
                    {t("property.location.longitude")} *
                  </Text>
                </Container>
                <Input
                  value={longitudeStr}
                  onChangeText={(value) =>
                    handleCoordinateChange("longitude", value)
                  }
                  placeholder="0.000000"
                  error={errors["coordinates.longitude"] || errors.coordinates}
                  keyboardType="decimal-pad"
                  maxLength={20}
                />
              </Container>
            </Container>
            {errors.coordinates && (
              <Container marginTop="xs">
                <Text variant="caption" color="error">
                  {errors.coordinates}
                </Text>
              </Container>
            )}
          </Container>

          {/* Privacy Info Box */}
          <InfoBox
            title={t("property.location.privacyTitle")}
            content={t("property.location.privacyNote")}
            icon="information-circle"
            variant="info"
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
