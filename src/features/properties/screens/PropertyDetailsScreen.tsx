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

import {
  DetailScreen,
  Container,
  Text,
  Icon,
  PropertyImage,
  Toast,
} from "@shared/components";
import type { PropertyType } from "@core/types";
import { useCalendarDateSelection } from "@features/calendar/context/CalendarContext";
import { useCalendar } from "@features/calendar/hooks/useCalendar";
import { getPropertyById } from "@core/api/services/property";
import { useAuth } from "@core/context/AuthContext";
import { useWishlistState } from "@features/properties/context/PropertyContext";

// Import hooks from local details module
import { usePropertyDetails } from "@features/properties/hooks/usePropertyDetails";
import { usePropertyActions } from "@features/properties/hooks/usePropertyActions";

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
  PropertyMap,
} from "../components/details";

// Import modal components
import {
  AvailabilityCalendarModal,
  CancellationPolicyModal,
  DateSelectionModal,
  HouseRulesModal,
  SafetyPropertyModal,
} from "@features/properties/modals/modals";

// Import property components modals
import CollectionsModal from "@features/properties/modals/collections/CollectionsModal";

// Import reservation components
import ReservationModal from "@features/properties/components/reservation/modals/ReservationModal";
import { useReservationModal } from "@features/properties/hooks/useReservationModal";
import { showAuthPrompt } from "@core/auth/utils";

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
  const { propertyDates } = useCalendarDateSelection();
  // Global selected dates as fallback
  const { selectedDates: globalSelectedDates } = useCalendar();

  // State for forcing re-renders when dates change
  const [dateSelectionKey, setDateSelectionKey] = useState(0);

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
      return getPropertyById(initialProperty._id);
    },
    enabled: !!initialProperty?._id,
    initialData: initialProperty,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Get selected dates from calendar context for this specific property
  const selectedDates = useMemo(() => {
    if (!property?._id) {
      console.log("PropertyDetailsScreen: No property ID available");
      return { startDate: null, endDate: null };
    }

    console.log(
      "PropertyDetailsScreen: Calculating selected dates for property:",
      property._id
    );
    console.log(
      "PropertyDetailsScreen: propertyDates Map size:",
      propertyDates.size
    );
    console.log(
      "PropertyDetailsScreen: All property dates keys:",
      Array.from(propertyDates.keys())
    );

    const propDates = propertyDates.get(property._id)?.selectedDates;
    console.log("PropertyDetailsScreen: Property-specific dates:", propDates);

    if (propDates && (propDates.startDate || propDates.endDate)) {
      console.log("PropertyDetailsScreen: Using property-specific dates:", {
        startDate: propDates.startDate?.toISOString(),
        endDate: propDates.endDate?.toISOString(),
      });
      return {
        startDate: propDates.startDate || null,
        endDate: propDates.endDate || null,
      };
    }

    // Fallback to global selected dates if property-specific dates are missing
    console.log(
      "PropertyDetailsScreen: No property-specific dates, checking global dates"
    );
    console.log(
      "PropertyDetailsScreen: Global selected dates:",
      globalSelectedDates
    );

    if (globalSelectedDates && globalSelectedDates.length > 0) {
      if (globalSelectedDates.length === 1) {
        console.log(
          "PropertyDetailsScreen: Using single global date:",
          globalSelectedDates[0].toISOString()
        );
        return { startDate: globalSelectedDates[0], endDate: null };
      }
      if (globalSelectedDates.length === 2) {
        console.log("PropertyDetailsScreen: Using global date range:", {
          startDate: globalSelectedDates[0].toISOString(),
          endDate: globalSelectedDates[1].toISOString(),
        });
        return {
          startDate: globalSelectedDates[0],
          endDate: globalSelectedDates[1],
        };
      }
    }

    console.log("PropertyDetailsScreen: No dates found, returning null");
    return { startDate: null, endDate: null };
  }, [property?._id, propertyDates, globalSelectedDates, dateSelectionKey]);

  // Calculate nights from selected dates
  const nights = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return 0;
    const diffTime = Math.abs(
      selectedDates.endDate.getTime() - selectedDates.startDate.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [selectedDates]);

  // Use property's embedded check-in experiences
  const checkInExperiences = property?.checkInExperiences || [];

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
  );

  // Custom hooks
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
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastCollectionName, setToastCollectionName] = useState("");
  const [toastAction, setToastAction] = useState<"added" | "removed">("added");

  // Modal handlers
  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  // Collections modal handlers
  const handleShowCollections = () =>
    showCollectionsModalAction(property?._id || "");
  const handleCloseCollections = () => hideCollectionsModal();
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
    const collection = collections.find((c: any) => c._id === collectionId);
    const collectionName = collection?.name || t("common.collection");

    if (isAdded) {
      showToast(
        t("common.addedToCollection"),
        "success",
        collectionName,
        "added"
      );
      // Close collections modal after adding
      setTimeout(() => {
        handleCloseCollections();
      }, 500);
    } else {
      showToast(
        t("common.removedFromCollection"),
        "success",
        collectionName,
        "removed"
      );
    }
  };

  // Wishlist/Favorite handlers
  const { isAuthenticated } = useAuth();
  const {
    isPropertyWishlisted,
    removeFromWishlist,
    collections,
    showCollectionsModalAction,
    hideCollectionsModal,
    showCollectionsModal: showCollectionsModalState,
  } = useWishlistState();

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

  // Wrapper function for PropertyMap toast
  const showMapToast = (params: {
    message: string;
    type: "success" | "error";
  }) => {
    showToast(params.message, params.type);
  };

  // Hide toast
  const hideToast = () => {
    setToastVisible(false);
  };

  const handleFavorite = async (e?: any) => {
    if (!property?._id) return;
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      // Show authentication prompt
      showAuthPrompt({
        title: t("common.signInRequired"),
        message: t("common.signInRequiredMessage"),
      });
      return;
    }

    if (isFavorited) {
      // Property is already wishlisted - remove it directly
      try {
        await removeFromWishlist(property._id);
        showToast(
          t("common.removedFromWishlist"),
          "success",
          t("common.favorites"),
          "removed"
        );
      } catch {
        showToast(
          t("common.failedToRemoveFromWishlist"),
          "error",
          t("common.favorites"),
          "removed"
        );
      }
    } else {
      // Property is not wishlisted - show collections modal
      handleShowCollections();
    }
  };

  // Data extraction - safely destructure with fallbacks
  const { host = null } = propertyDetailsResult || {};

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
      name:
        typeof amenity === "string"
          ? amenity
          : amenity.name || t("common.unknown"),
      icon: typeof amenity === "object" ? amenity.icon : undefined,
      available:
        typeof amenity === "object" ? amenity.available !== false : true,
    }));
  };

  // Process check-in experiences
  const experiences = useMemo(() => {
    // First try to use the dedicated API response
    if (Array.isArray(checkInExperiences) && checkInExperiences.length > 0) {
      return checkInExperiences;
    }

    // Then fall back to experiences embedded in property data
    if (
      Array.isArray(property?.checkInExperiences) &&
      property.checkInExperiences.length > 0
    ) {
      return property.checkInExperiences;
    }

    // Return empty array as last resort
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
        }`.trim() || t("common.host"),
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
  }, [property?.host, property?.address, property?.phone, t]);

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
        <Text variant="body" color="primary">
          {t("common.loading")}
        </Text>
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
        <Text variant="body" color="primary">
          {t("property.errors.notFound")}
        </Text>
      </Container>
    );
  }

  return (
    <Container flex={1} backgroundColor="background">
      <DetailScreen
        title=""
        showFavorite
        isFavorited={isFavorited}
        onFavorite={() => handleFavorite(null)}
        loading={!isValidProperty && !!initialProperty}
        error={
          !isValidProperty && !initialProperty
            ? t("property.errors.notFound")
            : null
        }
        style={{ paddingBottom: 80 }}
      >
        <Container height={300}>
          <PropertyImageCarousel property={property} />
        </Container>
        <Container
          paddingHorizontal="md"
          backgroundColor="background"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          <PropertyHeader
            title={property?.name || t("common.property")}
            host={
              host
                ? {
                    name:
                      `${host.firstName || ""} ${host.lastName || ""}`.trim() ||
                      t("common.host"),
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
            {experiences.map((experience: any, index: number) => (
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
            description={
              property?.description || t("property.noDescriptionAvailable")
            }
          />
          <SectionDivider />
          <AmenitiesGrid
            amenities={transformAmenities(property?.amenities || [])}
          />
          <SectionDivider />
          <HostInfoSection host={hostInfo} />
          <SectionDivider />
          {property?.coordinates && (
            <PropertyMap
              coordinates={property.coordinates}
              propertyName={property?.name || t("common.property")}
              address={property?.address}
              showToast={showMapToast}
            />
          )}
          <SectionDivider />
          <Container>
            <PolicyNavigationItem
              icon="calendar-outline"
              title={t("property.common.availability")}
              subtitle={t("property.common.checkAvailableDates")}
              onPress={() => openModal("availability")}
            />
            <PolicyNavigationItem
              icon="close-circle-outline"
              title={t("property.pricing.cancellationPolicy")}
              subtitle={t("property.pricing.moderateCancellationPolicy")}
              onPress={() => openModal("cancellation")}
            />
            <PolicyNavigationItem
              icon="home-outline"
              title={t("property.pricing.houseRules")}
              subtitle={t("property.common.checkinAfter")}
              onPress={() => openModal("houseRules")}
            />
            <PolicyNavigationItem
              icon="shield-outline"
              title={t("property.details.safetyAndProperty")}
              subtitle={t("property.details.safetyInformation")}
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
          bottom: 100,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
        pointerEvents="none"
      >
        <Toast
          visible={toastVisible}
          onHide={hideToast}
          showCloseButton={false}
        >
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
                  ? t("common.addedToCollectionWithName", {
                      name: toastCollectionName,
                    })
                  : t("common.removedFromCollectionWithName", {
                      name: toastCollectionName,
                    })}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1}>
                {property?.name || property?.title || t("common.property")}
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
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Container
          backgroundColor="surface"
          borderTopLeftRadius="lg"
          borderTopRightRadius="lg"
        >
          <PropertyTab
            price={getPropertyPrice()}
            totalPrice={nights > 0 ? getPropertyPrice() * nights : undefined}
            selectedDates={safeSelectedDates}
            propertyId={property?._id}
            onReserve={() => {
              console.log("PropertyDetailsScreen: Reserve button pressed");
              console.log(
                "PropertyDetailsScreen: Current propertyDates:",
                propertyDates
              );
              console.log(
                "PropertyDetailsScreen: Current selectedDates:",
                safeSelectedDates
              );
              console.log("PropertyDetailsScreen: Property ID:", property?._id);

              // Debug: Test manual date storage
              if (property?._id) {
                const testDates = {
                  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                };
                console.log(
                  "PropertyDetailsScreen: Testing manual date storage:",
                  testDates
                );
                // This would be called by the calendar context
                // selectDatesForProperty(property._id, testDates);
              }

              handleReserve(propertyDates, openReservationModal);
            }}
            onDateSelectionPress={() => openModal("dateSelection")}
          />
        </Container>
      </View>

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
        visible={showCollectionsModalState}
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
