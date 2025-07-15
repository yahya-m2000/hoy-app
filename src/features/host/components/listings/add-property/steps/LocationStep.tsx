import React, { useState, useEffect, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  TouchableOpacity,
  View,
  Modal,
  Platform,
  InteractionManager,
} from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import {
  Container,
  Text,
  Input,
  Icon,
  AutocompleteInput,
  Screen,
  Tab,
  Button,
} from "@shared/components";
import { PropertyFormData } from "@core/types";
import { spacing, iconSize } from "@core/design";
import { ThemeContext } from "@core/context/ThemeContext";
import { theme as appTheme } from "@core/design/colors";
import { useToast } from "@core/context/ToastContext";
import { AppleMaps, GoogleMaps } from "expo-maps";
import * as Location from "expo-location";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";
import {
  COUNTRIES,
  getCitiesByCountryCode,
  searchCountries,
  searchCities,
} from "@core/utils/data/countries";
import CountrySelectModal from "src/features/auth/components/CountrySelectModal";
import CitySelectModal from "src/features/auth/components/CitySelectModal";

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
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: formData.coordinates?.latitude || 37.78825,
    longitude: formData.coordinates?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [tempCoordinates, setTempCoordinates] = useState({
    latitude: formData.coordinates?.latitude || mapRegion.latitude,
    longitude: formData.coordinates?.longitude || mapRegion.longitude,
  });
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    latitude: formData.coordinates?.latitude || mapRegion.latitude,
    longitude: formData.coordinates?.longitude || mapRegion.longitude,
  });
  const [mapHeight, setMapHeight] = useState(300);
  const themeContext = useContext(ThemeContext);
  const currentTheme = themeContext?.theme || appTheme.light;
  const { showToast } = useToast();
  const [openCityAfterCountry, setOpenCityAfterCountry] = useState(false);

  // Filtering logic (like sign-up)
  const filteredCountries = searchCountries(countrySearch);
  const availableCities = selectedCountry
    ? getCitiesByCountryCode(selectedCountry.code)
    : [];
  const filteredCities = citySearch.trim()
    ? searchCities(citySearch, selectedCountry?.code)
    : availableCities;

  // When a country is selected
  const handleCountrySelect = (country: {
    name: string;
    code: string;
    [key: string]: any;
  }) => {
    setSelectedCountry(country);
    setCountry(country.name);
    setCountryModalVisible(false);
    setCountrySearch("");
    setCity("");
    setOpenCityAfterCountry(true); // Set flag to open city modal after country modal closes
    // Also update form data
    updateNestedFormData("address", "country", country.name);
    updateNestedFormData("address", "city", "");
    updateNestedFormData("address", "state", "");
  };

  // When a city is selected
  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setCityModalVisible(false);
    setCitySearch("");
    // Also update form data
    updateNestedFormData("address", "city", selectedCity);
    // Center map on the selected city
    centerMapOnCity(selectedCity, formData.address?.country || "");
    if (selectedCountry) {
      // Optionally set state if you have that logic
      // const state = getStateByCity(selectedCountry.code, selectedCity);
      // if (state) updateNestedFormData("address", "state", state);
    }
  };

  // Center map on selected city
  const centerMapOnCity = async (cityName: string, countryName: string) => {
    try {
      // Create a search query that includes both city and country for better accuracy
      let searchQuery = cityName;
      if (countryName) {
        // Handle special cases for country names
        let geocodingCountry = countryName;
        if (countryName === "Somaliland") {
          geocodingCountry = "Somalia";
        }
        searchQuery = `${cityName}, ${geocodingCountry}`;
      }

      console.log(`Geocoding city: ${searchQuery}`);
      const geocodeResult = await Location.geocodeAsync(searchQuery);

      if (geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        console.log(`Geocoded city ${cityName} to:`, { latitude, longitude });

        // Update map region to center on the city with closer zoom
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.1, // Closer zoom for city view
          longitudeDelta: 0.1,
        };
        setMapRegion(newRegion);

        // Update selected coordinates to the city location
        const newCoordinates = { latitude, longitude };
        setSelectedCoordinates(newCoordinates);
        setTempCoordinates(newCoordinates);
        updateNestedFormData("coordinates", "latitude", latitude);
        updateNestedFormData("coordinates", "longitude", longitude);
      } else {
        console.log(`No geocoding results found for city: ${searchQuery}`);
      }
    } catch (error) {
      console.log(`Could not geocode city ${cityName}:`, error);
    }
  };

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
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      updateNestedFormData("coordinates", field, parsedValue);
    } else if (value === "" || value === "-") {
      updateNestedFormData("coordinates", field, 0);
    }
  };

  // Handle country selection
  const handleCountryChange = (value: string) => {
    const suggestions = searchCountries(value).map((c) => c.name);
    // setCountrySuggestions(suggestions); // This line was removed
  };

  // Handle map marker selection
  const handleMapMarkerSelect = (coordinate: {
    latitude: number;
    longitude: number;
  }) => {
    console.log("handleMapMarkerSelect called with:", coordinate);
    setSelectedCoordinates(coordinate);
    console.log("selectedCoordinates updated to:", coordinate);
    updateNestedFormData("coordinates", "latitude", coordinate.latitude);
    updateNestedFormData("coordinates", "longitude", coordinate.longitude);
    console.log("Form data coordinates updated");
  };

  // Handle map region change
  const handleMapRegionChange = (region: any) => {
    setMapRegion(region);
  };

  // Open map picker modal
  const openMapPicker = () => {
    setTempCoordinates(selectedCoordinates);
    setMapPickerVisible(true);
  };

  // Close map picker modal
  const closeMapPicker = () => {
    setMapPickerVisible(false);
  };

  // Confirm coordinates from map picker
  const confirmCoordinates = () => {
    setSelectedCoordinates(tempCoordinates);
    updateNestedFormData("coordinates", "latitude", tempCoordinates.latitude);
    updateNestedFormData("coordinates", "longitude", tempCoordinates.longitude);
    setMapPickerVisible(false);
  };

  // Handle map click in picker modal
  const handleMapPickerClick = (coordinate: {
    latitude: number;
    longitude: number;
  }) => {
    setTempCoordinates(coordinate);
  };

  // Center map on selected country
  const centerMapOnCountry = async (countryName: string) => {
    try {
      // Handle special cases where the display name differs from the geocoding name
      let geocodingName = countryName;
      if (countryName === "Somaliland") {
        geocodingName = "Somalia";
      }

      const geocodeResult = await Location.geocodeAsync(geocodingName);
      if (geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];
        console.log(`Geocoded ${countryName} (using ${geocodingName}) to:`, {
          latitude,
          longitude,
        });
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 10, // Zoom out to show more of the country
          longitudeDelta: 10,
        };
        setMapRegion(newRegion);
        // Also update selected coordinates to the center of the country
        const newCoordinates = { latitude, longitude };
        setSelectedCoordinates(newCoordinates);
        setTempCoordinates(newCoordinates);
        updateNestedFormData("coordinates", "latitude", latitude);
        updateNestedFormData("coordinates", "longitude", longitude);
      }
    } catch (error) {
      console.log(`Could not geocode country ${countryName}:`, error);
    }
  };

  // Update map when country changes
  useEffect(() => {
    if (formData.address?.country) {
      centerMapOnCountry(formData.address.country);
    }
  }, [formData.address?.country]);

  // Debug: Log current selectedCoordinates state
  console.log("Current selectedCoordinates:", selectedCoordinates);
  console.log(
    "Should show marker:",
    selectedCoordinates.latitude !== 0 && selectedCoordinates.longitude !== 0
  );

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
    <Container>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, marginBottom: 60 }}
        bottomOffset={60}
      >
        <Container paddingBottom="xxl">
          <StepHeader
            title={t("property.steps.location.title")}
            description={t("property.steps.location.description")}
          />

          {/* Country */}
          <Container marginBottom="xl" style={{ zIndex: 3 }}>
            <TouchableOpacity
              onPress={() => setCountryModalVisible(true)}
              style={{
                borderWidth: 1,
                borderColor: errors["address.country"]
                  ? currentTheme.error
                  : currentTheme.text?.secondary || currentTheme.secondary,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: currentTheme.background,
                minHeight: 56,
              }}
            >
              <Text
                variant="caption"
                color="secondary"
                style={{
                  marginBottom: 4,
                  fontSize: 12,
                  color: currentTheme.text?.secondary || currentTheme.secondary,
                }}
              >
                {t("property.location.country")} *
              </Text>
              <Text
                variant="body"
                style={{
                  color: formData.address?.country
                    ? currentTheme.text?.primary || currentTheme.primary
                    : currentTheme.text?.secondary || currentTheme.secondary,
                  fontSize: 16,
                  fontWeight: formData.address?.country ? "400" : "300",
                }}
              >
                {formData.address?.country ||
                  t("property.location.countryPlaceholder")}
              </Text>
            </TouchableOpacity>
            {errors["address.country"] && (
              <Text
                variant="caption"
                color="error"
                style={{
                  marginTop: 4,
                  marginLeft: 4,
                  fontSize: 12,
                  color: currentTheme.error,
                }}
              >
                {errors["address.country"]}
              </Text>
            )}

            <CountrySelectModal
              visible={countryModalVisible}
              onClose={() => {
                setCountryModalVisible(false);
                if (openCityAfterCountry) {
                  setOpenCityAfterCountry(false);
                  InteractionManager.runAfterInteractions(() => {
                    setCityModalVisible(true);
                  });
                }
              }}
              countries={filteredCountries}
              onSelect={handleCountrySelect}
              theme={{ border: "#F0F0F0" }}
              t={t}
            />
          </Container>

          {/* City */}
          <Container marginBottom="lg" style={{ zIndex: 2 }}>
            <TouchableOpacity
              onPress={() => {
                if (!formData.address?.country) {
                  showToast({
                    type: "error",
                    message: "Please select a country first",
                  });
                  return;
                }
                setCityModalVisible(true);
              }}
              style={{
                borderWidth: 1,
                borderColor: errors["address.city"]
                  ? currentTheme.error
                  : currentTheme.text?.secondary || currentTheme.secondary,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: currentTheme.background,
                minHeight: 56,
                opacity: formData.address?.country ? 1 : 0.6,
              }}
              disabled={!formData.address?.country}
            >
              <Text
                variant="caption"
                color="secondary"
                style={{
                  marginBottom: 4,
                  fontSize: 12,
                  color: currentTheme.text?.secondary || currentTheme.secondary,
                }}
              >
                {t("property.location.city")} *
              </Text>
              <Text
                variant="body"
                style={{
                  color: formData.address?.city
                    ? currentTheme.text?.primary || currentTheme.primary
                    : currentTheme.text?.secondary || currentTheme.secondary,
                  fontSize: 16,
                  fontWeight: formData.address?.city ? "400" : "300",
                }}
              >
                {formData.address?.city ||
                  (formData.address?.country
                    ? t("property.location.cityPlaceholder")
                    : "Select country first")}
              </Text>
            </TouchableOpacity>
            {errors["address.city"] && (
              <Text
                variant="caption"
                color="error"
                style={{
                  marginTop: 4,
                  marginLeft: 4,
                  fontSize: 12,
                  color: currentTheme.error,
                }}
              >
                {errors["address.city"]}
              </Text>
            )}
            {cityModalVisible && (
              <CitySelectModal
                visible={cityModalVisible}
                onClose={() => setCityModalVisible(false)}
                cities={filteredCities}
                onSelect={handleCitySelect}
                selectedCountry={selectedCountry || { name: "" }}
                theme={{ border: "#F0F0F0" }}
                t={t}
              />
            )}
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

            {/* Interactive Map */}
            <Container
              marginBottom="lg"
              style={{
                height: mapHeight,
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#E0E0E0",
              }}
            >
              {/* Static Map View - Non-interactive */}
              {Platform.OS === "ios" ? (
                <AppleMaps.View
                  style={{ flex: 1 }}
                  cameraPosition={{
                    coordinates: {
                      latitude: selectedCoordinates.latitude,
                      longitude: selectedCoordinates.longitude,
                    },
                    zoom: 10,
                  }}
                  annotations={
                    selectedCoordinates.latitude &&
                    selectedCoordinates.longitude
                      ? [
                          {
                            id: "property-marker",
                            coordinates: {
                              latitude: selectedCoordinates.latitude,
                              longitude: selectedCoordinates.longitude,
                            },
                            title: "Selected Location",
                          },
                        ]
                      : []
                  }
                  uiSettings={{}}
                />
              ) : (
                <GoogleMaps.View
                  style={{ flex: 1 }}
                  cameraPosition={{
                    coordinates: {
                      latitude: selectedCoordinates.latitude,
                      longitude: selectedCoordinates.longitude,
                    },
                    zoom: 10,
                  }}
                  markers={
                    selectedCoordinates.latitude &&
                    selectedCoordinates.longitude
                      ? [
                          {
                            id: "property-marker",
                            coordinates: {
                              latitude: selectedCoordinates.latitude,
                              longitude: selectedCoordinates.longitude,
                            },
                            title: "Selected Location",
                          },
                        ]
                      : []
                  }
                  uiSettings={{
                    scrollGesturesEnabled: false,
                    zoomGesturesEnabled: false,
                    rotationGesturesEnabled: false,
                    tiltGesturesEnabled: false,
                    zoomControlsEnabled: false,
                    mapToolbarEnabled: false,
                    myLocationButtonEnabled: false,
                  }}
                />
              )}
            </Container>

            {/* Pick Coordinates Button */}
            <Container marginBottom="md">
              <TouchableOpacity
                onPress={openMapPicker}
                style={{
                  backgroundColor: "#007AFF",
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name="map-outline"
                  size={iconSize.sm}
                  color="white"
                  style={{ marginRight: spacing.xs }}
                />
                <Text
                  variant="body"
                  color="white"
                  style={{ fontWeight: "600" }}
                >
                  {t("property.location.pickCoordinates")}
                </Text>
              </TouchableOpacity>
            </Container>

            {/* Map Picker Modal */}
            <Modal
              visible={mapPickerVisible}
              animationType="slide"
              presentationStyle="fullScreen"
              onRequestClose={closeMapPicker}
            >
              <Screen
                header={{
                  right: {
                    icon: "close",
                    onPress: closeMapPicker,
                  },
                  variant: "transparent",
                }}
              >
                <Container style={{ flex: 1 }}>
                  {/* Interactive Map in Modal */}
                  {Platform.OS === "ios" ? (
                    <AppleMaps.View
                      style={{ flex: 1 }}
                      cameraPosition={{
                        coordinates: {
                          latitude: selectedCoordinates.latitude,
                          longitude: selectedCoordinates.longitude,
                        },
                        zoom: 10,
                      }}
                      annotations={
                        tempCoordinates.latitude && tempCoordinates.longitude
                          ? [
                              {
                                id: "temp-marker",
                                coordinates: {
                                  latitude: tempCoordinates.latitude,
                                  longitude: tempCoordinates.longitude,
                                },
                                title: "Selected Location",
                              },
                            ]
                          : []
                      }
                      onMapClick={(event: {
                        coordinates: { latitude?: number; longitude?: number };
                      }) => {
                        if (
                          event &&
                          event.coordinates &&
                          typeof event.coordinates.latitude === "number" &&
                          typeof event.coordinates.longitude === "number"
                        ) {
                          handleMapPickerClick({
                            latitude: event.coordinates.latitude,
                            longitude: event.coordinates.longitude,
                          });
                        }
                      }}
                    />
                  ) : (
                    <GoogleMaps.View
                      style={{ flex: 1 }}
                      cameraPosition={{
                        coordinates: {
                          latitude: selectedCoordinates.latitude,
                          longitude: selectedCoordinates.longitude,
                        },
                        zoom: 10,
                      }}
                      markers={
                        tempCoordinates.latitude && tempCoordinates.longitude
                          ? [
                              {
                                id: "temp-marker",
                                coordinates: {
                                  latitude: tempCoordinates.latitude,
                                  longitude: tempCoordinates.longitude,
                                },
                                title: "Selected Location",
                              },
                            ]
                          : []
                      }
                      onMapClick={(event: {
                        coordinates: { latitude?: number; longitude?: number };
                      }) => {
                        if (
                          event &&
                          event.coordinates &&
                          typeof event.coordinates.latitude === "number" &&
                          typeof event.coordinates.longitude === "number"
                        ) {
                          handleMapPickerClick({
                            latitude: event.coordinates.latitude,
                            longitude: event.coordinates.longitude,
                          });
                        }
                      }}
                    />
                  )}
                </Container>

                {/* Selected Coordinates Display */}
                <Tab>
                  {/* Confirm Button */}
                  <Button
                    onPress={confirmCoordinates}
                    variant="primary"
                    title={t("property.location.confirmLocation")}
                  />
                </Tab>
              </Screen>
            </Modal>

            {/* Selected Coordinates Display */}
            <Container
              style={{
                padding: spacing.md,
                backgroundColor: "#F8F9FA",
                borderRadius: 8,
                marginBottom: spacing.md,
              }}
            >
              <Text
                variant="body"
                color="onBackground"
                style={{ marginBottom: spacing.xs, fontWeight: "600" }}
              >
                {t("property.location.selectedCoordinates")}:
              </Text>
              <Text>
                {selectedCoordinates.latitude.toFixed(6)},
                {selectedCoordinates.longitude.toFixed(6)}
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
                  value={
                    formData.coordinates?.latitude
                      ? String(formData.coordinates.latitude)
                      : ""
                  }
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
                  value={
                    formData.coordinates?.longitude
                      ? String(formData.coordinates.longitude)
                      : ""
                  }
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
      </KeyboardAwareScrollView>
      {/* <KeyboardToolbar /> */}
    </Container>
  );
}
