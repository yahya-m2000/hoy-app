import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useProperty } from "./hooks/useProperties";
import { PropertyService } from "./services/propertyService";
import { PropertyFormData } from "./utils/types";
import LoadingState from "./components/LoadingState";
import BasicInfoStep from "./components/add-property/BasicInfoStep";
import LocationStep from "./components/add-property/LocationStep";
import DetailsStep from "./components/add-property/DetailsStep";
import AmenitiesStep from "./components/add-property/AmenitiesStep";
import ImagesStep from "./components/add-property/ImagesStep";
import ReviewStep from "./components/add-property/ReviewStep";
import StepIndicator from "./components/add-property/StepIndicator";
import StepNavigation from "./components/add-property/StepNavigation";

const STEPS = [
  { id: 1, title: "Basic Info", component: BasicInfoStep },
  { id: 2, title: "Location", component: LocationStep },
  { id: 3, title: "Details", component: DetailsStep },
  { id: 4, title: "Amenities", component: AmenitiesStep },
  { id: 5, title: "Images", component: ImagesStep },
  { id: 6, title: "Review", component: ReviewStep },
];

const initialFormData: PropertyFormData = {
  name: "",
  type: "INDIVIDUAL",
  propertyType: "apartment",
  description: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  coordinates: {
    latitude: 0,
    longitude: 0,
  },
  images: [],
  price: 0,
  currency: "USD",
  amenities: [],
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  maxGuests: 2,
  houseRules: {},
  safetyFeatures: {},
};

export default function AddPropertyScreen() {
  const { mode, propertyId } = useLocalSearchParams<{
    mode?: "add" | "edit";
    propertyId?: string;
  }>();
  const isEditMode = mode === "edit" && propertyId;

  const { property: existingProperty, loading: loadingProperty } = useProperty(
    isEditMode ? propertyId! : ""
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyService = new PropertyService();
  // Load existing property data in edit mode
  useEffect(() => {
    if (isEditMode && existingProperty) {
      setFormData({
        name: existingProperty.name,
        type: existingProperty.type,
        propertyType: existingProperty.propertyType,
        description: existingProperty.description,
        address: existingProperty.address,
        coordinates: existingProperty.coordinates || {
          latitude: 0,
          longitude: 0,
        },
        images: existingProperty.images,
        price: existingProperty.price,
        currency: existingProperty.currency,
        amenities: existingProperty.amenities,
        bedrooms: existingProperty.bedrooms,
        beds: existingProperty.beds,
        bathrooms: existingProperty.bathrooms,
        maxGuests: existingProperty.maxGuests,
        houseRules: existingProperty.houseRules || {},
        safetyFeatures: existingProperty.safetyFeatures || {},
      });
    }
  }, [isEditMode, existingProperty]);

  const updateFormData = (field: keyof PropertyFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const updateNestedFormData = (
    field: keyof PropertyFormData,
    nestedField: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...((prev[field] as object) || {}),
        [nestedField]: value,
      },
    }));
    // Clear errors
    const errorKey = `${field}.${nestedField}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.name.trim()) newErrors.name = "Property name is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        break;

      case 2: // Location
        if (!formData.address.street.trim())
          newErrors["address.street"] = "Street address is required";
        if (!formData.address.city.trim())
          newErrors["address.city"] = "City is required";
        if (!formData.address.state.trim())
          newErrors["address.state"] = "State is required";
        if (!formData.address.postalCode.trim())
          newErrors["address.postalCode"] = "Postal code is required";
        if (!formData.address.country.trim())
          newErrors["address.country"] = "Country is required";
        break;

      case 3: // Details
        if (formData.price <= 0)
          newErrors.price = "Price must be greater than 0";
        if (formData.bedrooms < 0)
          newErrors.bedrooms = "Bedrooms must be 0 or more";
        if (formData.beds < 1) newErrors.beds = "At least 1 bed is required";
        if (formData.bathrooms < 1)
          newErrors.bathrooms = "At least 1 bathroom is required";
        if (formData.maxGuests < 1)
          newErrors.maxGuests = "At least 1 guest must be allowed";
        break;

      case 4: // Amenities - optional, no validation needed
        break;

      case 5: // Images
        if (formData.images.length === 0)
          newErrors.images = "At least one image is required";
        break;

      case 6: // Review - final validation
        // Re-validate all previous steps
        if (!formData.name.trim()) newErrors.name = "Property name is required";
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        if (!formData.address.street.trim())
          newErrors["address.street"] = "Street address is required";
        if (!formData.address.city.trim())
          newErrors["address.city"] = "City is required";
        if (!formData.address.state.trim())
          newErrors["address.state"] = "State is required";
        if (!formData.address.postalCode.trim())
          newErrors["address.postalCode"] = "Postal code is required";
        if (!formData.address.country.trim())
          newErrors["address.country"] = "Country is required";
        if (formData.price <= 0)
          newErrors.price = "Price must be greater than 0";
        if (formData.images.length === 0)
          newErrors.images = "At least one image is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && propertyId) {
        await propertyService.updateProperty(propertyId, formData);
        Alert.alert("Success", "Property updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        await propertyService.createProperty(formData);
        Alert.alert("Success", "Property created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/host/listings"),
          },
        ]);
      }
    } catch {
      Alert.alert("Error", "Failed to save property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All unsaved changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        { text: "Cancel", style: "destructive", onPress: () => router.back() },
      ]
    );
  };
  if (isEditMode && loadingProperty) {
    return <LoadingState />;
  }

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <View style={styles.container}>
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          updateNestedFormData={updateNestedFormData}
          errors={errors}
          isEditMode={!!isEditMode}
        />
      </ScrollView>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        isEditMode={!!isEditMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra space for navigation
  },
});
