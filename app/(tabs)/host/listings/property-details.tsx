import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProperty } from "./hooks/useProperties";
import LoadingState from "./components/LoadingState";

export default function PropertyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { property, loading, error } = useProperty(id!);

  const handleEdit = () => {
    if (property) {
      router.push({
        pathname: "/(tabs)/host/listings/add-property",
        params: {
          mode: "edit",
          propertyId: property._id,
        },
      });
    }
  };
  if (loading) {
    return <LoadingState />;
  }

  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Property not found</Text>
        <Text style={styles.errorMessage}>
          {error || "The property you're looking for could not be found."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryImage = property.images?.[0];
  const address = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.postalCode}`;
  return (
    <ScrollView style={styles.container}>
      {/* Property Image */}
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={64} color="#999" />
          </View>
        )}

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            property.isActive ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              property.isActive ? styles.activeText : styles.inactiveText,
            ]}
          >
            {property.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
      {/* Property Information */}
      <View style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.propertyType}>
            {property.propertyType.charAt(0).toUpperCase() +
              property.propertyType.slice(1)}
          </Text>
          <Text style={styles.address}>{address}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="bed-outline" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>Bedrooms</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="water-outline" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>Bathrooms</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{property.maxGuests}</Text>
            <Text style={styles.statLabel}>Max Guests</Text>
          </View>
          {property.rating > 0 && (
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{property.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Price per night</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {property.currency} {property.price}
            </Text>
          </View>
        </View>

        {/* Description */}
        {property.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{property.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Beds:</Text>
              <Text style={styles.detailValue}>{property.beds}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Review Count:</Text>
              <Text style={styles.detailValue}>{property.reviewCount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Featured:</Text>
              <Text style={styles.detailValue}>
                {property.isFeatured ? "Yes" : "No"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Property</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: "#d4edda",
  },
  inactiveBadge: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeText: {
    color: "#155724",
  },
  inactiveText: {
    color: "#721c24",
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  propertyName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  priceSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: "#007AFF",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
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
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: "#333",
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
