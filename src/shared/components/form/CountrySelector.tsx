/**
 * Country Selector Component
 * Reusable component for selecting countries with search functionality
 */

import React, { useState } from "react";
import { TouchableOpacity, Modal, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

// Base components
import { Text } from "../base/Text";
import { Container } from "../layout";
import { Input } from "../base/Input";

// Hooks and context
import { useTheme } from "@core/hooks/useTheme";

// Country data
import { COUNTRIES, searchCountries } from "@core/utils/data/countries";

// Types
interface CountrySelectorProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: any;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
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

  // State
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Computed values
  const filteredCountries = searchCountries(searchQuery);

  // Handle country selection
  const handleCountrySelect = (selectedCountry: (typeof COUNTRIES)[0]) => {
    onChangeText(selectedCountry.name);
    setModalVisible(false);
    setSearchQuery("");
  };

  return (
    <Container style={style}>
      <Container marginBottom="xs">
        <Text variant="label" color="onBackground">
          {label && `${label}${required ? " *" : ""}`}
        </Text>
      </Container>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderColor: error
            ? theme.error
            : theme.text?.secondary || theme.secondary,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: theme.background,
          minHeight: 56,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text
          variant="caption"
          color="secondary"
          style={{
            marginBottom: 4,
            fontSize: 12,
            color: theme.text?.secondary || theme.secondary,
          }}
        >
          {label || t("auth.country")}
        </Text>
        <Text
          variant="body"
          style={{
            color: value
              ? theme.text?.primary || theme.primary
              : theme.text?.secondary || theme.secondary,
            fontSize: 16,
            fontWeight: value ? "400" : "300",
          }}
        >
          {value || placeholder || t("auth.selectCountry")}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text
          variant="caption"
          color="error"
          style={{
            marginTop: 4,
            marginLeft: 4,
            fontSize: 12,
            color: theme.error,
          }}
        >
          {error}
        </Text>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
              {t("auth.country")}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text variant="body" color="primary">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </Container>

          <Container padding="md">
            <Input
              placeholder={t("auth.searchCountry")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search"
            />
          </Container>

          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredCountries.map((country) => (
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>
      </Modal>
    </Container>
  );
};

export default CountrySelector;
