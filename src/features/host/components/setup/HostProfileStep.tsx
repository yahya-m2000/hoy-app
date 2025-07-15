/**
 * Host Profile Step Component
 * Handles bio, photo upload, and profile completion in the host setup flow
 * Following Airbnb's profile setup pattern with photo upload and bio editing
 */

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { Container, Text, Button, Icon, Input } from "@shared/components";
import { spacing, radius } from "@core/design";
import type { HostProfile } from "@core/types/host.types";
import * as ImagePicker from "expo-image-picker";

interface HostProfileStepProps {
  data: Partial<HostProfile>;
  errors: Record<string, string>;
  onChange: (data: Partial<HostProfile>) => void;
}

interface ProfileSectionProps {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  isRequired?: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
  isRequired = false,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Container
      backgroundColor="surface"
      borderRadius="lg"
      padding="lg"
      marginBottom="lg"
      borderWidth={1}
      borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      style={styles.profileSection}
    >
      <Container flexDirection="row" alignItems="center" marginBottom="md">
        <Container
          width={48}
          height={48}
          borderRadius="md"
          backgroundColor={
            isDark ? theme.colors.gray[800] : theme.colors.gray[100]
          }
          justifyContent="center"
          alignItems="center"
          marginRight="md"
        >
          <Icon name={icon as any} size={24} color={theme.colors.primary} />
        </Container>

        <Container flex={1}>
          <Container flexDirection="row" alignItems="center" marginBottom="xs">
            <Text variant="h3" color="primary" style={{ flex: 1 }}>
              {title}
            </Text>
            {isRequired && (
              <Container
                backgroundColor={theme.colors.error}
                borderRadius="sm"
                paddingHorizontal="sm"
                paddingVertical="xs"
              >
                <Text variant="caption" color="white" style={{ fontSize: 10 }}>
                  {t("common.required")}
                </Text>
              </Container>
            )}
          </Container>
          <Text variant="body" color="secondary" style={{ lineHeight: 18 }}>
            {subtitle}
          </Text>
        </Container>
      </Container>

      {children}
    </Container>
  );
};

interface PhotoUploadProps {
  photoUri?: string;
  onPhotoChange: (uri: string) => void;
  onPhotoRemove: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photoUri,
  onPhotoChange,
  onPhotoRemove,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.error"),
        t("host.profile.photo.permissionRequired")
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("host.profile.photo.uploadError"));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.error"),
        t("host.profile.photo.cameraPermissionRequired")
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("host.profile.photo.cameraError"));
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      t("host.profile.photo.selectPhoto"),
      t("host.profile.photo.selectPhotoDescription"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("host.profile.photo.camera"), onPress: takePhoto },
        { text: t("host.profile.photo.library"), onPress: pickImage },
      ]
    );
  };

  return (
    <Container alignItems="center">
      <TouchableOpacity onPress={showImagePicker} style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.profilePhoto} />
        ) : (
          <Container
            width={120}
            height={120}
            borderRadius="circle"
            backgroundColor={
              isDark ? theme.colors.gray[800] : theme.colors.gray[100]
            }
            justifyContent="center"
            alignItems="center"
            borderWidth={2}
            borderColor={
              isDark ? theme.colors.gray[600] : theme.colors.gray[300]
            }
            style={{ borderStyle: "dashed" }}
          >
            <Icon
              name="camera-outline"
              size={32}
              color={theme.colors.gray[500]}
            />
          </Container>
        )}

        <Container
          position="absolute"
          bottom={0}
          right={0}
          width={32}
          height={32}
          borderRadius="circle"
          backgroundColor={theme.colors.primary}
          justifyContent="center"
          alignItems="center"
          borderWidth={2}
          borderColor="white"
        >
          <Icon name="camera" size={16} color="white" />
        </Container>
      </TouchableOpacity>

      <Container marginTop="md" alignItems="center">
        <Button
          title={
            photoUri
              ? t("host.profile.photo.change")
              : t("host.profile.photo.add")
          }
          variant="outline"
          size="small"
          onPress={showImagePicker}
          style={{ marginBottom: 8 }}
        />

        {photoUri && (
          <Button
            title={t("host.profile.photo.remove")}
            variant="ghost"
            size="small"
            onPress={onPhotoRemove}
          />
        )}
      </Container>
    </Container>
  );
};

interface InterestChipProps {
  interest: string;
  isSelected: boolean;
  onToggle: () => void;
}

const InterestChip: React.FC<InterestChipProps> = ({
  interest,
  isSelected,
  onToggle,
}) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.interestChip,
        {
          backgroundColor: isSelected
            ? theme.colors.primary
            : isDark
            ? theme.colors.gray[800]
            : theme.colors.gray[100],
          borderColor: isSelected
            ? theme.colors.primary
            : isDark
            ? theme.colors.gray[700]
            : theme.colors.gray[300],
        },
      ]}
    >
      <Text
        variant="body"
        color={isSelected ? "white" : "primary"}
        style={{ fontSize: 14 }}
      >
        {interest}
      </Text>
    </TouchableOpacity>
  );
};

export const HostProfileStep: React.FC<HostProfileStepProps> = ({
  data,
  errors,
  onChange,
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const handleProfileChange = (field: keyof HostProfile, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = data.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i) => i !== interest)
      : [...currentInterests, interest];

    handleProfileChange("interests", updatedInterests);
  };

  const availableInterests = [
    t("host.profile.interests.travel"),
    t("host.profile.interests.food"),
    t("host.profile.interests.music"),
    t("host.profile.interests.art"),
    t("host.profile.interests.sports"),
    t("host.profile.interests.nature"),
    t("host.profile.interests.photography"),
    t("host.profile.interests.reading"),
    t("host.profile.interests.cooking"),
    t("host.profile.interests.history"),
    t("host.profile.interests.culture"),
    t("host.profile.interests.business"),
  ];

  const bioWordCount = (data.bio || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const maxWords = 150;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Container paddingHorizontal="lg" paddingVertical="md">
        <Text variant="h2" color="primary" marginBottom="sm">
          {t("host.profile.title")}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="xl"
          style={{ lineHeight: 22 }}
        >
          {t("host.profile.subtitle")}
        </Text>

        {/* Profile Photo */}
        <ProfileSection
          title={t("host.profile.photo.title")}
          subtitle={t("host.profile.photo.subtitle")}
          icon="person-circle-outline"
        >
          <PhotoUpload
            photoUri={data.photo}
            onPhotoChange={(uri) => handleProfileChange("photo", uri)}
            onPhotoRemove={() => handleProfileChange("photo", undefined)}
          />
        </ProfileSection>

        {/* Bio */}
        <ProfileSection
          title={t("host.profile.bio.title")}
          subtitle={t("host.profile.bio.subtitle")}
          icon="document-text-outline"
          isRequired={true}
        >
          <Container>
            <Input
              value={data.bio || ""}
              onChangeText={(value) => handleProfileChange("bio", value)}
              placeholder={t("host.profile.bio.placeholder")}
              multiline
              numberOfLines={6}
              error={errors.bio}
              style={{ minHeight: 120 }}
            />

            <Container
              flexDirection="row"
              justifyContent="space-between"
              marginTop="sm"
            >
              <Text variant="caption" color="secondary">
                {t("host.profile.bio.tips")}
              </Text>
              <Text
                variant="caption"
                color={bioWordCount > maxWords ? "error" : "secondary"}
              >
                {bioWordCount}/{maxWords} {t("host.profile.bio.words")}
              </Text>
            </Container>
          </Container>
        </ProfileSection>

        {/* Location & Occupation */}
        <ProfileSection
          title={t("host.profile.details.title")}
          subtitle={t("host.profile.details.subtitle")}
          icon="location-outline"
        >
          <Container style={{ gap: spacing.md }}>
            <Input
              label={t("host.profile.details.location")}
              value={data.location || ""}
              onChangeText={(value) => handleProfileChange("location", value)}
              placeholder={t("host.profile.details.locationPlaceholder")}
              error={errors.location}
            />

            <Input
              label={t("host.profile.details.occupation")}
              value={data.occupation || ""}
              onChangeText={(value) => handleProfileChange("occupation", value)}
              placeholder={t("host.profile.details.occupationPlaceholder")}
              error={errors.occupation}
            />
          </Container>
        </ProfileSection>

        {/* Interests */}
        <ProfileSection
          title={t("host.profile.interests.title")}
          subtitle={t("host.profile.interests.subtitle")}
          icon="heart-outline"
        >
          <Container
            flexDirection="row"
            flexWrap="wrap"
            style={{ gap: spacing.sm }}
          >
            {availableInterests.map((interest) => (
              <InterestChip
                key={interest}
                interest={interest}
                isSelected={(data.interests || []).includes(interest)}
                onToggle={() => handleInterestToggle(interest)}
              />
            ))}
          </Container>
        </ProfileSection>

        {/* Profile Preview */}
        <Container
          backgroundColor="surface"
          borderRadius="lg"
          padding="lg"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container flexDirection="row" alignItems="center" marginBottom="md">
            <Icon name="eye-outline" size={20} color={theme.colors.primary} />
            <Text variant="h3" color="primary" marginLeft="sm">
              {t("host.profile.preview.title")}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            alignItems="flex-start"
            marginBottom="md"
          >
            <Container
              width={60}
              height={60}
              borderRadius="circle"
              backgroundColor={
                isDark ? theme.colors.gray[800] : theme.colors.gray[100]
              }
              justifyContent="center"
              alignItems="center"
              marginRight="md"
            >
              {data.photo ? (
                <Image
                  source={{ uri: data.photo }}
                  style={styles.previewPhoto}
                />
              ) : (
                <Icon name="person" size={24} color={theme.colors.gray[500]} />
              )}
            </Container>

            <Container flex={1}>
              <Text variant="h3" color="primary" marginBottom="xs">
                {t("host.profile.preview.hostName")}
              </Text>
              {data.location && (
                <Text variant="body" color="secondary" marginBottom="xs">
                  {data.location}
                </Text>
              )}
              {data.occupation && (
                <Text variant="body" color="secondary">
                  {data.occupation}
                </Text>
              )}
            </Container>
          </Container>

          {data.bio && (
            <Container marginBottom="md">
              <Text variant="body" color="primary" style={{ lineHeight: 20 }}>
                {data.bio}
              </Text>
            </Container>
          )}

          {data.interests && data.interests.length > 0 && (
            <Container>
              <Text variant="subtitle" color="primary" marginBottom="sm">
                {t("host.profile.preview.interests")}
              </Text>
              <Container
                flexDirection="row"
                flexWrap="wrap"
                style={{ gap: spacing.xs }}
              >
                {data.interests.slice(0, 6).map((interest) => (
                  <Container
                    key={interest}
                    backgroundColor={
                      isDark ? theme.colors.gray[800] : theme.colors.gray[100]
                    }
                    borderRadius="sm"
                    paddingHorizontal="sm"
                    paddingVertical="xs"
                  >
                    <Text variant="caption" color="secondary">
                      {interest}
                    </Text>
                  </Container>
                ))}
                {data.interests.length > 6 && (
                  <Container
                    backgroundColor={
                      isDark ? theme.colors.gray[800] : theme.colors.gray[100]
                    }
                    borderRadius="sm"
                    paddingHorizontal="sm"
                    paddingVertical="xs"
                  >
                    <Text variant="caption" color="secondary">
                      +{data.interests.length - 6}{" "}
                      {t("host.profile.preview.more")}
                    </Text>
                  </Container>
                )}
              </Container>
            </Container>
          )}
        </Container>

        {/* Tips */}
        <Container
          backgroundColor={
            isDark ? theme.colors.gray[800] : theme.colors.gray[50]
          }
          borderRadius="md"
          padding="md"
          marginTop="lg"
          borderWidth={1}
          borderColor={theme.colors.gray[200]}
        >
          <Container flexDirection="row" alignItems="center" marginBottom="sm">
            <Icon
              name="lightbulb-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text variant="subtitle" color="primary" marginLeft="sm">
              {t("host.profile.tips.title")}
            </Text>
          </Container>
          <Text variant="body" color="secondary" style={{ lineHeight: 20 }}>
            {t("host.profile.tips.description")}
          </Text>
        </Container>
      </Container>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoContainer: {
    position: "relative",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  previewPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  interestChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
