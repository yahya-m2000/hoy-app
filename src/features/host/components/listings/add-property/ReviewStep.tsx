import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PropertyFormData } from "@core/types";

interface ReviewStepProps {
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

export default function ReviewStep({ formData, isEditMode }: ReviewStepProps) {
  const address = `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.postalCode}, ${formData.address.country}`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>
        Please review your property details before{" "}
        {isEditMode ? "updating" : "creating"} your listing.
      </Text>

      {/* Property Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property Overview</Text>

        <View style={styles.overviewCard}>
          {formData.images.length > 0 && (
            <Image
              source={{ uri: formData.images[0] }}
              style={styles.previewImage}
            />
          )}

          <View style={styles.overviewContent}>
            <Text style={styles.propertyName}>{formData.name}</Text>
            <Text style={styles.propertyType}>
              {formData.propertyType.charAt(0).toUpperCase() +
                formData.propertyType.slice(1)}{" "}
              • {formData.type}
            </Text>
            <Text style={styles.propertyAddress}>{address}</Text>

            <View style={styles.propertyStats}>
              <View style={styles.stat}>
                <Ionicons name="bed-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  {formData.bedrooms} bed{formData.bedrooms !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="water-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  {formData.bathrooms} bath{formData.bathrooms !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={16} color="#666" />
                <Text style={styles.statText}>
                  {formData.maxGuests} guest
                  {formData.maxGuests !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>${formData.price}</Text>
              <Text style={styles.priceUnit}>/ night</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{formData.description}</Text>
      </View>

      {/* Amenities */}
      {formData.amenities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Amenities ({formData.amenities.length})
          </Text>
          <View style={styles.amenitiesContainer}>
            {formData.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Photos */}
      {formData.images.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Photos ({formData.images.length})
          </Text>
          <View style={styles.photosGrid}>
            {formData.images.slice(0, 6).map((imageUri, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: imageUri }} style={styles.photo} />
                {index === 0 && (
                  <View style={styles.mainPhotoBadge}>
                    <Text style={styles.mainPhotoText}>Main</Text>
                  </View>
                )}
              </View>
            ))}
            {formData.images.length > 6 && (
              <View style={styles.morePhotos}>
                <Text style={styles.morePhotosText}>
                  +{formData.images.length - 6} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>
          Ready to {isEditMode ? "update" : "publish"}?
        </Text>
        <Text style={styles.summaryText}>
          {isEditMode
            ? "Your property listing will be updated with the new information."
            : "Your property will be reviewed and published within 24 hours. You can edit these details anytime after publishing."}
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
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  overviewCard: {
    flexDirection: "row",
    gap: 16,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  overviewContent: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  propertyStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  priceUnit: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityTag: {
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoContainer: {
    position: "relative",
    width: "32%",
  },
  photo: {
    width: "100%",
    height: 60,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  mainPhotoBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mainPhotoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  morePhotos: {
    width: "32%",
    height: 60,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  morePhotosText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  summarySection: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
});
