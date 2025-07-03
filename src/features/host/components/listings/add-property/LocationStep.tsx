import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { PropertyFormData } from "@core/types";

interface LocationStepProps {
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

export default function LocationStep({
  formData,
  updateNestedFormData,
  errors,
}: LocationStepProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Property Location</Text>
      <Text style={styles.stepSubtitle}>
        Where is your property located? This helps guests find you.
      </Text>
      {/* Street Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={[styles.input, errors["address.street"] && styles.inputError]}
          value={formData.address.street}
          onChangeText={(value) =>
            updateNestedFormData("address", "street", value)
          }
          placeholder="Enter street address"
          placeholderTextColor="#999"
        />
        {errors["address.street"] && (
          <Text style={styles.errorText}>{errors["address.street"]}</Text>
        )}
      </View>
      {/* City */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={[styles.input, errors["address.city"] && styles.inputError]}
          value={formData.address.city}
          onChangeText={(value) =>
            updateNestedFormData("address", "city", value)
          }
          placeholder="Enter city"
          placeholderTextColor="#999"
        />
        {errors["address.city"] && (
          <Text style={styles.errorText}>{errors["address.city"]}</Text>
        )}
      </View>
      {/* State and Postal Code Row */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={[styles.input, errors["address.state"] && styles.inputError]}
            value={formData.address.state}
            onChangeText={(value) =>
              updateNestedFormData("address", "state", value)
            }
            placeholder="State"
            placeholderTextColor="#999"
          />
          {errors["address.state"] && (
            <Text style={styles.errorText}>{errors["address.state"]}</Text>
          )}
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.label}>Postal Code *</Text>
          <TextInput
            style={[
              styles.input,
              errors["address.postalCode"] && styles.inputError,
            ]}
            value={formData.address.postalCode}
            onChangeText={(value) =>
              updateNestedFormData("address", "postalCode", value)
            }
            placeholder="12345"
            placeholderTextColor="#999"
          />
          {errors["address.postalCode"] && (
            <Text style={styles.errorText}>{errors["address.postalCode"]}</Text>
          )}
        </View>
      </View>
      {/* Country */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={[styles.input, errors["address.country"] && styles.inputError]}
          value={formData.address.country}
          onChangeText={(value) =>
            updateNestedFormData("address", "country", value)
          }
          placeholder="Enter country"
          placeholderTextColor="#999"
        />
        {errors["address.country"] && (
          <Text style={styles.errorText}>{errors["address.country"]}</Text>
        )}
      </View>
      {/* Coordinates Section */}
      <View style={styles.coordinatesSection}>
        <Text style={styles.sectionTitle}>Coordinates (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          You can provide exact coordinates to improve location accuracy.
        </Text>

        <View style={styles.coordinatesRow}>
          {/* Latitude */}
          <View style={styles.coordinateInput}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={[
                styles.input,
                errors["coordinates.latitude"] && styles.inputError,
              ]}
              value={formData.coordinates?.latitude?.toString() || ""}
              onChangeText={(value) =>
                updateNestedFormData(
                  "coordinates",
                  "latitude",
                  parseFloat(value) || 0
                )
              }
              placeholder="0.000000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors["coordinates.latitude"] && (
              <Text style={styles.errorText}>
                {errors["coordinates.latitude"]}
              </Text>
            )}
          </View>

          {/* Longitude */}
          <View style={styles.coordinateInput}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={[
                styles.input,
                errors["coordinates.longitude"] && styles.inputError,
              ]}
              value={formData.coordinates?.longitude?.toString() || ""}
              onChangeText={(value) =>
                updateNestedFormData(
                  "coordinates",
                  "longitude",
                  parseFloat(value) || 0
                )
              }
              placeholder="0.000000"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            {errors["coordinates.longitude"] && (
              <Text style={styles.errorText}>
                {errors["coordinates.longitude"]}
              </Text>
            )}
          </View>
        </View>
      </View>
      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Privacy Note</Text>
        <Text style={styles.infoText}>
          Your exact address will only be shared with confirmed guests. A
          general area will be shown to guests browsing properties.
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
  inputGroup: {
    marginBottom: 24,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
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
  coordinatesSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  coordinatesRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
});
