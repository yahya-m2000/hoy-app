/**
 * Sign Up Screen for the Hoy application
 * Provides user registration functionality with comprehensive form validation
 */

import React, { useState, useEffect } from "react";
import { TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Context and hooks
import { useAuth, useToast, useLocation } from "@core/context";
import { useTheme } from "@core/hooks/useTheme";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

// Base Components
import { Text, Button, Input, PhoneInput } from "src/shared/components/base";
import { Container, Header, Screen } from "src/shared";
import { PasswordStrengthIndicator } from "src/shared/components";
import AvatarPicker from "src/shared/components/form/AvatarPicker";

// Auth Components
import CountrySelectModal from "@features/auth/components/CountrySelectModal";
import CitySelectModal from "@features/auth/components/CitySelectModal";

// Country and city data
import {
  COUNTRIES,
  getCitiesByCountryCode,
  searchCountries,
  searchCities,
} from "@core/utils/data/countries";

interface SSOSignupData {
  provider: string;
  ssoId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export default function SignUpScreen() {
  const { t } = useTranslation();
  const {
    registrationState,
    updateRegistrationField,
    updateRegistrationFields,
    setSSOSignupData,
    handleRegistration,
  } = useAuth();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();
  const { address } = useLocation();

  // Local state for UI interactions
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { formState, errors, loading } = registrationState;

  // Computed values
  const filteredCountries = searchCountries(formState.countrySearch);
  const availableCities = getCitiesByCountryCode(
    formState.selectedCountry.code
  );
  const filteredCities = formState.citySearch.trim()
    ? searchCities(formState.citySearch, formState.selectedCountry.code)
    : availableCities;

  // Check for SSO signup data on mount
  useEffect(() => {
    const checkSSOData = async () => {
      try {
        console.log("Checking for SSO data in AsyncStorage...");
        const storedData = await AsyncStorage.getItem("ssoSignupData");
        console.log("Stored SSO data:", storedData);

        if (storedData) {
          const data: SSOSignupData = JSON.parse(storedData);
          console.log("Parsed SSO data:", data);
          setSSOSignupData(data);

          // Clear the stored data
          await AsyncStorage.removeItem("ssoSignupData");

          showToast({
            type: "info",
            message: t("auth.ssoSignupInfo", {
              provider: data.provider,
            }),
          });
        } else {
          console.log("No SSO data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error loading SSO data:", error);
      }
    };

    checkSSOData();
  }, []);

  // Auto-fill location data when available
  useEffect(() => {
    if (address && !formState.country) {
      // Find matching country by name or code
      const matchingCountry = COUNTRIES.find(
        (c) =>
          c.name.toLowerCase() === address.country.toLowerCase() ||
          c.code.toLowerCase() === address.countryCode.toLowerCase()
      );

      if (matchingCountry) {
        updateRegistrationFields({
          selectedCountry: {
            name: matchingCountry.name,
            code: matchingCountry.code,
            flag: matchingCountry.flag || "",
          },
          country: matchingCountry.name,
          city: address.city || "",
        });

        showToast({
          type: "info",
          message: t("location.addressAutoFilled"),
        });
      }
    }
  }, [address, formState.country]);

  // Handle country selection
  const handleCountrySelect = (selectedCountryData: (typeof COUNTRIES)[0]) => {
    updateRegistrationFields({
      selectedCountry: {
        name: selectedCountryData.name,
        code: selectedCountryData.code,
        flag: selectedCountryData.flag || "",
      },
      country: selectedCountryData.name,
      countryModalVisible: false,
      countrySearch: "",
      // Clear city when country changes
      city: "",
    });
  };

  // Handle city selection
  const handleCitySelect = (selectedCity: string) => {
    updateRegistrationFields({
      city: selectedCity,
      cityModalVisible: false,
      citySearch: "",
    });
  };

  // Handle registration submission
  const handleRegister = async () => {
    try {
      console.log("Starting registration with form state:", {
        hasSSOData: !!formState.ssoData,
        ssoData: formState.ssoData,
        email: formState.email,
        firstName: formState.firstName,
        lastName: formState.lastName,
        hasPassword: !!formState.password,
        agreeToTerms: formState.agreeToTerms,
      });

      await handleRegistration();

      showToast({
        type: "success",
        message: t("auth.registrationSuccess"),
      });

      router.back();
    } catch (error) {
      console.error("Registration error:", error);
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : t("auth.registrationFailed"),
      });
    }
  };

  // Handle avatar picker
  const handleAvatarChange = (avatarUri: string | null) => {
    updateRegistrationField("avatar", avatarUri);
  };

  // Handle terms and privacy links
  const openTerms = () => {
    Linking.openURL("https://example.com/terms");
  };

  const openPrivacy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  return (
    <>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, marginBottom: 60 }}
        bottomOffset={60}
      >
        <Container flex={1}>
          <Header
            title={t("auth.createAccount")}
            left={{
              icon: "chevron-back-outline",
              onPress: () => router.back(),
            }}
          />
          <StatusBar style={isDark ? "light" : "dark"} />

          <Container flex={1} padding="lg">
            {/* Error Messages */}
            {Object.keys(errors).length > 0 && (
              <Container marginBottom="lg">
                {Object.entries(errors).map(([field, error]) => (
                  <Text
                    key={field}
                    variant="body"
                    color="error"
                    weight="bold"
                    align="center"
                    style={{ marginBottom: 4 }}
                  >
                    {error}
                  </Text>
                ))}
              </Container>
            )}

            {/* Profile Picture Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.profilePicture")}
                </Text>
              </Container>
              <Container style={{ alignSelf: "center", marginBottom: 8 }}>
                <AvatarPicker
                  value={formState.avatar}
                  onChange={handleAvatarChange}
                  size={100}
                  uploadToStorage={false}
                />
              </Container>
              <Text variant="caption" color="secondary" align="center">
                {t("auth.profilePictureHelper")}
              </Text>
            </Container>

            {/* Legal Name Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.legalName")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.firstName")}
                  value={formState.firstName}
                  onChangeText={(value) =>
                    updateRegistrationField("firstName", value)
                  }
                  placeholder={t("auth.firstName")}
                  autoCapitalize="words"
                  textContentType="givenName"
                  autoComplete="given-name"
                  style={{ marginBottom: 8 }}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.firstNameHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.lastName")}
                  value={formState.lastName}
                  onChangeText={(value) =>
                    updateRegistrationField("lastName", value)
                  }
                  placeholder={t("auth.lastName")}
                  autoCapitalize="words"
                  textContentType="familyName"
                  autoComplete="family-name"
                  style={{ marginBottom: 8 }}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.lastNameHelper")}
                </Text>
              </Container>
            </Container>

            {/* Contact Details Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.contactDetails")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.email")}
                  value={formState.email}
                  onChangeText={(value) =>
                    updateRegistrationField("email", value)
                  }
                  placeholder={t("auth.email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                  style={{ marginBottom: 8 }}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.emailHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <PhoneInput
                  label={t("auth.phoneNumber")}
                  value={formState.phoneNumber}
                  onChangeText={(value) =>
                    updateRegistrationField("phoneNumber", value)
                  }
                  placeholder={t("auth.phoneNumber")}
                  style={{ marginBottom: 8 }}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.phoneNumberHelper")}
                </Text>
              </Container>
            </Container>

            {/* Address Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.address")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <TouchableOpacity
                  onPress={() =>
                    updateRegistrationField("countryModalVisible", true)
                  }
                  style={{
                    borderWidth: 1,
                    borderColor: errors.country
                      ? theme.error
                      : theme.text?.secondary || theme.secondary,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    backgroundColor: theme.background,
                    minHeight: 56,
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
                    {t("auth.country")}
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: formState.country
                        ? theme.text?.primary || theme.primary
                        : theme.text?.secondary || theme.secondary,
                      fontSize: 16,
                      fontWeight: formState.country ? "400" : "300",
                    }}
                  >
                    {formState.country || t("auth.selectCountry")}
                  </Text>
                </TouchableOpacity>
                {errors.country && (
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
                    {errors.country}
                  </Text>
                )}
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
                  {t("auth.countryHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <TouchableOpacity
                  onPress={() => {
                    if (!formState.country) {
                      showToast({
                        type: "error",
                        message: "Please select a country first",
                      });
                      return;
                    }
                    updateRegistrationField("cityModalVisible", true);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: errors.city
                      ? theme.error
                      : theme.text?.secondary || theme.secondary,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    backgroundColor: theme.background,
                    minHeight: 56,
                    opacity: formState.country ? 1 : 0.6,
                  }}
                  disabled={!formState.country}
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
                    {t("auth.city")}
                  </Text>
                  <Text
                    variant="body"
                    style={{
                      color: formState.city
                        ? theme.text?.primary || theme.primary
                        : theme.text?.secondary || theme.secondary,
                      fontSize: 16,
                      fontWeight: formState.city ? "400" : "300",
                    }}
                  >
                    {formState.city ||
                      (formState.country
                        ? t("auth.selectCity")
                        : "Select country first")}
                  </Text>
                </TouchableOpacity>
                {errors.city && (
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
                    {errors.city}
                  </Text>
                )}
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
                  {formState.country
                    ? `${availableCities.length} cities available in ${formState.country}`
                    : t("auth.cityHelper")}
                </Text>
              </Container>
            </Container>

            {/* Password Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.password")}
                </Text>
                {formState.ssoData && (
                  <Text
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: 4 }}
                  >
                    {t("auth.passwordOptional")}
                  </Text>
                )}
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.password")}
                  value={formState.password}
                  onChangeText={(value) =>
                    updateRegistrationField("password", value)
                  }
                  placeholder={
                    formState.ssoData
                      ? t("auth.passwordOptional")
                      : t("auth.password")
                  }
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  style={{ marginBottom: 8 }}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: [-];"
                />
                <Text variant="caption" color="secondary">
                  {t("auth.passwordHelper")}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: 4, fontStyle: "italic" }}
                >
                  {t("auth.passwordManager.savePrompt")}
                </Text>
                <PasswordStrengthIndicator
                  password={formState.password}
                  showSuggestions={true}
                />

                {/* Password Suggestion Button */}
                {/* <TouchableOpacity
                  onPress={() => {
                    const suggestions = generatePasswordSuggestions(1);
                    if (suggestions.length > 0) {
                      updateRegistrationField("password", suggestions[0]);
                      updateRegistrationField(
                        "confirmPassword",
                        suggestions[0]
                      );
                      showToast({
                        type: "info",
                        message:
                          "Strong password generated! Please review and confirm.",
                      });
                    }
                  }}
                  style={{
                    backgroundColor: theme.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignSelf: "flex-start",
                    marginTop: 8,
                  }}
                >
                  <Text size="sm" color="white" weight="medium">
                    🔐 Generate Strong Password
                  </Text>
                </TouchableOpacity> */}
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.confirmPassword")}
                  value={formState.confirmPassword}
                  onChangeText={(value) =>
                    updateRegistrationField("confirmPassword", value)
                  }
                  placeholder={t("auth.confirmPassword")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                  onRightIconPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={{ marginBottom: 8 }}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: [-];"
                />
                <Text variant="caption" color="secondary">
                  {t("auth.confirmPasswordHelper")}
                </Text>
              </Container>
            </Container>

            {/* Terms and Conditions */}
            <Container marginBottom="xl">
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
                onPress={() =>
                  updateRegistrationField(
                    "agreeToTerms",
                    !formState.agreeToTerms
                  )
                }
              >
                <Container
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.primary,
                    backgroundColor: formState.agreeToTerms
                      ? theme.primary
                      : "transparent",
                    marginRight: 12,
                    marginTop: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {formState.agreeToTerms && (
                    <Text color="white" variant="caption">
                      ✓
                    </Text>
                  )}
                </Container>
                <Container style={{ flex: 1 }}>
                  <Text variant="body" style={{ lineHeight: 22 }}>
                    {t("auth.termsAgreement")}
                  </Text>
                  <Container
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <TouchableOpacity onPress={openTerms}>
                      <Text
                        variant="body"
                        color="primary"
                        style={{ textDecorationLine: "underline" }}
                      >
                        {t("auth.termsAndConditions")}
                      </Text>
                    </TouchableOpacity>
                    <Text variant="body" style={{ marginHorizontal: 4 }}>
                      {t("common.and")}
                    </Text>
                    <TouchableOpacity onPress={openPrivacy}>
                      <Text
                        variant="body"
                        color="primary"
                        style={{ textDecorationLine: "underline" }}
                      >
                        {t("auth.privacyPolicy")}
                      </Text>
                    </TouchableOpacity>
                  </Container>
                </Container>
              </TouchableOpacity>
            </Container>

            <Container marginBottom="lg">
              <Button
                title={t("auth.createAccount")}
                onPress={() => {
                  console.log("Register button pressed");
                  console.log("Current form state:", formState);
                  console.log("Current errors:", errors);
                  console.log("Loading state:", loading);
                  handleRegister();
                }}
                loading={loading}
                variant="primary"
                style={{ marginBottom: 16 }}
              />

              <Button
                title={t("auth.alreadyHaveAccount")}
                variant="ghost"
                onPress={() => router.push("/(auth)/sign-in")}
                style={{ alignSelf: "center" }}
              />
            </Container>
          </Container>

          {/* Country Selection Modal */}
          <CountrySelectModal
            visible={formState.countryModalVisible}
            onClose={() =>
              updateRegistrationField("countryModalVisible", false)
            }
            countries={filteredCountries}
            onSelect={handleCountrySelect}
            theme={theme}
            t={t}
          />

          {/* City Selection Modal */}
          <CitySelectModal
            visible={formState.cityModalVisible}
            onClose={() => updateRegistrationField("cityModalVisible", false)}
            cities={filteredCities}
            onSelect={handleCitySelect}
            selectedCountry={formState.selectedCountry}
            theme={theme}
            t={t}
          />
        </Container>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}
