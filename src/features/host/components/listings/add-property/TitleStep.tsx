import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { PropertyFormData } from "@core/types";

interface TitleStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
  errors: Record<string, string>;
}

export default function TitleStep({
  formData,
  updateFormData,
  errors,
}: TitleStepProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Property Title</Text>
      <Text style={styles.stepSubtitle}>
        Catch guests&apos; attention with a short, catchy title (max 32
        characters)
      </Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={formData.name}
        maxLength={32}
        onChangeText={(text) => updateFormData("name", text)}
        placeholder="Cozy Downtown Apartment"
        placeholderTextColor="#999"
      />
      <Text style={styles.charCount}>{formData.name.length}/32</Text>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
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
  inputError: { borderColor: "#FF6B6B" },
  errorText: { color: "#FF6B6B", fontSize: 14, marginTop: 4 },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
