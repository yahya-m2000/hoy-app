import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { PropertyFormData, PROPERTY_TYPES } from "@core/types";
import SelectInput from "../SelectInput";

interface BasicInfoStepProps {
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

export default function BasicInfoStep({
  formData,
  updateFormData,
  errors,
}: BasicInfoStepProps) {
  const propertyTypeOptions = PROPERTY_TYPES.map((type) => ({
    label: type.label,
    value: type.value,
  }));

  const typeOptions = [
    { label: "Individual Property", value: "INDIVIDUAL" },
    { label: "Shared Property", value: "SHARED" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>
        Let&apos;s start with the basic details of your property
      </Text>

      {/* Property Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Property Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={formData.name}
          onChangeText={(value) => updateFormData("name", value)}
          placeholder="Enter property name"
          placeholderTextColor="#999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Property Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Property Type *</Text>
        <SelectInput
          value={formData.propertyType}
          onValueChange={(value) => updateFormData("propertyType", value)}
          options={propertyTypeOptions}
          placeholder="Select property type"
          error={!!errors.propertyType}
        />
        {errors.propertyType && (
          <Text style={styles.errorText}>{errors.propertyType}</Text>
        )}
      </View>

      {/* Listing Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Listing Type *</Text>
        <SelectInput
          value={formData.type}
          onValueChange={(value) => updateFormData("type", value)}
          options={typeOptions}
          placeholder="Select listing type"
          error={!!errors.type}
        />
        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        <Text style={styles.helperText}>
          Individual: Entire property • Shared: Room in property
        </Text>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.textArea, errors.description && styles.inputError]}
          value={formData.description}
          onChangeText={(value) => updateFormData("description", value)}
          placeholder="Describe your property, what makes it special, nearby attractions..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
        <Text style={styles.helperText}>
          A good description helps guests understand what to expect
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
    minHeight: 120,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
    fontStyle: "italic",
  },
});
