import React, { useMemo, useCallback, useState } from "react";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
  useSegments,
} from "expo-router";
import { Modal, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { DetailScreen } from "@shared/components/base/Screen/ScreenPatterns";
import { Container } from "@shared/components/base/Container";
import { Text } from "@shared/components/base/Text";
import { Icon } from "@shared/components/base/Icon";
import { PropertyImage } from "@shared/components/base/PropertyImage";
import { Toast } from "@shared/components/base/Toast";
import type { PropertyType, ICheckInExperience } from "@shared/types/property";
import { useDateSelection } from "@shared/context/DateSelectionContext";
import {
  fetchPropertyById,
  fetchPropertyCheckInExperiences,
} from "@shared/services/api/properties";
import { useAuth } from "@shared/context/AuthContext";
import { useWishlist } from "@shared/hooks/useWishlist";
import { showAuthPrompt } from "@shared/utils";

// Import hooks from local details module
import { usePropertyDetails, usePropertyActions } from "../hooks";

// Import all property detail components from centralized location
import {
  PropertyTab,
  PolicyNavigationItem,
  SectionDivider,
  PropertyHeader,
  CheckInDatesSection,
  ExperienceCard,
  PropertyDescription,
  AmenitiesGrid,
  HouseRulesSection,
  PropertyImageCarousel,
  HostInfoSection,
} from "../components";

// Import modal components
import {
  AvailabilityCalendarModal,
  CancellationPolicyModal,
  DateSelectionModal,
  HouseRulesModal,
  SafetyPropertyModal,
} from "../modals";

// Import property components modals
import { CollectionsModal } from "../../components/Modals";

// Import reservation components
import { ReservationModal, useReservationModal } from "../../reservation";

/**
 * PropertyDetailsScreen - Displays detailed property information
 * Features: images, ratings, amenities, booking options, and modular sections
 */
const PropertyDetailsScreen = () => {
  // Hooks
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const segments = useSegments();
  const { propertyDates } = useDateSelection();

  // Property data parsing
  const propertyParam = params.property as string;

  const initialProperty: PropertyType | null = useMemo(() => {
    if (!propertyParam) {
      console.warn("PropertyDetailsScreen: No property parameter provided");
      return null;
    }
    try {
      const parsed = JSON.parse(propertyParam);

      if (!parsed || typeof parsed !== "object" || !parsed._id) {
        console.error(
          "PropertyDetailsScreen: Invalid property data format or missing _id"
        );
        return null;
      }

      return parsed as PropertyType;
    } catch (error) {
      console.error(
        "PropertyDetailsScreen: Failed to parse property parameter:",
        error
      );
      return null;
    }
  }, [propertyParam]);

  // Data fetching
  const { data: property, refetch: refetchProperty } = useQuery({
    queryKey: ["property", initialProperty?._id],
    queryFn: () => {
      if (!initialProperty?._id) {
        throw new Error("Property ID is required");
      }
      return fetchPropertyById(initialProperty._id);
    },
    enabled: !!initialProperty?._id,
    initialData: initialProperty,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch check-in experiences
  const { data: checkInExperiences } = useQuery({
    queryKey: ["checkInExperiences", property?._id],
    queryFn: () => {
      if (!property?._id) {
        throw new Error("Property ID is required");
      }
      return fetchPropertyCheckInExperiences(property._id);
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // For debugging purposes
  React.useEffect(() => {
    if (checkInExperiences) {
      console.log("Fetched checkInExperiences:", checkInExperiences);
      console.log("Property checkInExperiences:", property?.checkInExperiences);
    }
  }, [checkInExperiences, property?.checkInExperiences]);

  // Focus effect - refetch when returning from review screen
  useFocusEffect(
    useCallback(() => {
      const shouldRefetch = segments.some((segment) =>
        segment.includes("review")
      );
      if (shouldRefetch && property?._id) {
        refetchProperty();
      }
    }, [property?._id, refetchProperty, segments])
  ); // Custom hooks
  const propertyDetailsResult = usePropertyDetails(property);
  const propertyActionsResult = usePropertyActions(property);

  // Reservation modal hook
  const {
    reservationModalProps,
    openReservationModal,
    isReservationModalVisible,
    closeReservationModal,
  } = useReservationModal({
    property,
  });

  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastCollectionName, setToastCollectionName] = useState("");
  const [toastAction, setToastAction] = useState<"added" | "removed">("added");

  // Modal handlers
  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  // Collections modal handlers
  const handleShowCollections = () => setShowCollectionsModal(true);
  const handleCloseCollections = () => setShowCollectionsModal(false);
  const handleCollectionToggle = async (
    collectionId: string,
    isAdded: boolean
  ) => {
    console.log(
      `Property ${property?._id} ${
        isAdded ? "added to" : "removed from"
      } collection ${collectionId}`
    );

    // Find the collection name
    const collection = collections.find((c) => c._id === collectionId);
    const collectionName = collection?.name || "collection";

    if (isAdded) {
      showToast("Added to collection", "success", collectionName, "added");
      // Close collections modal after adding
      setTimeout(() => {
        handleCloseCollections();
      }, 500);
    } else {
      showToast(
        "Removed from collection",
        "success",
        collectionName,
        "removed"
      );
    }
  };

  // Wishlist/Favorite handlers
  const { isAuthenticated } = useAuth();
  const { isPropertyWishlisted, removeFromWishlist, collections } =
    useWishlist();

  const isFavorited = property?._id
    ? isPropertyWishlisted(property._id)
    : false;

  // Toast helper function
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
    collectionName?: string,
    action?: "added" | "removed"
  ) => {
    setToastType(type);
    setToastCollectionName(collectionName || "");
    setToastAction(action || "added");
    setToastVisible(true);
  };

  // Hide toast
  const hideToast = () => {
    setToastVisible(false);
  };

  const handleFavorite = async () => {
    if (!property?._id) return;

    if (!isAuthenticated) {
      showAuthPrompt({
        title: "Sign in Required",
        message: "You need to sign in to save properties to your wishlist.",
      });
      return;
    }

    if (isFavorited) {
      // Property is already wishlisted - remove it directly
      try {
        await removeFromWishlist.mutateAsync(property._id);
        showToast("Removed from wishlist", "success", "Favorites", "removed");
      } catch {
        showToast(
          "Failed to remove from wishlist",
          "error",
          "Favorites",
          "removed"
        );
      }
    } else {
      // Property is not wishlisted - show collections modal
      handleShowCollections();
    }
  }; // Data extraction - safely destructure with fallbacks
  const {
    host = null,
    selectedDates = null,
    nights = 0,
  } = propertyDetailsResult || {};

  const { handleReserve = () => {} } = propertyActionsResult || {};

  // Ensure selectedDates always has a fallback value for components
  const safeSelectedDates = selectedDates || { startDate: null, endDate: null };

  // Validation
  const isValidProperty =
    property && property._id && typeof property === "object";

  // Helper function to get property price
  const getPropertyPrice = (): number => {
    if (!property?.price) return 0;

    if (typeof property.price === "object" && "amount" in property.price) {
      return property.price.amount || 0;
    }

    if (typeof property.price === "number") {
      return property.price;
    }

    return 0;
  };

  // Helper function to convert old amenities format to new format
  const transformAmenities = (amenities: any[]) => {
    return amenities.map((amenity) => ({
      name: typeof amenity === "string" ? amenity : amenity.name || "Unknown",
      icon: typeof amenity === "object" ? amenity.icon : undefined,
      available:
        typeof amenity === "object" ? amenity.available !== false : true,
    }));
  };

  // Updated code
  // Process check-in experiences:
  // 1. Use data from dedicated API endpoint if available
  // 2. Fall back to property.checkInExperiences if API data is not available
  // 3. Ensure default empty array if both sources are missing
  const experiences = useMemo(() => {
    // First try to use the dedicated API response
    if (Array.isArray(checkInExperiences) && checkInExperiences.length > 0) {
      console.log("Using checkInExperiences from API response");
      return checkInExperiences;
    }

    // Then fall back to experiences embedded in property data
    if (
      Array.isArray(property?.checkInExperiences) &&
      property.checkInExperiences.length > 0
    ) {
      console.log("Using checkInExperiences from property object");
      return property.checkInExperiences;
    }

    // Return empty array as last resort
    console.log("No check-in experiences found, using empty array");
    return [];
  }, [checkInExperiences, property?.checkInExperiences]);

  // Use real data for house rules
  const houseRules =
    property?.houseRules?.additionalRules?.map((rule) => ({
      text: rule,
      icon: "info",
    })) || [];

  // Map host data from backend response
  const hostInfo = useMemo(() => {
    if (!property?.host) {
      return undefined;
    }

    if (typeof property.host === "string") {
      return undefined;
    }

    // Get phone number from property first, then fallback to host object
    const phoneNumber = property.phone || property.host.phoneNumber;

    return {
      name:
        `${property.host.firstName || ""} ${
          property.host.lastName || ""
        }`.trim() || "Host",
      avatar: property.host.profileImage,
      totalReviews: property.host.totalReviews || 0,
      averageRating: property.host.rating || 0,
      yearsHosting: property.host.hostingYears || 0,
      location:
        property.host.location ||
        (property.address
          ? `${property.address.city}, ${property.address.country}`
          : undefined),
      phoneNumber: phoneNumber,
      whatsappNumber: phoneNumber,
    };
  }, [property?.host, property?.address, property?.phone]);

  // Event handlers
  const handleShowReviews = () => {
    if (!property?._id) {
      return;
    }

    // Get the current tab context from segments
    const currentTab = segments.find((segment) =>
      ["home", "properties", "search", "wishlist", "bookings"].includes(segment)
    );

    if (currentTab) {
      // Navigate to reviews within the same tab context
      router.push(
        `/(tabs)/traveler/${currentTab}/property/reviews/${property._id}`
      );
    } else {
      // Fallback to relative navigation
      router.push(`../reviews/${property._id}`);
    }
  };

  // Loading state
  if (!isValidProperty && initialProperty) {
    return (
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Text color="primary">Loading property details...</Text>
      </Container>
    );
  }

  // Error state
  if (!isValidProperty) {
    return (
      <Container
        flex={1}
        backgroundColor="background"
        justifyContent="center"
        alignItems="center"
      >
        <Text color="primary">{t("property.propertyNotFound")}</Text>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor="background">
      <DetailScreen
        title=""
        showFavorite
        isFavorited={isFavorited}
        onFavorite={handleFavorite}
        loading={!isValidProperty && !!initialProperty}
        error={
          !isValidProperty && !initialProperty
            ? t("property.propertyNotFound")
            : null
        }
        style={{ paddingBottom: 80 }}
      >
        <Container height={300}>
          <PropertyImageCarousel property={property} />
        </Container>
        <Container
          paddingHorizontal="lg"
          backgroundColor="background"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          <PropertyHeader
            title={property?.name || "Property"}
            host={
              host
                ? {
                    name:
                      `${host.firstName || ""} ${host.lastName || ""}`.trim() ||
                      "Host",
                    avatar: host.profileImage || host.avatarUrl,
                  }
                : undefined
            }
            rating={property?.rating || 0}
            reviewCount={property?.reviewCount || 0}
            onShowReviews={handleShowReviews}
          />
          <CheckInDatesSection
            checkIn={{
              date: safeSelectedDates.startDate,
              time: "15:00",
            }}
            checkOut={{
              date: safeSelectedDates.endDate,
              time: "12:00",
            }}
            onPress={() => openModal("dateSelection")}
          />
          <SectionDivider />
          <Container>
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={index}
                title={experience.title}
                description={experience.description}
                icon={experience.icon}
              />
            ))}
          </Container>
          <SectionDivider />
          <PropertyDescription
            description={property?.description || "No description available."}
          />
          <SectionDivider />
          <AmenitiesGrid
            amenities={transformAmenities(property?.amenities || [])}
          />
          <SectionDivider />
          <HostInfoSection host={hostInfo} />
          {/* <SectionDivider />
          <HouseRulesSection rules={houseRules} /> */}
          <SectionDivider />
          <Container>
            <PolicyNavigationItem
              icon="calendar-outline"
              title={t("property.availability")}
              subtitle={t("property.checkAvailableDates")}
              onPress={() => openModal("availability")}
            />
            <PolicyNavigationItem
              icon="close-circle-outline"
              title={t("property.cancellationPolicy")}
              subtitle={t("property.moderateCancellationPolicy")}
              onPress={() => openModal("cancellation")}
            />
            <PolicyNavigationItem
              icon="home-outline"
              title={t("property.houseRules")}
              subtitle={t("property.checkInAfter")}
              onPress={() => openModal("houseRules")}
            />
            <PolicyNavigationItem
              icon="shield-outline"
              title={t("property.safetyAndProperty")}
              subtitle={t("property.safetyInformation")}
              onPress={() => openModal("safety")}
            />
          </Container>
          {/* Bottom spacing */}
          <Container height={20}>{null}</Container>
        </Container>
      </DetailScreen>

      {/* Toast positioned above the fixed bottom tab */}
      <View
        style={{
          position: "absolute",
          bottom: 100, // Position above the PropertyTab (80px + 20px margin)
          left: 0,
          right: 0,
          zIndex: 9999, // Higher z-index to ensure it appears above everything
        }}
        pointerEvents="none" // Allow touches to pass through when toast is not visible
      >
        <Toast
          visible={toastVisible}
          onHide={hideToast}
          showCloseButton={false}
        >
          {/* Custom toast content with property image and collection info */}
          <Container flexDirection="row" alignItems="center">
            {/* Property Image */}
            <Container marginRight="md">
              <PropertyImage
                uri={property?.images?.[0]}
                size={40}
                borderRadius="md"
              />
            </Container>

            {/* Content */}
            <Container flex={1}>
              <Text variant="body" weight="medium" color="primary">
                {toastAction === "added"
                  ? `Added to ${toastCollectionName}`
                  : `Removed from ${toastCollectionName}`}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {property?.name || property?.title || "Property"}
              </Text>
            </Container>

            {/* Success/Error Icon */}
            <Container marginLeft="sm">
              <Icon
                name={
                  toastType === "success" ? "checkmark-circle" : "close-circle"
                }
                size={20}
                color={toastType === "success" ? "success" : "error"}
              />
            </Container>
          </Container>
        </Toast>
      </View>

      {/* Fixed bottom tab */}
      <Container
        backgroundColor="surface"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        borderTopLeftRadius="lg"
        borderTopRightRadius="lg"
      >
        <PropertyTab
          price={getPropertyPrice()}
          totalPrice={nights > 0 ? getPropertyPrice() * nights : undefined}
          selectedDates={safeSelectedDates}
          propertyId={property?._id}
          onReserve={() => handleReserve(propertyDates, openReservationModal)}
          onDateSelectionPress={() => openModal("dateSelection")}
        />
      </Container>
      {/* Modal Presentations */}
      <Modal
        visible={activeModal === "availability"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <AvailabilityCalendarModal
          propertyId={property?._id}
          onClose={closeModal}
        />
      </Modal>
      <Modal
        visible={activeModal === "cancellation"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <CancellationPolicyModal
          propertyId={property?._id}
          onClose={closeModal}
        />
      </Modal>
      <Modal
        visible={activeModal === "houseRules"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <HouseRulesModal propertyId={property?._id} onClose={closeModal} />
      </Modal>
      <Modal
        visible={activeModal === "safety"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafetyPropertyModal propertyId={property?._id} onClose={closeModal} />
      </Modal>
      <Modal
        visible={activeModal === "dateSelection"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <DateSelectionModal propertyId={property?._id} onClose={closeModal} />
      </Modal>

      {/* Collections Modal */}
      <CollectionsModal
        visible={showCollectionsModal}
        propertyId={property?._id}
        onClose={handleCloseCollections}
        onCollectionToggle={handleCollectionToggle}
      />

      {/* Reservation Modal */}
      <Modal
        visible={isReservationModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeReservationModal}
      >
        <ReservationModal {...reservationModalProps} />
      </Modal>
    </Container>
  );
};

export default PropertyDetailsScreen;
