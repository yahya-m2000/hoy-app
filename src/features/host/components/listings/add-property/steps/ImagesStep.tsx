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
import { UploadService } from "@core/api/services";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";

interface ImagesStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  /** Property ID for organizing uploads (optional, for existing properties) */
  propertyId?: string;
}

// Image Item Component
const ImageItem = ({
  imageUri,
  index,
  isMain,
  onRemove,
  uploading = false,
}: {
  imageUri: string;
  index: number;
  isMain: boolean;
  onRemove: () => void;
  uploading?: boolean;
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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

      {/* Upload overlay */}
      {uploading && (
        <Container
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="small" color="#fff" />
        </Container>
      )}

      {/* Main photo badge */}
      {isMain && !uploading && (
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
            {t("property.images.main")}
          </Text>
        </Container>
      )}

      {/* Remove button */}
      {!uploading && (
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
      )}
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
  propertyId,
}: ImagesStepProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("property.permissionRequired"),
        t("property.cameraRollPermission"),
        [{ text: t("common.ok") }]
      );
      return false;
    }
    return true;
  };

  const uploadImagesToB2 = async (imageUris: string[]): Promise<string[]> => {
    if (!propertyId) {
      // For new properties, use local URIs until property is created
      return imageUris;
    }

    try {
      const images = imageUris.map((uri, index) => ({
        uri,
        type: "image/jpeg",
        name: `property_${propertyId}_${index + 1}.jpg`,
      }));

      const uploadResult = await UploadService.uploadPropertyImages(
        propertyId,
        images,
        (progress) => {
          // Progress tracking could be implemented here
          console.log(`Upload progress: ${progress}%`);
        }
      );

      return uploadResult.data.images.map((img) => img.imageUrl);
    } catch (error) {
      console.error("Property image upload error", error);
      throw new Error(t("property.uploadError"));
    }
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
        const newImageUris = result.assets.map((asset) => asset.uri);
        const currentImages = formData.images || [];

        // Add new images to the list first (as local URIs)
        const updatedImages = [...currentImages, ...newImageUris];
        updateFormData("images", updatedImages);

        // Upload to B2 if property exists
        if (propertyId) {
          try {
            const uploadedUrls = await uploadImagesToB2(newImageUris);
            const finalImages = [...currentImages, ...uploadedUrls];
            updateFormData("images", finalImages);
          } catch (uploadError) {
            // Keep local URIs if upload fails
            console.error("Upload failed, keeping local URIs", uploadError);
          }
        }

        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert(t("common.error"), t("property.pickError"));
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        t("property.permissionRequired"),
        t("property.cameraPermission"),
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
        const newImageUri = result.assets[0].uri;
        const currentImages = formData.images || [];
        const updatedImages = [...currentImages, newImageUri];
        updateFormData("images", updatedImages);

        // Upload to B2 if property exists
        if (propertyId) {
          try {
            const uploadedUrls = await uploadImagesToB2([newImageUri]);
            const finalImages = [...currentImages, ...uploadedUrls];
            updateFormData("images", finalImages);
          } catch (uploadError) {
            // Keep local URI if upload fails
            console.error("Upload failed, keeping local URI", uploadError);
          }
        }

        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert(t("common.error"), t("property.cameraError"));
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
          title={t("property.steps.images.title")}
          description={t("property.steps.images.description")}
        />

        <UploadButton onPress={showImageOptions} uploading={uploading} />

        {/* Image Grid */}
        {images.length > 0 && (
          <Container marginBottom="lg">
            <Container marginBottom="md">
              <Text variant="h6" weight="semibold" color="primary">
                {t("property.photosAdded", { count: images.length })}
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
                      uploading={uploadingImages.has(index)}
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
          title={t("property.steps.images.tipTitle")}
          content={t("property.steps.images.tipContent")}
          icon="bulb-outline"
          variant="tip"
        />
      </Container>
    </ScrollView>
  );
}
