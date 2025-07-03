import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PropertyFormData } from "@core/types";

interface DetailsStepProps {
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

export default function DetailsStep({
  formData,
  updateFormData,
  errors,
}: DetailsStepProps) {
  const incrementValue = (field: keyof PropertyFormData) => {
    const currentValue = formData[field] as number;
    updateFormData(field, currentValue + 1);
  };

  const decrementValue = (field: keyof PropertyFormData, minValue = 0) => {
    const currentValue = formData[field] as number;
    if (currentValue > minValue) {
      updateFormData(field, currentValue - 1);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Property Details</Text>
      <Text style={styles.stepSubtitle}>
        Tell us about the specifics of your property
      </Text>

      {/* Price */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price per Night *</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[styles.priceInput, errors.price && styles.inputError]}
            value={formData.price.toString()}
            onChangeText={(value) => {
              const numValue = parseFloat(value) || 0;
              updateFormData("price", numValue);
            }}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <Text style={styles.currencyCode}>{formData.currency}</Text>
        </View>
        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
      </View>

      {/* Bedrooms */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bedrooms</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => decrementValue("bedrooms")}
          >
            <Ionicons name="remove" size={20} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.bedrooms}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => incrementValue("bedrooms")}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {errors.bedrooms && (
          <Text style={styles.errorText}>{errors.bedrooms}</Text>
        )}
      </View>

      {/* Beds */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Beds *</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => decrementValue("beds", 1)}
          >
            <Ionicons name="remove" size={20} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.beds}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => incrementValue("beds")}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {errors.beds && <Text style={styles.errorText}>{errors.beds}</Text>}
      </View>

      {/* Bathrooms */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bathrooms *</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => decrementValue("bathrooms", 1)}
          >
            <Ionicons name="remove" size={20} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.bathrooms}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => incrementValue("bathrooms")}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {errors.bathrooms && (
          <Text style={styles.errorText}>{errors.bathrooms}</Text>
        )}
      </View>

      {/* Max Guests */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maximum Guests *</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => decrementValue("maxGuests", 1)}
          >
            <Ionicons name="remove" size={20} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{formData.maxGuests}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => incrementValue("maxGuests")}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {errors.maxGuests && (
          <Text style={styles.errorText}>{errors.maxGuests}</Text>
        )}
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Pricing Tips</Text>
        <Text style={styles.infoText}>
          Research similar properties in your area to set competitive pricing.
          You can always adjust your rates later based on demand.
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingLeft: 16,
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  currencyCode: {
    fontSize: 14,
    color: "#666",
    paddingRight: 16,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
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
});
