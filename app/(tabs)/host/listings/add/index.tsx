import React, { useState, useEffect, useCallback } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
// Core
import { PropertyManagementService } from "@core/api/services/property";
import { PropertyFormData } from "@core/types/listings.types";
import { useAuth } from "@core/context/AuthContext";
import { Container, Header } from "@shared/components";
import { spacing } from "@core/design";
import { useTabBarVisibility } from "@core/navigation/useTabBarVisibility";

// Feature Components
import BasicInfoStep from "@features/host/components/listings/add-property/steps/BasicInfoStep";
import LocationStep from "@features/host/components/listings/add-property/steps/LocationStep";
import DetailsStep from "@features/host/components/listings/add-property/steps/DetailsStep";
import AmenitiesStep from "@features/host/components/listings/add-property/steps/AmenitiesStep";
import ImagesStep from "@features/host/components/listings/add-property/steps/ImagesStep";
import TitleStep from "@features/host/components/listings/add-property/steps/TitleStep";
import ReviewStep from "@features/host/components/listings/add-property/steps/ReviewStep";
import StepNavigation from "@features/host/components/listings/add-property/StepNavigation";

// Import new step components
import IntroStep from "@features/host/components/listings/add-property/steps/IntroStep";
import PropertyTypeStep from "@features/host/components/listings/add-property/steps/PropertyTypeStep";
import GuestAccessStep from "@features/host/components/listings/add-property/steps/GuestAccessStep";
import TagsStep from "@features/host/components/listings/add-property/steps/TagsStep";
import DescriptionStep from "@features/host/components/listings/add-property/steps/DescriptionStep";
import PricingStep from "@features/host/components/listings/add-property/steps/PricingStep";
import DiscountsStep from "@features/host/components/listings/add-property/steps/DiscountsStep";
import PoliciesStep from "@features/host/components/listings/add-property/steps/PoliciesStep";
import HostInfoStep from "@features/host/components/listings/add-property/steps/HostInfoStep";
import SuccessStep from "@features/host/components/listings/add-property/steps/SuccessStep";
import DraftSelectionStep from "@features/host/components/listings/add-property/steps/DraftSelectionStep";
import ProgressBar from "@features/host/components/listings/add-property/ProgressBar";

// Define the complete multi-step structure
const getListingFlow = (t: any) => ({
  steps: [
    {
      id: 1,
      key: "about",
      title: t("property.step1.title"),
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
      title: t("property.step2.title"),
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
      title: t("property.step3.title"),
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
});

// Extended form data type
interface ExtendedPropertyFormData extends PropertyFormData {
  _id?: string;
  currentStep?: number;
  currentSubstep?: number;
  updatedAt?: string;
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
  const navigation = useNavigation();
  const { animateTabBar } = useTabBarVisibility();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<ExtendedPropertyFormData[]>([]);
  const [showDraftSelection, setShowDraftSelection] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  // Hide tab bar when on this screen
  useFocusEffect(
    useCallback(() => {
      animateTabBar(true);
      return () => {
        animateTabBar(false);
      };
    }, [animateTabBar])
  );

  // Calculate the main step (1, 2, or 3) for progress bar
  const mainStep = currentStep === 0 ? 3 : currentStep === -1 ? 3 : currentStep;

  // Load drafts on mount
  useEffect(() => {
    const loadDrafts = async () => {
      try {
        setLoadingDrafts(true);

        // If editing existing property or specific draft, skip draft selection
        if (mode === "edit" && propertyId) {
          setShowDraftSelection(false);
          setLoading(true);
          const property = await PropertyManagementService.getProperty(
            propertyId
          );
          setFormData(mapPropertyToFormData(property));
          setLoading(false);
          return;
        }

        if (draftId) {
          setShowDraftSelection(false);
          const draft = await loadDraft(draftId);
          if (draft) {
            setFormData(draft);
            // Resume from saved step
            if (draft.currentStep) setCurrentStep(draft.currentStep);
            if (draft.currentSubstep) setCurrentSubstep(draft.currentSubstep);
          }
          return;
        }

        // Load all drafts for selection
        const userDrafts = await loadUserDrafts();
        setDrafts(userDrafts);

        // If no drafts exist, skip selection screen
        if (userDrafts.length === 0) {
          setShowDraftSelection(false);
        }
      } catch (error) {
        console.error("Error loading drafts:", error);
        Alert.alert(
          t("property.add.alerts.errorTitle"),
          t("property.add.alerts.loadError")
        );
        setShowDraftSelection(false);
      } finally {
        setLoadingDrafts(false);
      }
    };

    loadDrafts();
  }, [draftId, mode, propertyId]);

  // Auto-save draft
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      // Only auto-save if we have meaningful data
      const hasMeaningfulData =
        formData.name?.trim() ||
        formData.description?.trim() ||
        formData.images.length > 0 ||
        formData.address.street?.trim() ||
        formData.address.city?.trim() ||
        formData.price > 0;

      if (hasMeaningfulData) {
        saveDraft();
      }
    }, 10000); // Increased to 10 seconds to reduce server calls

    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Flexible updateFormData
  const updateFormData = useCallback(
    (
      fieldOrUpdates:
        | keyof ExtendedPropertyFormData
        | Partial<ExtendedPropertyFormData>,
      value?: any
    ) => {
      if (typeof fieldOrUpdates === "string") {
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

      // Only save if we have meaningful data (prevent validation errors)
      const hasMeaningfulData =
        formData.name?.trim() ||
        formData.description?.trim() ||
        formData.images.length > 0 ||
        formData.address.street?.trim() ||
        formData.address.city?.trim() ||
        formData.price > 0;

      if (!hasMeaningfulData) {
        console.log(t("property.add.alerts.noMeaningfulData"));
        return;
      }

      // Clean the data - remove empty strings for required fields
      const cleanedData = { ...formData };

      // Only include address if at least one field is filled
      if (
        !formData.address.street?.trim() &&
        !formData.address.city?.trim() &&
        !formData.address.state?.trim() &&
        !formData.address.country?.trim() &&
        !formData.address.postalCode?.trim()
      ) {
        delete (cleanedData as any).address;
      }

      // Only include name if it's not empty
      if (!formData.name?.trim()) {
        delete (cleanedData as any).name;
      }

      // Only include description if it's not empty
      if (!formData.description?.trim()) {
        delete (cleanedData as any).description;
      }

      const draftData = {
        ...cleanedData,
        status: "draft" as const,
        currentStep,
        currentSubstep,
        updatedAt: new Date().toISOString(),
      };

      if (formData._id) {
        await PropertyManagementService.updateProperty(formData._id, draftData);
      } else {
        const created = await PropertyManagementService.createProperty(
          draftData
        );
        setFormData((prev) => ({ ...prev, _id: created._id }));
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      // Don't show error to user for draft saves
    } finally {
      setSaving(false);
    }
  };

  const validateCurrentStep = (): boolean => {
    const listingFlow = getListingFlow(t);
    const currentStepData = listingFlow.steps[currentStep - 1];
    const currentSubstepData = currentStepData.substeps[currentSubstep];
    const validationErrors: Record<string, string> = {};

    // Validation for each step
    switch (currentSubstepData.key) {
      case "intro":
        // No validation needed for intro
        break;
      case "propertyType":
        if (!formData.propertyType) {
          validationErrors.propertyType = t(
            "property.add.validation.propertyTypeRequired"
          );
        }
        break;
      case "guestAccess":
        if (!formData.guestAccessType) {
          validationErrors.guestAccessType = t(
            "property.add.validation.guestAccessRequired"
          );
        }
        break;
      case "location":
        if (!formData.address.street?.trim()) {
          validationErrors["address.street"] = t(
            "property.add.validation.streetRequired"
          );
        }
        if (!formData.address.city?.trim()) {
          validationErrors["address.city"] = t(
            "property.add.validation.cityRequired"
          );
        }
        if (!formData.address.country?.trim()) {
          validationErrors["address.country"] = t(
            "property.add.validation.countryRequired"
          );
        }
        if (
          !formData.coordinates?.latitude ||
          !formData.coordinates?.longitude
        ) {
          validationErrors.coordinates = t(
            "property.add.validation.coordinatesRequired"
          );
        }
        break;
      case "details":
        if (formData.bedrooms < 1) {
          validationErrors.bedrooms = t(
            "property.add.validation.bedroomsRequired"
          );
        }
        if (formData.beds < 1) {
          validationErrors.beds = t("property.add.validation.bedsRequired");
        }
        if (formData.bathrooms < 1) {
          validationErrors.bathrooms = t(
            "property.add.validation.bathroomsRequired"
          );
        }
        if (formData.maxGuests < 1) {
          validationErrors.maxGuests = t(
            "property.add.validation.maxGuestsRequired"
          );
        }
        break;
      case "amenities":
        // Optional - no validation
        break;
      case "photos":
        if (formData.images.length === 0) {
          validationErrors.images = t("property.add.validation.photosRequired");
        }
        break;
      case "title":
        if (!formData.name?.trim()) {
          validationErrors.name = t("property.add.validation.titleRequired");
        } else if (formData.name.length < 3) {
          validationErrors.name = t("property.add.validation.titleMinLength");
        }
        break;
      case "tags":
        // Optional - no validation
        break;
      case "description":
        if (!formData.description?.trim()) {
          validationErrors.description = t(
            "property.add.validation.descriptionRequired"
          );
        } else if (formData.description.length < 50) {
          validationErrors.description = t(
            "property.add.validation.descriptionMinLength"
          );
        }
        break;
      case "weekdayPrice":
        if (!formData.weekdayPrice || formData.weekdayPrice <= 0) {
          validationErrors.weekdayPrice = t(
            "property.add.validation.weekdayPriceRequired"
          );
        }
        break;
      case "weekendPrice":
        if (!formData.weekendPrice || formData.weekendPrice <= 0) {
          validationErrors.weekendPrice = t(
            "property.add.validation.weekendPriceRequired"
          );
        }
        break;
      case "discounts":
        // Optional - no validation
        break;
      case "policies":
        // Optional - no validation
        break;
      case "hostInfo":
        // Optional - no validation
        break;
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      Alert.alert(
        t("property.add.alerts.requiredFieldsTitle"),
        t("property.add.alerts.requiredFieldsMessage"),
        [{ text: t("common.ok") }]
      );
      return;
    }

    const listingFlow = getListingFlow(t);
    const currentStepData = listingFlow.steps[currentStep - 1];

    if (currentSubstep < currentStepData.substeps.length - 1) {
      setCurrentSubstep(currentSubstep + 1);
    } else if (currentStep < listingFlow.steps.length) {
      setCurrentStep(currentStep + 1);
      setCurrentSubstep(0);
    } else {
      setCurrentStep(0); // Review step
    }
  };

  const handleBack = () => {
    // Clear errors when going back
    setErrors({});

    const listingFlow = getListingFlow(t);
    if (currentStep === 0) {
      setCurrentStep(listingFlow.steps.length);
      setCurrentSubstep(
        listingFlow.steps[listingFlow.steps.length - 1].substeps.length - 1
      );
    } else if (currentSubstep > 0) {
      setCurrentSubstep(currentSubstep - 1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      const prevStep = listingFlow.steps[currentStep - 2];
      setCurrentSubstep(prevStep.substeps.length - 1);
    }
  };

  const handleContinueDraft = (draft: ExtendedPropertyFormData) => {
    setFormData(draft);
    // Resume from saved step
    if (draft.currentStep) setCurrentStep(draft.currentStep);
    if (draft.currentSubstep) setCurrentSubstep(draft.currentSubstep);
    setShowDraftSelection(false);
  };

  const handleCreateNew = () => {
    setFormData(getInitialFormData());
    setCurrentStep(1);
    setCurrentSubstep(0);
    setShowDraftSelection(false);
  };

  const handleSaveAndExit = async () => {
    Alert.alert(
      t("property.add.alerts.saveAndExitTitle"),
      t("property.add.alerts.saveAndExitMessage"),
      [
        {
          text: t("property.add.alerts.exitWithoutSaving"),
          style: "destructive",
          onPress: () => router.back(),
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("property.add.alerts.saveAndExit"),
          onPress: async () => {
            await saveDraft();
            router.back();
          },
        },
      ]
    );
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
        transformedSafetyFeatures = {
          ...transformedSafetyFeatures,
          securityCameras: {
            exterior:
              transformedSafetyFeatures.securityCameras as unknown as boolean,
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

      setCurrentStep(-1); // Success step
    } catch (error) {
      Alert.alert(
        t("property.add.alerts.errorTitle"),
        t("property.add.alerts.submitError")
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while loading drafts
  if (loadingDrafts) {
    return (
      <Container flex={1} backgroundColor="background">
        <></>
      </Container>
    );
  }

  // Show draft selection screen if applicable
  if (showDraftSelection) {
    // Map ExtendedPropertyFormData to DraftProperty format
    const mappedDrafts = drafts
      .map((draft) => ({
        _id: draft._id || "",
        name: draft.name,
        propertyType: draft.propertyType,
        address: {
          city: draft.address?.city,
          state: draft.address?.state,
        },
        currentStep: draft.currentStep,
        currentSubstep: draft.currentSubstep,
        updatedAt: draft.updatedAt || new Date().toISOString(),
        images: draft.images,
      }))
      .filter((draft) => draft._id); // Only include drafts with valid IDs

    return (
      <Container flex={1} backgroundColor="background">
        <Header leftIcon="close" onLeftPress={() => router.back()} />
        <Container paddingHorizontal="lg" paddingTop="xl" flex={1}>
          <DraftSelectionStep
            drafts={mappedDrafts}
            onContinueDraft={(draft) => {
              // Find the original draft by ID
              const originalDraft = drafts.find((d) => d._id === draft._id);
              if (originalDraft) {
                handleContinueDraft(originalDraft);
              }
            }}
            onCreateNew={handleCreateNew}
            loading={loading}
          />
        </Container>
      </Container>
    );
  }

  // Determine current component for normal flow
  let CurrentComponent: React.ComponentType<any>;
  let componentProps: any = {};

  const isFirstStep = currentStep === 1 && currentSubstep === 0;
  const listingFlow = getListingFlow(t);
  const isLastStep =
    currentStep === listingFlow.steps.length &&
    currentSubstep === listingFlow.steps[currentStep - 1].substeps.length - 1;
  const isReviewStep = currentStep === 0;

  if (currentStep === -1) {
    CurrentComponent = SuccessStep;
    componentProps = { formData, isPublished: formData.status === "published" };
  } else if (currentStep === 0) {
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
    const currentStepData = listingFlow.steps[currentStep - 1];
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
    <Container flex={1} backgroundColor="background">
      <Header leftIcon="close" onLeftPress={handleSaveAndExit} />
      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Container paddingHorizontal="lg" paddingTop="xl">
          <CurrentComponent {...componentProps} />
        </Container>
      </ScrollView>

      {/* Progress Bar - positioned above navigation */}
      {currentStep > 0 && currentStep <= listingFlow.steps.length && (
        <ProgressBar currentStep={mainStep} totalSteps={3} />
      )}

      {/* Navigation */}
      {currentStep !== -1 && (
        <StepNavigation
          onNext={handleNext}
          onPrev={handleBack}
          onSubmit={isReviewStep ? handlePublish : undefined}
          onCancel={handleSaveAndExit}
          loading={loading}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isReviewStep={isReviewStep}
          hasErrors={Object.keys(errors).length > 0}
        />
      )}
    </Container>
  );
}

// Helper functions
async function loadUserDrafts(): Promise<ExtendedPropertyFormData[]> {
  try {
    // Get all properties for the current user and filter for drafts
    const properties = await PropertyManagementService.getHostProperties();
    const drafts = properties.filter(
      (property: any) => property.status === "draft"
    );
    return drafts.map((property: any) => mapPropertyToFormData(property));
  } catch (error) {
    console.error("Error loading user drafts:", error);
    return [];
  }
}

async function loadDraft(
  draftId: string
): Promise<ExtendedPropertyFormData | null> {
  try {
    const property = await PropertyManagementService.getProperty(draftId);
    return mapPropertyToFormData(property);
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
}

function mapPropertyToFormData(property: any): ExtendedPropertyFormData {
  return {
    ...property,
    _id: property._id,
    currentStep: property.currentStep,
    currentSubstep: property.currentSubstep,
    updatedAt: property.updatedAt,
  };
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl * 4, // Extra space for navigation and progress bar
  },
});
