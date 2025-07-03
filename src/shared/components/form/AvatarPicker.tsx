import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Container, Text } from "@shared/components";
import { useToast } from "@core/context";
import { useTranslation } from "react-i18next";

interface AvatarPickerProps {
  /** Currently selected image URI */
  value: string | null;
  /** Callback invoked when a new image is selected */
  onChange: (uri: string | null) => void;
  /** Avatar diameter in pixels (default 100) */
  size?: number;
}

/**
 * Reusable avatar picker component that allows the user to pick an image from
 * their library and returns its URI. Wraps the Expo ImagePicker flow and
 * provides graceful fallback UX.
 */
const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  size = 100,
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation();

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
        onChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("AvatarPicker error", error);
      showToast({ type: "error", message: t("errors.generic") });
    }
  };

  return (
    <TouchableOpacity onPress={pickImage} style={{ alignSelf: "center" }}>
      {value ? (
        <Image
          source={{ uri: value }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Container
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="caption" color="secondary">
            {t("auth.avatar.selectPhoto")}
          </Text>
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
});

export default AvatarPicker;
