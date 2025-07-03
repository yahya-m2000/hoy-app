import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  View,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
// Core
import { PropertyManagementService } from "@core/api/services/property";
import {
  PropertyFormData,
  PROPERTY_TYPES,
  GUEST_ACCESS_TYPES,
  PROPERTY_TAGS,
  AMENITIES,
} from "@core/types/listings.types";
import { useAuth } from "@core/context/AuthContext";

// Shared Components
import { Text, Button, TextInput } from "@shared/components";
import { Container } from "@shared/components";

// Feature Components - Import existing step components
import BasicInfoStep from "@features/host/components/listings/add-property/BasicInfoStep";
import LocationStep from "@features/host/components/listings/add-property/LocationStep";
import DetailsStep from "@features/host/components/listings/add-property/DetailsStep";
import AmenitiesStep from "@features/host/components/listings/add-property/AmenitiesStep";
import ImagesStep from "@features/host/components/listings/add-property/ImagesStep";
import TitleStep from "@features/host/components/listings/add-property/TitleStep";
import ReviewStep from "@features/host/components/listings/add-property/ReviewStep";
import StepIndicator from "@features/host/components/listings/add-property/StepIndicator";
import StepNavigation from "@features/host/components/listings/add-property/StepNavigation";
import PropertyListingProgress from "@features/host/components/listings/add-property/PropertyListingProgress";

// Additional Step Components that need to be created
const IntroStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Welcome to Property Listing</Text>
    <Text style={styles.stepDescription}>
      We&apos;ll guide you through listing your property in just a few simple
      steps.
    </Text>
    <View style={styles.benefitsList}>
      <Text style={styles.benefitItem}>
        • Reach millions of travelers worldwide
      </Text>
      <Text style={styles.benefitItem}>
        • Set your own prices and house rules
      </Text>
      <Text style={styles.benefitItem}>• Get paid quickly and securely</Text>
    </View>
  </View>
);

const PropertyTypeStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>What type of property is this?</Text>
    <Text style={styles.stepDescription}>
      Choose the option that best describes your place
    </Text>
    {PROPERTY_TYPES.map((type) => (
      <Button
        key={type.value}
        title={type.label}
        variant={formData.propertyType === type.value ? "primary" : "outline"}
        onPress={() => updateFormData({ propertyType: type.value })}
        style={styles.optionButton}
      />
    ))}
  </View>
);

const GuestAccessStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>What will guests have access to?</Text>
    <Text style={styles.stepDescription}>
      Select the type of access your guests will have.
    </Text>
    {GUEST_ACCESS_TYPES.map((option) => (
      <View key={option.value} style={styles.accessOption}>
        <Button
          title={option.label}
          onPress={() => updateFormData({ guestAccessType: option.value })}
          variant={
            formData.guestAccessType === option.value ? "primary" : "outline"
          }
          style={styles.optionButton}
        />
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
    ))}
  </View>
);

const TagsStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Choose tags that describe your place</Text>
    <Text style={styles.stepDescription}>Help guests find your property</Text>
    <View style={styles.tagsGrid}>
      {PROPERTY_TAGS.map((tag) => {
        const selected = formData.tags.includes(tag);
        return (
          <Button
            key={tag}
            title={tag}
            variant={selected ? "primary" : "outline"}
            onPress={() => {
              const current = formData.tags;
              if (selected) {
                updateFormData({
                  tags: current.filter((t: string) => t !== tag),
                });
              } else {
                updateFormData({ tags: [...current, tag] });
              }
            }}
            style={styles.tagButton}
          />
        );
      })}
    </View>
  </View>
);

const DescriptionStep = ({ formData, updateFormData, errors }: any) => (
  <Container>
    <Text variant="h4">Describe your property</Text>
    <Text variant="body">
      Tell guests what makes your place special (max 500 words)
    </Text>
    <TextInput
      label="Description"
      value={formData.description}
      onChangeText={(text: string) => updateFormData({ description: text })}
      error={
        typeof errors?.description === "string" ? errors.description : undefined
      }
      multiline
      numberOfLines={8}
      maxLength={3000}
      required
    />
    <Text variant="caption">{formData.description.length}/3000 characters</Text>
    <Container style={{ marginTop: 16 }}>
      <Text variant="subtitle">Writing Tips:</Text>
      <Text variant="caption">• Highlight unique features</Text>
      <Text variant="caption">• Mention nearby attractions</Text>
      <Text variant="caption">• Describe the neighborhood vibe</Text>
      <Text variant="caption">• Set clear expectations</Text>
    </Container>
  </Container>
);

const PricingStep = ({ formData, updateFormData, isWeekend }: any) => {
  const priceKey = isWeekend ? "weekendPrice" : "weekdayPrice";
  const currentPrice = formData[priceKey] || 0;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        Set your {isWeekend ? "weekend" : "weekday"} price
      </Text>
      <Text style={styles.stepDescription}>
        Price competitively to attract more bookings
      </Text>

      <View style={styles.priceContainer}>
        <Text style={styles.priceDisplay}>${currentPrice}</Text>
        <Text style={styles.priceLabel}>per night</Text>
      </View>

      <View style={styles.priceControls}>
        <Button
          title="-$5"
          variant="outline"
          onPress={() =>
            updateFormData({ [priceKey]: Math.max(0, currentPrice - 5) })
          }
          style={styles.priceButton}
        />
        <Button
          title="-$1"
          variant="outline"
          onPress={() =>
            updateFormData({ [priceKey]: Math.max(0, currentPrice - 1) })
          }
          style={styles.priceButton}
        />
        <Button
          title="+$1"
          onPress={() => updateFormData({ [priceKey]: currentPrice + 1 })}
          style={styles.priceButton}
        />
        <Button
          title="+$5"
          onPress={() => updateFormData({ [priceKey]: currentPrice + 5 })}
          style={styles.priceButton}
        />
      </View>
    </View>
  );
};

const DiscountsStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Offer discounts to attract guests</Text>
    <Text style={styles.stepDescription}>
      Optional: Increase bookings with strategic discounts
    </Text>

    {[
      {
        key: "newListingPromo",
        label: "New listing promotion (20% off first 3 bookings)",
      },
      {
        key: "lastMinuteDiscount",
        label: "Last-minute discount (for bookings within 24 hours)",
      },
    ].map((discount) => (
      <View key={discount.key} style={styles.discountOption}>
        <Button
          title={formData.discounts[discount.key] ? "Enabled" : "Disabled"}
          variant={formData.discounts[discount.key] ? "primary" : "outline"}
          onPress={() =>
            updateFormData({
              discounts: {
                ...formData.discounts,
                [discount.key]: !formData.discounts[discount.key],
              },
            })
          }
          style={styles.discountButton}
        />
        <Text style={styles.discountLabel}>{discount.label}</Text>
      </View>
    ))}
  </View>
);

const PoliciesStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Review your policies</Text>
    <Text style={styles.stepDescription}>
      These are your default policies. You can customize them for this property.
    </Text>

    <View style={styles.policySection}>
      <Text style={styles.policyTitle}>Cancellation Policy</Text>
      <Text style={styles.policyDescription}>
        Moderate - Full refund 5 days before arrival
      </Text>
      <Button
        title="Modify"
        variant="outline"
        style={styles.policyButton}
        onPress={() => {}}
      />
    </View>

    <View style={styles.policySection}>
      <Text style={styles.policyTitle}>House Rules</Text>
      <Text style={styles.policyDescription}>
        Check-in: 3:00 PM, Check-out: 11:00 AM
      </Text>
      <Button
        title="Modify"
        variant="outline"
        style={styles.policyButton}
        onPress={() => {}}
      />
    </View>

    <View style={styles.policySection}>
      <Text style={styles.policyTitle}>Safety Information</Text>
      <Text style={styles.policyDescription}>
        Standard safety features included
      </Text>
      <Button
        title="Modify"
        variant="outline"
        style={styles.policyButton}
        onPress={() => {}}
      />
    </View>
  </View>
);

const HostInfoStep = ({ formData, updateFormData }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Tell us about yourself</Text>
    <Text style={styles.stepDescription}>
      Are you listing as an individual or business?
    </Text>
    {[
      { label: "Individual", value: "individual" },
      { label: "Business", value: "business" },
    ].map((opt) => (
      <Button
        key={opt.value}
        title={opt.label}
        variant={formData.hostType === opt.value ? "primary" : "outline"}
        onPress={() => updateFormData({ hostType: opt.value })}
        style={styles.optionButton}
      />
    ))}

    <Text style={[styles.stepDescription, { marginTop: 16 }]}>
      Safety disclosures
    </Text>
    {[
      {
        key: "weaponsOnProperty",
        question: "Are there any weapons on the property?",
      },
      {
        key: "securityCameras",
        question: "Are there security cameras on the property?",
      },
    ].map((item) => {
      const current = (formData.safetyFeatures as any)[item.key] ?? false;
      return (
        <View key={item.key} style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{item.question}</Text>
          <Button
            title={current ? "Yes" : "No"}
            variant={current ? "primary" : "outline"}
            onPress={() => {
              updateFormData({
                safetyFeatures: {
                  ...formData.safetyFeatures,
                  [item.key]: !current,
                },
              });
            }}
            style={styles.toggleButton}
          />
        </View>
      );
    })}
  </View>
);

const SuccessStep = ({ formData, isPublished }: any) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>
      {isPublished ? "Congratulations!" : "Draft Saved!"}
    </Text>
    <Text style={styles.stepDescription}>
      {isPublished
        ? "Your property has been published"
        : "Your property has been saved as a draft"}
    </Text>
    <Button
      title="View Listing"
      onPress={() => router.push(`/property/${formData._id}`)}
      style={styles.actionButton}
    />
    <Button
      title="Add Another Property"
      variant="outline"
      onPress={() => router.push("/host/listings/add-property")}
      style={styles.actionButton}
    />
  </View>
);

// Define the complete multi-step structure
const LISTING_FLOW = {
  steps: [
    {
      id: 1,
      key: "about",
      title: "Tell Us About Your Place",
      substeps: [
        { id: "1a", component: IntroStep, key: "intro" },
        { id: "1b", component: PropertyTypeStep, key: "propertyType" },
        { id: "1c", component: GuestAccessStep, key: "guestAccess" },
        { id: "1d", component: LocationStep, key: "location" },
        { id: "1e", component: DetailsStep, key: "details" },
      ],
    },
    {
      id: 2,
      key: "standout",
      title: "Make Your Place Stand Out",
      substeps: [
        { id: "2a", component: AmenitiesStep, key: "amenities" },
        { id: "2b", component: ImagesStep, key: "photos" },
        { id: "2c", component: TitleStep, key: "title" },
        { id: "2d", component: TagsStep, key: "tags" },
        { id: "2e", component: DescriptionStep, key: "description" },
      ],
    },
    {
      id: 3,
      key: "finish",
      title: "Finish Up and Publish",
      substeps: [
        { id: "3a", component: PricingStep, key: "weekdayPrice" },
        {
          id: "3b",
          component: PricingStep,
          key: "weekendPrice",
          isWeekend: true,
        },
        { id: "3c", component: DiscountsStep, key: "discounts" },
        { id: "3d", component: PoliciesStep, key: "policies" },
        { id: "3e", component: HostInfoStep, key: "hostInfo" },
      ],
    },
  ],
  review: { component: ReviewStep, key: "review" },
  success: { component: SuccessStep, key: "success" },
};

// Extended form data type
interface ExtendedPropertyFormData extends PropertyFormData {
  _id?: string;
}

// Initial form data
const getInitialFormData = (): ExtendedPropertyFormData => ({
  name: "",
  type: "INDIVIDUAL",
  propertyType: "apartment",
  description: "",
  status: "draft",
  guestAccessType: "entire_place",
  hostType: "individual",
  tags: [],
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
  weekdayPrice: 0,
  weekendPrice: 0,
  currency: "USD",
  discounts: {
    newListingPromo: false,
    lastMinuteDiscount: false,
    weeklyDiscount: { enabled: false, percentage: 0 },
    monthlyDiscount: { enabled: false, percentage: 0 },
  },
  amenities: [],
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  maxGuests: 2,
  houseRules: {},
  safetyFeatures: {},
});

export default function AddPropertyScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { mode, propertyId, draftId } = useLocalSearchParams<{
    mode?: "add" | "edit";
    propertyId?: string;
    draftId?: string;
  }>();

  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubstep, setCurrentSubstep] = useState(0);
  const [formData, setFormData] = useState<ExtendedPropertyFormData>(
    getInitialFormData()
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate progress
  const totalSubsteps = LISTING_FLOW.steps.reduce(
    (acc, step) => acc + step.substeps.length,
    0
  );
  const completedSubsteps =
    LISTING_FLOW.steps
      .slice(0, currentStep - 1)
      .reduce((acc, step) => acc + step.substeps.length, 0) + currentSubstep;
  const progress = (completedSubsteps / totalSubsteps) * 100;

  // Global step index across all substeps (1-based)
  const globalStepIndex =
    currentStep === 0
      ? totalSubsteps + 1 // Review step (last logical step)
      : completedSubsteps + 1; // 1-based for display

  // Load draft or existing property
  useEffect(() => {
    const loadData = async () => {
      try {
        if (draftId) {
          // Load draft from local storage or API
          const draft = await loadDraft(draftId);
          if (draft) setFormData(draft);
        } else if (mode === "edit" && propertyId) {
          // Load existing property
          setLoading(true);
          const property = await PropertyManagementService.getProperty(
            propertyId
          );
          setFormData(mapPropertyToFormData(property));
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load property data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [draftId, mode, propertyId]);

  // Auto-save draft
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (formData.name || formData.images.length > 0) {
        saveDraft();
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Flexible updateFormData that supports two signatures:
  // 1) updateFormData({ key: value, ... })
  // 2) updateFormData('key', value)
  const updateFormData = useCallback(
    (
      fieldOrUpdates:
        | keyof ExtendedPropertyFormData
        | Partial<ExtendedPropertyFormData>,
      value?: any
    ) => {
      if (typeof fieldOrUpdates === "string") {
        // Signature 2
        const field = fieldOrUpdates as keyof ExtendedPropertyFormData;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      } else if (
        typeof fieldOrUpdates === "object" &&
        fieldOrUpdates !== null
      ) {
        // Signature 1
        const updates = fieldOrUpdates as Partial<ExtendedPropertyFormData>;
        setFormData((prev) => ({ ...prev, ...updates }));
        const updatedKeys = Object.keys(updates);
        setErrors((prev) => {
          const newErrors = { ...prev };
          updatedKeys.forEach((key) => delete newErrors[key]);
          return newErrors;
        });
      }
    },
    []
  );

  const updateNestedFormData = useCallback(
    (
      field: keyof ExtendedPropertyFormData,
      nestedField: string,
      value: any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field] as object),
          [nestedField]: value,
        },
      }));
      // Clear errors for nested field
      const errorKey = `${field}.${nestedField}`;
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    },
    []
  );

  const saveDraft = async () => {
    try {
      setSaving(true);
      const draftData = { ...formData, status: "draft" as const };

      if (formData._id) {
        // Update existing draft
        await PropertyManagementService.updateProperty(formData._id, draftData);
      } else {
        // Create new draft
        const created = await PropertyManagementService.createProperty(
          draftData
        );
        setFormData((prev) => ({ ...prev, _id: created._id }));
      }

      console.log("Progress saved successfully");
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const currentStepData = LISTING_FLOW.steps[currentStep - 1];

    if (currentSubstep < currentStepData.substeps.length - 1) {
      // Move to next substep
      setCurrentSubstep(currentSubstep + 1);
    } else if (currentStep < LISTING_FLOW.steps.length) {
      // Move to next step
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(0);
    } else {
      // Move to review
      setCurrentStep(0); // 0 indicates review step
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // From review back to last step
      setCurrentStep(LISTING_FLOW.steps.length);
      setCurrentSubstep(
        LISTING_FLOW.steps[LISTING_FLOW.steps.length - 1].substeps.length - 1
      );
    } else if (currentSubstep > 0) {
      // Go to previous substep
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      // Go to previous step
      setCurrentStep(currentStep - 1);
      const prevStep = LISTING_FLOW.steps[currentStep - 2];
      setCurrentSubstep(prevStep.substeps.length - 1);
    }
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    router.back();
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      // Transform safetyFeatures.securityCameras if it's a boolean
      let transformedSafetyFeatures = formData.safetyFeatures;
      if (
        transformedSafetyFeatures &&
        typeof transformedSafetyFeatures.securityCameras === "boolean"
      ) {
        const val =
          transformedSafetyFeatures.securityCameras as unknown as boolean;
        transformedSafetyFeatures = {
          ...transformedSafetyFeatures,
          securityCameras: {
            exterior: val,
            interior: false,
            description: "",
          },
        } as any;
      }

      const publishData = {
        ...formData,
        safetyFeatures: transformedSafetyFeatures,
        status: "published" as const,
      };

      if (formData._id) {
        await PropertyManagementService.updateProperty(
          formData._id,
          publishData
        );
      } else {
        await PropertyManagementService.createProperty(publishData);
      }

      // Show success
      setCurrentStep(-1); // -1 indicates success step
    } catch (error) {
      Alert.alert("Error", "Failed to submit property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine current component
  let CurrentComponent: React.ComponentType<any>;
  let componentProps: any = {};

  if (currentStep === -1) {
    // Success step
    CurrentComponent = SuccessStep;
    componentProps = { formData, isPublished: formData.status === "published" };
  } else if (currentStep === 0) {
    // Review step
    CurrentComponent = ReviewStep;
    componentProps = {
      formData,
      onEdit: (step: number, substep: number) => {
        setCurrentStep(step);
        setCurrentSubstep(substep);
      },
      onPublish: handlePublish,
      onSaveDraft: saveDraft,
      updateFormData,
      updateNestedFormData,
      errors,
    };
  } else {
    // Regular step
    const currentStepData = LISTING_FLOW.steps[currentStep - 1];
    const currentSubstepData = currentStepData.substeps[currentSubstep];
    CurrentComponent = currentSubstepData.component;
    componentProps = {
      formData,
      updateFormData,
      updateNestedFormData,
      errors,
      ...((currentSubstepData as any).isWeekend && {
        isWeekend: (currentSubstepData as any).isWeekend,
      }),
    };
  }

  return (
    <Container flex={1}>
      {/* Progress Bar */}
      {currentStep > 0 && currentStep <= LISTING_FLOW.steps.length && (
        <PropertyListingProgress
          currentStep={currentStep}
          totalSteps={LISTING_FLOW.steps.length}
          progress={progress}
          stepTitles={LISTING_FLOW.steps.map((s) => s.title)}
        />
      )}

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <CurrentComponent {...componentProps} />
      </ScrollView>

      {/* Navigation */}
      {currentStep !== -1 && (
        <StepNavigation
          currentStep={globalStepIndex}
          totalSteps={totalSubsteps + 1} // +1 for the review/publish step
          onNext={handleNext}
          onPrev={handleBack}
          onSubmit={handlePublish}
          onCancel={handleSaveAndExit}
          loading={loading}
          isEditMode={mode === "edit"}
        />
      )}
    </Container>
  );
}

// Helper functions
async function loadDraft(
  draftId: string
): Promise<ExtendedPropertyFormData | null> {
  // Implement draft loading logic
  return null;
}

function mapPropertyToFormData(property: any): ExtendedPropertyFormData {
  // Map API property to form data structure
  return {
    ...property,
    _id: property._id,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  stepContainer: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
  },
  optionButton: {
    marginVertical: 8,
  },
  actionButton: {
    marginVertical: 8,
  },
  progressContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  progressText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  navigation: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  saveExitButton: {
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  dialogMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dialogButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  counterLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    marginHorizontal: 4,
  },
  counterValue: {
    fontSize: 16,
    color: "#6b7280",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityButton: {
    margin: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    color: "#6b7280",
  },
  toggleButton: {
    marginHorizontal: 4,
  },
  benefitsList: {
    marginTop: 16,
  },
  benefitItem: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
  },
  accessOption: {
    marginBottom: 16,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  tagButton: {
    margin: 4,
  },
  inputGroup: {
    marginBottom: 16,
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
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  tipsBox: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  priceDisplay: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1f2937",
  },
  priceLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  priceControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  priceButton: {
    marginHorizontal: 4,
  },
  discountOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  discountButton: {
    marginRight: 12,
  },
  discountLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
  },
  policySection: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  policyDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  policyButton: {
    alignSelf: "flex-start",
  },
});
