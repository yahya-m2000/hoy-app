import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { PropertyFormData } from "@core/types";

interface ImagesStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  updateNestedFormData: (
    field: keyof PropertyFormData,
    nestedField: string,
    value: any
  ) => void;
  errors: Record<string, string>;
  isEditMode: boolean;
}

export default function ImagesStep({
  formData,
  updateFormData,
  errors,
}: ImagesStepProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera roll permissions to upload property photos.",
        [{ text: "OK" }]
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

        // For now, we'll just add the local URIs to the form data
        // In a real implementation, you would upload these to your server first
        const newImages = result.assets.map((asset) => asset.uri);
        const updatedImages = [...formData.images, ...newImages];
        updateFormData("images", updatedImages);

        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to take photos.",
        [{ text: "OK" }]
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
        const updatedImages = [...formData.images, newImage];
        updateFormData("images", updatedImages);

        setUploading(false);
      }
    } catch {
      setUploading(false);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    updateFormData("images", updatedImages);
  };

  const showImageOptions = () => {
    Alert.alert("Add Photos", "Choose how you want to add photos", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImages },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Property Photos</Text>
      <Text style={styles.stepSubtitle}>
        Add high-quality photos to showcase your property. The first photo will
        be your main listing photo.
      </Text>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={showImageOptions}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Ionicons name="camera" size={32} color="#007AFF" />
        )}
        <Text style={styles.uploadButtonText}>
          {uploading ? "Adding Photos..." : "Add Photos"}
        </Text>
        <Text style={styles.uploadButtonSubtext}>
          Choose from library or take a photo
        </Text>
      </TouchableOpacity>

      {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}

      {/* Image Grid */}
      {formData.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Text style={styles.imagesTitle}>
            {formData.images.length} photo
            {formData.images.length !== 1 ? "s" : ""} added
          </Text>

          <View style={styles.imageGrid}>
            {formData.images.map((imageUri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />

                {/* Main photo badge */}
                {index === 0 && (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoText}>Main</Text>
                  </View>
                )}

                {/* Remove button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tips */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Photo Tips</Text>
        <Text style={styles.infoText}>
          • Take photos in good lighting{"\n"}• Show different angles and rooms
          {"\n"}• Include exterior and interior shots{"\n"}• First photo should
          be your best shot{"\n"}• Minimum 1 photo required, 10+ recommended
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    lineHeight: 22,
  },
  uploadButton: {
    backgroundColor: "#f0f8ff",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  imagesContainer: {
    marginBottom: 24,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    position: "relative",
    width: "48%",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  mainPhotoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainPhotoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  infoBox: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
