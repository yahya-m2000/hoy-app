import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen, Text, Button, Input } from "@shared/components/base";
import { spacing } from "@shared/constants";
import { useHostProperties } from "@modules/host";

export default function PropertyFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const { createProperty, updateProperty } = useHostProperties();

  const isEditing = !!params.propertyId;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "rental", // Required field
    propertyType: "apartment",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA", // Use full country name
    },
    maxGuests: "1",
    bedrooms: "1",
    beds: "1", // Required field
    bathrooms: "1",
    pricePerNight: "50", // Default to a reasonable value
    currency: "USD",
    // Default coordinates (we'll need to get real ones later)
    latitude: "40.7128", // NYC coordinates as default
    longitude: "-74.0060",
  });
  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Property name is required");
      return;
    }

    if (
      !formData.address.street.trim() ||
      !formData.address.city.trim() ||
      !formData.address.state.trim() ||
      !formData.address.country.trim() ||
      !formData.address.postalCode.trim()
    ) {
      Alert.alert("Error", "Please fill in all address fields");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Property description is required");
      return;
    }

    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert("Error", "Please provide valid coordinates");
      return;
    }

    const price = parseFloat(formData.pricePerNight);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Error", "Please provide a valid price greater than 0");
      return;
    }

    setLoading(true);
    try {
      const propertyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        propertyType: formData.propertyType,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
          country: formData.address.country.trim(),
        },
        coordinates: {
          latitude,
          longitude,
        },
        maxGuests: parseInt(formData.maxGuests) || 1,
        bedrooms: parseInt(formData.bedrooms) || 1,
        beds: parseInt(formData.beds) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        amenities: [],
        price: price, // Send as number, not object
        currency: formData.currency,
      };

      if (isEditing) {
        await updateProperty({
          _id: params.propertyId as string,
          ...propertyData,
        });
      } else {
        await createProperty(propertyData);
      }

      Alert.alert("Success", t("host.propertyForm.saveSuccess"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Property save error:", error);
      Alert.alert("Error", t("host.propertyForm.saveError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text variant="h2" style={styles.title}>
            {isEditing
              ? t("host.propertyForm.editTitle")
              : t("host.propertyForm.addTitle")}
          </Text>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t("host.propertyForm.basicInfo")}
            </Text>

            <Input
              label={t("host.propertyForm.name")}
              placeholder={t("host.propertyForm.namePlaceholder")}
              value={formData.name}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
              style={styles.input}
            />

            <Input
              label={t("host.propertyForm.description")}
              placeholder={t("host.propertyForm.descriptionPlaceholder")}
              value={formData.description}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, description: value }))
              }
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t("host.propertyForm.address")}
            </Text>
            <Input
              label={t("host.propertyForm.street")}
              value={formData.address.street}
              onChangeText={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  address: { ...prev.address, street: value },
                }))
              }
              style={styles.input}
            />
            <View style={styles.row}>
              <Input
                label={t("host.propertyForm.city")}
                value={formData.address.city}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: value },
                  }))
                }
                style={[styles.input, styles.halfWidth]}
              />

              <Input
                label={t("host.propertyForm.state")}
                value={formData.address.state}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: value },
                  }))
                }
                style={[styles.input, styles.halfWidth]}
              />
            </View>
            <View style={styles.row}>
              <Input
                label={t("host.propertyForm.postalCode")}
                value={formData.address.postalCode}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, postalCode: value },
                  }))
                }
                style={[styles.input, styles.halfWidth]}
              />

              <Input
                label={t("host.propertyForm.country")}
                value={formData.address.country}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: { ...prev.address, country: value },
                  }))
                }
                style={[styles.input, styles.halfWidth]}
              />
            </View>
            <View style={styles.row}>
              <Input
                label="Latitude"
                value={formData.latitude}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, latitude: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
                placeholder="40.7128"
              />
              <Input
                label="Longitude"
                value={formData.longitude}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, longitude: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
                placeholder="-74.0060"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Property Type & Category
            </Text>

            <Input
              label="Property Type"
              value={formData.propertyType}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, propertyType: value }))
              }
              style={styles.input}
              placeholder="apartment"
            />

            <Input
              label="Type Category"
              value={formData.type}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
              style={styles.input}
              placeholder="rental"
            />
          </View>

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t("host.propertyForm.details")}
            </Text>
            <View style={styles.row}>
              <Input
                label={t("host.propertyForm.maxGuests")}
                value={formData.maxGuests}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, maxGuests: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />

              <Input
                label={t("host.propertyForm.bedrooms")}
                value={formData.bedrooms}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, bedrooms: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Beds"
                value={formData.beds}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, beds: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />

              <Input
                label={t("host.propertyForm.bathrooms")}
                value={formData.bathrooms}
                onChangeText={(value) =>
                  setFormData((prev) => ({ ...prev, bathrooms: value }))
                }
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
            </View>

            <Input
              label={t("host.propertyForm.pricePerNight")}
              value={formData.pricePerNight}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, pricePerNight: value }))
              }
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t("host.propertyForm.cancel")}
          variant="outline"
          onPress={() => router.back()}
          style={styles.button}
        />

        <Button
          title={t("host.propertyForm.save")}
          onPress={handleSave}
          loading={loading}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flex: 1,
  },
});
