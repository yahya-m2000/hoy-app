import React, { useState, useEffect } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { useTheme } from "@core/hooks/useTheme";
import { useToast, useAuth } from "@core/context";
import { useCurrentUser, useUpdateProfile } from "@features/user/hooks";

import {
  Container,
  Header,
  Text,
  Button,
  Input,
  LoadingSkeleton,
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
        title={t("account.personalInfo")}
        left={{ icon: "arrow-back", onPress: () => router.back() }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        >
          {/* Avatar */}
          <Container marginBottom="xl">
            <Text
              variant="h6"
              color="primary"
              align="center"
              style={{ marginBottom: 8 }}
            >
              {t("auth.profilePicture")}
            </Text>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </Container>

          {/* Name */}
          <Container marginBottom="lg">
            <Input
              label={t("auth.firstName")}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            <Container marginTop="sm">
              <Input
                label={t("auth.lastName")}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </Container>
          </Container>

          {/* Contact */}
          <Container marginBottom="lg">
            <Input
              label={t("auth.phoneNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </Container>

          {/* Address */}
          <Container marginBottom="lg">
            <Input
              label={t("auth.country")}
              value={country}
              onChangeText={setCountry}
            />
            <Container marginTop="sm">
              <Input
                label={t("auth.city")}
                value={city}
                onChangeText={setCity}
              />
            </Container>
          </Container>

          <Button
            title={t("common.save")}
            onPress={handleSave}
            loading={(updateProfileMutation as any).isPending}
            variant="primary"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default PersonalInfoScreen;
