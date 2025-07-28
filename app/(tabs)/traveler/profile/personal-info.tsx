import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useTheme } from "@core/hooks/useTheme";
import { useAuth, useToast } from "@core/context";
import { useCurrentUser, useUpdateProfile } from "@features/user/hooks";

import {
  Container,
  Header,
  Text,
  Button,
  Input,
  LoadingSkeleton,
  PhoneInput,
  CountrySelector,
  CitySelector,
} from "@shared/components";
import AvatarPicker from "@shared/components/form/AvatarPicker";

const PersonalInfoScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { showToast } = useToast();
  const { user: authUser } = useAuth();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  // Local form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhoneNumber(currentUser.phoneNumber || "");
      setAvatar(currentUser.profilePicture || currentUser.avatarUrl || null);
      const addr = (currentUser as any).address || {};
      setCity(addr.city || "");
      setCountry(addr.country || "");
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
        phoneNumber,
        profilePicture: avatar || undefined,
        address: { city, country },
      } as any);
      showToast({ type: "success", message: t("account.profileUpdated") });
      router.back();
    } catch (error: any) {
      console.error("Update profile error", error);
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : t("system.errors.generic.unknown"),
      });
    }
  };

  if (isLoading) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header
          title={t("account.personalInfo")}
          left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
        />
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={t("features.account.profile.personalInfo")}
        left={{ icon: "chevron-back-outline", onPress: () => router.back() }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        enabled={true}
        keyboardDismissMode="interactive"
        bottomOffset={100}
      >
        {/* Profile Picture Section */}
        <Container marginBottom="xl" marginTop="md">
          <Container marginBottom="md">
            <Text variant="h6" color="primary">
              {t("features.auth.forms.fields.profilePicture")}
            </Text>
          </Container>
          <Container style={{ alignSelf: "center", marginBottom: 8 }}>
            <AvatarPicker
              value={avatar}
              onChange={setAvatar}
              size={100}
              uploadToStorage={true}
              userId={authUser?.id}
            />
          </Container>
          <Text variant="caption" color="secondary" align="center">
            {t("features.auth.forms.helpers.profilePictureHelper")}
          </Text>
        </Container>

        {/* Legal Name Section */}
        <Container marginBottom="xl">
          <Container marginBottom="md">
            <Text variant="h6" color="primary">
              {t("features.auth.forms.fields.legalName")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <Input
              label={t("features.auth.forms.fields.firstName")}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t("features.auth.forms.fields.firstName")}
              autoCapitalize="words"
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("features.auth.forms.helpers.firstNameHelper")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <Input
              label={t("features.auth.forms.fields.lastName")}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t("features.auth.forms.fields.lastName")}
              autoCapitalize="words"
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("features.auth.forms.helpers.lastNameHelper")}
            </Text>
          </Container>
        </Container>

        {/* Contact Details Section */}
        <Container marginBottom="xl">
          <Container marginBottom="md">
            <Text variant="h6" color="primary">
              {t("features.auth.forms.sections.contactDetails")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <PhoneInput
              label={t("features.auth.forms.fields.phoneNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t("features.auth.forms.fields.phoneNumber")}
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("features.auth.forms.helpers.phoneNumberHelper")}
            </Text>
          </Container>
        </Container>

        {/* Address Section */}
        <Container marginBottom="xl">
          <Container marginBottom="md">
            <Text variant="h6" color="primary">
              {t("features.auth.forms.sections.address")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <CountrySelector
              label={t("features.auth.forms.fields.country")}
              value={country}
              onChangeText={setCountry}
              placeholder={t("features.auth.forms.placeholders.selectCountry")}
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("features.auth.forms.helpers.countryHelper")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <CitySelector
              label={t("features.auth.forms.fields.city")}
              value={city}
              onChangeText={setCity}
              country={country}
              placeholder={t("features.auth.forms.placeholders.selectCity")}
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("features.auth.forms.helpers.cityHelper")}
            </Text>
          </Container>
        </Container>

        {/* Save Button Section */}
        <Container marginBottom="xl">
          <Button
            title={t("common.save")}
            onPress={handleSave}
            loading={(updateProfileMutation as any).isPending}
            variant="primary"
            size="large"
          />
        </Container>
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default PersonalInfoScreen;
