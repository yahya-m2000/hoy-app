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
        message: error instanceof Error ? error.message : t("errors.generic"),
      });
    }
  };

  if (isLoading) {
    return (
      <Container flex={1} backgroundColor={theme.background}>
        <Header
          title={t("account.personalInfo")}
          left={{ icon: "arrow-back", onPress: () => router.back() }}
        />
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor={theme.background}>
      <Header
        title={t("profile.personalInfo")}
        left={{ icon: "arrow-back", onPress: () => router.back() }}
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
              {t("auth.profilePicture")}
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
              style={{ marginBottom: 8 }}
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
            <PhoneInput
              label={t("auth.phoneNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
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
            <CountrySelector
              label={t("auth.country")}
              value={country}
              onChangeText={setCountry}
              placeholder={t("auth.selectCountry")}
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("auth.countryHelper")}
            </Text>
          </Container>
          <Container marginBottom="md">
            <CitySelector
              label={t("auth.city")}
              value={city}
              onChangeText={setCity}
              country={country}
              placeholder={t("auth.selectCity")}
              style={{ marginBottom: 8 }}
            />
            <Text variant="caption" color="secondary">
              {t("auth.cityHelper")}
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
