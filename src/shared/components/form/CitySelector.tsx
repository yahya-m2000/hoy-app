/**
 * City Selector Component
 * Reusable component for selecting cities based on country
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
import {
  getCitiesByCountryCode,
  searchCities,
} from "@core/utils/data/countries";

// Types
interface CitySelectorProps {
  value: string;
  onChangeText: (text: string) => void;
  country: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: any;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  value,
  onChangeText,
  country,
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

  // Get country code from country name
  const getCountryCode = (countryName: string): string => {
    // This is a simplified approach - in a real app you might want to store the country code
    // For now, we'll use a mapping or find it from the countries data
    const countryMap: { [key: string]: string } = {
      Somaliland: "SO",
      "United States": "US",
      Canada: "CA",
      "United Kingdom": "GB",
      Australia: "AU",
      Germany: "DE",
      France: "FR",
      Italy: "IT",
      Spain: "ES",
      Japan: "JP",
      China: "CN",
      India: "IN",
      Brazil: "BR",
      Mexico: "MX",
      Russia: "RU",
      Netherlands: "NL",
      Switzerland: "CH",
      "South Korea": "KR",
      "New Zealand": "NZ",
      Singapore: "SG",
      "South Africa": "ZA",
      Turkey: "TR",
    };
    return countryMap[countryName] || "SO";
  };

  // Computed values
  const countryCode = getCountryCode(country);
  const availableCities = getCitiesByCountryCode(countryCode);
  const filteredCities = searchQuery.trim()
    ? searchCities(searchQuery, countryCode)
    : availableCities;

  // Handle city selection
  const handleCitySelect = (selectedCity: string) => {
    onChangeText(selectedCity);
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
        onPress={() => {
          if (!country) {
            // You might want to show a toast here
            return;
          }
          setModalVisible(true);
        }}
        disabled={disabled || !country}
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
          opacity: disabled || !country ? 0.6 : 1,
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
          {label || t("features.auth.forms.fields.city")}
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
          {value ||
            (country
              ? placeholder || t("features.auth.forms.placeholders.selectCity")
              : t("features.auth.forms.placeholders.selectCountryFirst"))}
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

      {country && (
        <Text
          variant="caption"
          color="secondary"
          style={{
            marginTop: 4,
            marginLeft: 4,
            fontSize: 12,
            color: theme.text?.secondary || theme.secondary,
          }}
        >
          {`${availableCities.length} cities available in ${country}`}
        </Text>
      )}

      {/* City Selection Modal */}
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
              {t("features.auth.forms.fields.city")}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text variant="body" color="primary">
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </Container>

          <Container padding="md">
            <Input
              placeholder={t("features.auth.forms.placeholders.searchCity")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon="search"
            />
          </Container>

          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  marginHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                }}
                onPress={() => handleCitySelect(city)}
              >
                <Container style={{ flex: 1 }}>
                  <Text weight="medium">{city}</Text>
                  <Text variant="caption" color="secondary">
                    {country}
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

export default CitySelector;
