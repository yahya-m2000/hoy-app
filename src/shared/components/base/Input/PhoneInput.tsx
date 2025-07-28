/**
 * Phone Input component with country code selection
 * Uses the existing Input component with country code picker
 */

import React, { useState } from "react";
import { TouchableOpacity, ScrollView } from "react-native";
import { Modal } from "react-native";
import { useTranslation } from "react-i18next";

// Base components
import { Input } from "./Input";
import { Text } from "../Text";
import { Container } from "../../layout";

// Hooks and context
import { useTheme } from "@core/hooks/useTheme";
import { useLocation } from "@core/context";

// Country data
import {
  COUNTRIES,
  getPhoneCodeByCountryCode,
} from "@core/utils/data/countries";

// Types
interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  disabled = false,
  required = false,
  style,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { address } = useLocation();

  // State
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Try to use location-based country first, then default to Somaliland
    if (address?.countryCode) {
      const locationCountry = COUNTRIES.find(
        (c) => c.code.toLowerCase() === address.countryCode.toLowerCase()
      );
      if (locationCountry) {
        return locationCountry;
      }
    }
    // Default to Somaliland
    return COUNTRIES.find((c) => c.code === "SO") || COUNTRIES[0];
  });

  // Extract phone number without country code
  const getPhoneWithoutCode = (fullPhone: string): string => {
    if (!fullPhone) return "";

    // If it starts with the selected country code, remove it
    const countryCode = selectedCountry.phoneCode.replace("+", "");
    if (fullPhone.startsWith(selectedCountry.phoneCode)) {
      return fullPhone.substring(selectedCountry.phoneCode.length).trim();
    }

    // If it starts with just the digits of the country code
    if (fullPhone.startsWith(countryCode)) {
      return fullPhone.substring(countryCode.length).trim();
    }

    return fullPhone;
  };

  // Get display value (country code + phone number)
  const getDisplayValue = (): string => {
    const phoneWithoutCode = getPhoneWithoutCode(value);
    if (!phoneWithoutCode) return "";
    return `${selectedCountry.phoneCode} ${phoneWithoutCode}`;
  };

  // Handle phone number change
  const handlePhoneChange = (text: string) => {
    // Remove country code from input if user types it
    let cleanText = text;
    if (text.startsWith(selectedCountry.phoneCode)) {
      cleanText = text.substring(selectedCountry.phoneCode.length).trim();
    }

    // Remove any non-digit characters except spaces and hyphens
    cleanText = cleanText.replace(/[^\d\s-]/g, "");

    // Combine country code with cleaned phone number
    const fullPhone = cleanText
      ? `${selectedCountry.phoneCode} ${cleanText}`
      : "";
    onChangeText(fullPhone);
  };

  // Handle country selection
  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country);
    setCountryModalVisible(false);

    // Update phone number with new country code
    const phoneWithoutCode = getPhoneWithoutCode(value);
    if (phoneWithoutCode) {
      const newFullPhone = `${country.phoneCode} ${phoneWithoutCode}`;
      onChangeText(newFullPhone);
    }
  };

  return (
    <Container style={style}>
      <Container marginBottom="xs">
        <Text variant="label" color="onBackground">
          {label && `${label}${required ? " *" : ""}`}
        </Text>
      </Container>

      <Container style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => setCountryModalVisible(true)}
          disabled={disabled}
          style={{
            borderWidth: 1,
            borderColor: error
              ? theme.error
              : theme.text?.secondary || theme.secondary,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 16,
            backgroundColor: theme.background,
            marginRight: 8,
            minWidth: 80,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="body" color="primary" weight="medium">
            {selectedCountry.phoneCode}
          </Text>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <Container style={{ flex: 1 }}>
          <Input
            value={getPhoneWithoutCode(value)}
            onChangeText={handlePhoneChange}
            placeholder={placeholder || t("features.auth.forms.fields.phoneNumber")}
            keyboardType="phone-pad"
            disabled={disabled}
            error={error}
            style={{ marginBottom: 0 }}
          />
        </Container>
      </Container>

      {/* Country Selection Modal */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Container flex={1} backgroundColor="background">
          <Container
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text variant="h6" color="primary">
              {t("features.auth.forms.placeholders.selectCountryCode")}
            </Text>
            <TouchableOpacity onPress={() => setCountryModalVisible(false)}>
              <Text variant="body" color="primary">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </Container>

          <ScrollView keyboardShouldPersistTaps="handled">
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  marginHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
                onPress={() => handleCountrySelect(country)}
              >
                <Container style={{ flex: 1 }}>
                  <Text weight="medium">{country.name}</Text>
                  <Text variant="caption" color="secondary">
                    {country.phoneCode}
                  </Text>
                </Container>
                {selectedCountry.code === country.code && (
                  <Text color="primary" weight="medium">
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>
      </Modal>
    </Container>
  );
};
