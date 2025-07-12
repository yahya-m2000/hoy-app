import React, { useState } from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Container, Text } from "@shared/components";
import { useToast } from "@core/context";
import { useTranslation } from "react-i18next";
import { UploadService } from "@core/api/services";

interface AvatarPickerProps {
  /** Currently selected image URI */
  value: string | null;
  /** Callback invoked when a new image is selected */
  onChange: (uri: string | null) => void;
  /** Avatar diameter in pixels (default 100) */
  size?: number;
  /** Whether to upload to B2 storage (default true) */
  uploadToStorage?: boolean;
  /** User ID for organizing uploads (required if uploadToStorage is true) */
  userId?: string;
}

/**
 * Reusable avatar picker component that allows the user to pick an image from
 * their library and uploads it to B2 storage before returning the URL.
 * Wraps the Expo ImagePicker flow and provides graceful fallback UX.
 */
const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  size = 100,
  uploadToStorage = true,
  userId,
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
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
        const imageUri = result.assets[0].uri;

        if (uploadToStorage && userId) {
          // Upload to B2 storage
          setUploading(true);
          try {
            const uploadResult = await UploadService.uploadProfileImage(
              imageUri
            );
            onChange(uploadResult.data.imageUrl);
            showToast({
              type: "success",
              message: t("upload.profileImageSuccess"),
            });
          } catch (uploadError: any) {
            console.error("Avatar upload error", uploadError);
            showToast({
              type: "error",
              message: uploadError.message || t("upload.profileImageError"),
            });
          } finally {
            setUploading(false);
          }
        } else {
          // Use local URI directly (fallback)
          onChange(imageUri);
        }
      }
    } catch (error) {
      console.error("AvatarPicker error", error);
      showToast({ type: "error", message: t("errors.generic") });
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={uploading}
      style={{ alignSelf: "center" }}
    >
      {value ? (
        <Container style={{ position: "relative" }}>
          <Image
            source={{ uri: value }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
          {uploading && (
            <Container
              style={[
                styles.uploadOverlay,
                { width: size, height: size, borderRadius: size / 2 },
              ]}
              alignItems="center"
              justifyContent="center"
            >
              <ActivityIndicator size="small" color="#fff" />
            </Container>
          )}
        </Container>
      ) : (
        <Container
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          alignItems="center"
          justifyContent="center"
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text variant="caption" color="secondary">
              {t("auth.avatar.selectPhoto")}
            </Text>
          )}
        </Container>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#ccc",
    borderStyle: "dashed",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default AvatarPicker;
