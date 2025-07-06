import React, { useState } from "react";
import {
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Container, Text, Icon } from "@shared/components";
import * as ImagePicker from "expo-image-picker";
import { PropertyFormData } from "@core/types";
import { spacing, iconSize, radius } from "@core/design";
import { useTheme } from "@core/hooks";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";

interface ImagesStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
}

// Image Item Component
const ImageItem = ({
  imageUri,
  index,
  isMain,
  onRemove,
}: {
  imageUri: string;
  index: number;
  isMain: boolean;
  onRemove: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <Container flex={1} marginBottom="sm" style={{ position: "relative" }}>
      <Image
        source={{ uri: imageUri }}
        style={{
          width: "100%",
          height: 120,
          borderRadius: radius.md,
          backgroundColor: theme.border,
        }}
        resizeMode="cover"
      />

      {/* Main photo badge */}
      {isMain && (
        <Container
          style={{
            position: "absolute",
            top: spacing.xs,
            left: spacing.xs,
          }}
          paddingHorizontal="sm"
          paddingVertical="xs"
          borderRadius="md"
          backgroundColor="success"
        >
          <Text variant="caption" weight="semibold" color="white">
            Main
          </Text>
        </Container>
      )}

      {/* Remove button */}
      <TouchableOpacity
        onPress={onRemove}
        style={{
          position: "absolute",
          top: spacing.xs,
          right: spacing.xs,
          backgroundColor: theme.background,
          borderRadius: radius.circle,
          padding: spacing.xs,
        }}
      >
        <Icon name="close-circle" size={iconSize.md} color={theme.error} />
      </TouchableOpacity>
    </Container>
  );
};

// Upload Button Component
const UploadButton = ({
  onPress,
  uploading,
}: {
  onPress: () => void;
  uploading: boolean;
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress} disabled={uploading}>
      <Container
        padding="xl"
        alignItems="center"
        justifyContent="center"
        borderWidth={2}
        borderColor={theme.primary}
        borderRadius="lg"
        backgroundColor={theme.primaryLight}
        marginBottom="lg"
        style={{
          minHeight: 120,
          borderStyle: "dashed",
        }}
      >
        {uploading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <>
            <Icon
              name="camera-outline"
              size={iconSize.xl}
              color={theme.primary}
            />
            <Container marginTop="md" alignItems="center">
              <Text
                variant="h6"
                weight="semibold"
                color="primary"
                align="center"
              >
                {t("property.images.addPhotos")}
              </Text>
              <Text
                variant="body"
                color="secondary"
                align="center"
                style={{ marginTop: spacing.xs }}
              >
                {t("property.images.chooseFromLibrary")}
              </Text>
            </Container>
          </>
        )}
      </Container>
    </TouchableOpacity>
  );
};

export default function ImagesStep({
  formData,
  updateFormData,
}: ImagesStepProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("property.images.permissionRequired"),
        t("property.images.cameraRollPermission"),
        [{ text: t("common.ok") }]
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        setUploading(true);
        const newImages = result.assets.map((asset) => asset.uri);
        const updatedImages = [...(formData.images || []), ...newImages];
        updateFormData("images", updatedImages);
        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert(t("common.error"), t("property.images.pickError"));
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        t("property.images.permissionRequired"),
        t("property.images.cameraPermission"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [16, 9],
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setUploading(true);
        const newImage = result.assets[0].uri;
        const updatedImages = [...(formData.images || []), newImage];
        updateFormData("images", updatedImages);
        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert(t("common.error"), t("property.images.cameraError"));
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index);
    updateFormData("images", updatedImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      t("property.images.addPhotos"),
      t("property.images.chooseMethod"),
      [
        { text: t("property.images.camera"), onPress: takePhoto },
        { text: t("property.images.photoLibrary"), onPress: pickImages },
        { text: t("common.cancel"), style: "cancel" },
      ]
    );
  };

  const images = formData.images || [];
  const chunkedImages = images.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push({ uri: item, index });
    return resultArray;
  }, [] as Array<{ uri: string; index: number }>[]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Container paddingBottom="xxl">
        <StepHeader
          title={t("property.images.title")}
          description={t("property.images.description")}
        />

        <UploadButton onPress={showImageOptions} uploading={uploading} />

        {/* Image Grid */}
        {images.length > 0 && (
          <Container marginBottom="lg">
            <Container marginBottom="md">
              <Text variant="h6" weight="semibold" color="primary">
                {t("property.images.photosAdded", { count: images.length })}
              </Text>
            </Container>

            <Container>
              {chunkedImages.map((imagePair, rowIndex) => (
                <Container
                  key={rowIndex}
                  flexDirection="row"
                  marginBottom="sm"
                  style={{ gap: spacing.sm }}
                >
                  {imagePair.map(({ uri, index }) => (
                    <ImageItem
                      key={index}
                      imageUri={uri}
                      index={index}
                      isMain={index === 0}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                  {imagePair.length === 1 && (
                    <Container flex={1}>
                      <></>
                    </Container>
                  )}
                </Container>
              ))}
            </Container>
          </Container>
        )}

        <InfoBox
          title={t("property.images.tipTitle")}
          content={t("property.images.tipContent")}
          icon="bulb-outline"
          variant="tip"
        />
      </Container>
    </ScrollView>
  );
}
