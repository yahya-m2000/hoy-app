/**
 * Personal Info Setting Component
 * Handles personal information form and editing
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

import {
  Container,
  Text,
  Button,
  Input,
  LoadingSkeleton,
} from "@shared/components";
import AvatarPicker from "@shared/components/form/AvatarPicker";
import { useCurrentUser, useUpdateProfile } from "@features/user/hooks";
import { useToast } from "@core/context";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) => {
  return (
    <Container marginBottom="md">
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </Container>
  );
};

interface PersonalInfoSettingProps {
  title: string;
  description: string;
  infoContent: string;
}

export const PersonalInfoSetting: React.FC<PersonalInfoSettingProps> = ({
  title,
  description,
  infoContent,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // Initialize form data
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

  // Handle save
  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
        phoneNumber,
        profilePicture: avatar || undefined,
        address: { city, country },
      } as any);
      showToast({ type: "success", message: t("common.success") });
      router.back();
    } catch (error: any) {
      console.error("Update profile error", error);
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : t("common.error"),
      });
    }
  };

  // Show loading state
  if (userLoading) {
    return (
      <Container flex={1} padding="lg">
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container>
      <Container marginBottom="lg">
        <Text variant="body2" color="secondary" marginBottom="lg">
          {t(description)}
        </Text>
      </Container>

      {/* Avatar Picker */}
      <Container alignItems="center" marginBottom="lg">
        <AvatarPicker value={avatar} onChange={setAvatar} size={100} />
      </Container>

      {/* Form Fields */}
      <FormField
        label={t("features.profile.personalInfoForm.firstName")}
        value={firstName}
        onChangeText={setFirstName}
        placeholder={t("features.profile.personalInfoForm.firstName")}
      />

      <FormField
        label={t("features.profile.personalInfoForm.lastName")}
        value={lastName}
        onChangeText={setLastName}
        placeholder={t("features.profile.personalInfoForm.lastName")}
      />

      <FormField
        label={t("features.profile.personalInfoForm.phone")}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder={t("features.profile.personalInfoForm.phone")}
        keyboardType="phone-pad"
      />

      <FormField
        label={t("features.profile.personalInfoForm.city")}
        value={city}
        onChangeText={setCity}
        placeholder={t("features.profile.personalInfoForm.city")}
      />

      <FormField
        label={t("features.profile.personalInfoForm.country")}
        value={country}
        onChangeText={setCountry}
        placeholder={t("features.profile.personalInfoForm.country")}
      />

      {/* Save Button */}
      <Container marginTop="md">
        <Button
          title={t("common.save")}
          onPress={handleSave}
          variant="primary"
          loading={updateProfileMutation.isPending}
        />
      </Container>
    </Container>
  );
};
