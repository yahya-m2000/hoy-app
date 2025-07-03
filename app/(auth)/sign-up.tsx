import React, { useState } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

import { useAuth, useToast } from "@core/context";
import { useTheme } from "@core/hooks/useTheme";
import { getAuthDebugInfo } from "@core/auth";
import {
  validatePhoneNumber,
  COUNTRIES,
  searchCountries,
} from "@core/utils/data/countries";

import { Text, Button, Input } from "src/shared/components/base";
import { Container, Header } from "src/shared";
import { SocialLogin } from "src/features/auth";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
}

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { register: authRegister } = useAuth();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = searchCountries(countrySearch);

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = t("auth.validation.firstNameRequired");
    }

    if (!lastName.trim()) {
      newErrors.lastName = t("auth.validation.lastNameRequired");
    }

    if (!email.trim()) {
      newErrors.email = t("auth.validation.emailInvalid");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!password) {
      newErrors.password = t("auth.validation.passwordTooShort");
    } else if (password.length < 8) {
      newErrors.password = t("auth.validation.passwordTooShort");
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      newErrors.password = t("auth.validation.passwordComplexity");
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwordsDoNotMatch");
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = t("auth.validation.phoneRequired");
    }

    if (!country.trim()) {
      newErrors.country = t("auth.validation.countryRequired");
    }

    if (!city.trim()) {
      newErrors.city = t("auth.validation.cityRequired");
    }

    return newErrors;
  };

  const handleRegister = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!agreeToTerms) {
      showToast({
        type: "error",
        message: "Please agree to the terms and conditions",
      });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authRegister({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        profilePicture: avatar,
        address: { city, country },
      } as any);
      await getAuthDebugInfo();
      showToast({ type: "success", message: "Account created successfully!" });
      router.back();
    } catch (err) {
      console.error("Registration error:", err);
      showToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      showToast({
        type: "error",
        message: t("auth.avatar.cameraPermissionDenied"),
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const openTerms = () => {
    Linking.openURL("https://example.com/terms");
  };

  const openPrivacy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  return (
    <Container flex={1}>
      <Header
        title={t("auth.createAccount")}
        left={{ icon: "arrow-back", onPress: () => router.back() }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Container flex={1} padding="lg">
            {/* Profile Picture Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.profilePicture")}
                </Text>
              </Container>
              <TouchableOpacity
                onPress={pickAvatar}
                style={{ alignSelf: "center", marginBottom: 8 }}
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <Container
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: theme.colors.gray?.[200] || "#f0f0f0",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: theme.colors.gray?.[300] || "#ccc",
                      borderStyle: "dashed",
                    }}
                  >
                    <Text color="secondary" variant="caption">
                      {t("auth.avatar.selectPhoto")}
                    </Text>
                  </Container>
                )}
              </TouchableOpacity>
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
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t("auth.firstName")}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.firstNameHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.lastName")}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t("auth.lastName")}
                  autoCapitalize="words"
                  error={errors.lastName}
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("auth.email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.emailHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Container flexDirection="row" alignItems="center">
                  <TouchableOpacity
                    onPress={() => setCountryModalVisible(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 8,
                      paddingVertical: 14,
                      borderWidth: 1,
                      borderColor: theme.text.primary || "#ccc",
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text>{selectedCountry.phoneCode}</Text>
                  </TouchableOpacity>
                  <Input
                    style={{ flex: 1 }}
                    label={t("auth.phoneNumber")}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder={t("auth.phoneNumber")}
                    keyboardType="phone-pad"
                    error={errors.phoneNumber}
                  />
                </Container>
                <Container marginTop="xs">
                  <Text variant="caption" color="secondary">
                    {t("auth.phoneHelper")}
                  </Text>
                </Container>
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
                <Input
                  label={t("auth.country")}
                  value={country}
                  onChangeText={setCountry}
                  placeholder={t("auth.country")}
                  error={errors.country}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.countryHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.city")}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t("auth.city")}
                  error={errors.city}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.cityHelper")}
                </Text>
              </Container>
            </Container>

            {/* Password Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("auth.password")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.password")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("auth.password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.password}
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
                <Text variant="caption" color="secondary">
                  {t("auth.passwordHelper")}
                </Text>
              </Container>
              <Container marginBottom="md">
                <Input
                  label={t("auth.confirmPassword")}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={t("auth.confirmPassword")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                  rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                  onRightIconPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
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
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <Container
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: theme.primary,
                    backgroundColor: agreeToTerms
                      ? theme.primary
                      : "transparent",
                    marginRight: 12,
                    marginTop: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {agreeToTerms && (
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
                onPress={handleRegister}
                loading={loading}
                variant="primary"
                style={{ marginBottom: 16 }}
              />

              <Button
                title={t("auth.alreadyHaveAccount")}
                variant="ghost"
                onPress={() => router.back()}
                style={{ alignSelf: "center" }}
              />
            </Container>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={countryModalVisible}
        animationType="slide"
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <Header
          title={t("auth.country")}
          left={{
            icon: "arrow-back",
            onPress: () => setCountryModalVisible(false),
          }}
        />
        <Container flex={1} paddingHorizontal="lg">
          <Input
            placeholder={t("common.search")}
            value={countrySearch}
            onChangeText={setCountrySearch}
            autoCapitalize="none"
            style={{ marginBottom: 16 }}
          />
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredCountries.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
                onPress={() => {
                  setSelectedCountry(c);
                  setCountryModalVisible(false);
                }}
              >
                <Text weight="medium">
                  {c.name} ({c.phoneCode})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>
      </Modal>
    </Container>
  );
}
