import React, { useState, useMemo } from "react";
import { Modal, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import {
  DetailScreen,
  Container,
  Text,
  Icon,
  Toast,
  Tab,
  Button,
} from "@shared/components";
import { useTheme } from "@core/hooks";
import { formatCurrency } from "@core/utils/data/currency";
import { Property } from "@core/types/property.types";
import { iconSize, radius, spacing } from "@core/design";

// Import all property detail components from centralized location
import {
  PropertyTab,
  SectionDivider,
  PropertyHeader,
  ExperienceCard,
  PropertyDescription,
  AmenitiesGrid,
  HouseRulesSection,
  PropertyImageCarousel,
  HostInfoSection,
  PolicyNavigationItem,
} from "@features/properties/components/details";

// Modal imports
import {
  AvailabilityCalendarModal,
  CancellationPolicyModal,
  HouseRulesModal,
  SafetyPropertyModal,
} from "@features/properties/modals/modals";

interface HostPropertyDetailsScreenProps {
  property: Property;
  onEdit?: () => void;
  showEdit?: boolean;
}

// Host-specific property tab component
const HostPropertyTab: React.FC<{
  monthlyPotential: number;
  currency: string;
  onAnalytics: () => void;
  onEdit?: () => void;
}> = ({ monthlyPotential, currency, onAnalytics, onEdit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Tab>
      <Container flex={1} flexDirection="column" justifyContent="center">
        <Text variant="caption" color="secondary">
          {t("property.monthlyPotential")}
        </Text>
        <Text variant="h6" weight="bold">
          {formatCurrency(monthlyPotential, currency)}
        </Text>
      </Container>
      <Container flexDirection="row">
        <Button
          title={t("property.analytics")}
          onPress={onAnalytics}
          variant="primary"
          size="medium"
          radius="circle"
        />
      </Container>
    </Tab>
  );
};

export default function HostPropertyDetailsScreen({
  property,
  onEdit,
  showEdit = true,
}: HostPropertyDetailsScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal handlers
  const openModal = (modalType: string) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  // Toast helper function
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Hide toast
  const hideToast = () => {
    setToastVisible(false);
  };

  // Host info
  const hostInfo = useMemo(() => {
    if (!property.host || typeof property.host === "string") {
      return undefined;
    }

    const phoneNumber = property.phone || property.host.phoneNumber;

    return {
      name:
        `${property.host.firstName || ""} ${
          property.host.lastName || ""
        }`.trim() || t("property.host"),
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
  }, [property.host, property.address, property.phone]);

  // Amenities transformation
  const transformAmenities = (amenities: any[]) => {
    return amenities.map((amenity) => ({
      name:
        typeof amenity === "string"
          ? amenity
          : amenity.name || t("property.unknown"),
      icon: typeof amenity === "object" ? amenity.icon : undefined,
      available:
        typeof amenity === "object" ? amenity.available !== false : true,
    }));
  };

  // Experiences
  const experiences = property.checkInExperiences || [];

  // Property status
  const getStatus = () => {
    if (property.status === "draft")
      return { text: t("property.draft"), color: "warning" as const };
    return property.isActive
      ? { text: t("property.active"), color: "success" as const }
      : { text: t("property.inactive"), color: "error" as const };
  };
  const status = getStatus();

  // House rules for display
  const houseRules =
    property.houseRules?.additionalRules?.map((rule) => ({
      text: rule,
      icon: "info",
    })) || [];

  // Helper function to get property price
  const getPropertyPrice = (): number => {
    if (!property.price) return 0;

    if (typeof property.price === "object" && "amount" in property.price) {
      return property.price.amount || 0;
    }

    if (typeof property.price === "number") {
      return property.price;
    }

    return 0;
  };

  // Calculate monthly potential
  const calculateMonthlyPotential = () => {
    const weekdayPrice = property.weekdayPrice || getPropertyPrice();
    const weekendPrice = property.weekendPrice || getPropertyPrice();

    // Assume 20 weekdays and 10 weekend days per month with 70% occupancy
    return (weekdayPrice * 20 + weekendPrice * 10) * 0.7;
  };

  // Host action handlers
  const handleAnalytics = () => {
    console.log("View analytics");
  };

  return (
    <Container flex={1} backgroundColor="background">
      <DetailScreen
        title=""
        showEdit={showEdit}
        onEdit={onEdit}
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
          {/* Property Header */}
          <PropertyHeader
            title={property.name || t("property.defaultName")}
            host={hostInfo}
            rating={property.rating || 0}
            reviewCount={property.reviewCount || 0}
          />

          {/* Property Status */}
          <Container
            flexDirection="row"
            alignItems="center"
            marginTop="sm"
            marginBottom="md"
          >
            <Text variant="body" color="secondary">
              {t("property.label")}&nbsp;
            </Text>
            <Text variant="body" weight="medium" color={status.color}>
              {status.text}
            </Text>
            {property.isFeatured && (
              <>
                <Container marginLeft="md">
                  <Text variant="body" color="secondary">
                    •&nbsp;
                  </Text>
                </Container>
                <Icon name="star" size={iconSize.sm} color="warning" />
                <Container marginLeft="xs">
                  <Text variant="body" color="secondary">
                    {t("property.featured")}
                  </Text>
                </Container>
              </>
            )}
          </Container>

          {/* Property Stats */}
          <Container flexDirection="row" alignItems="center" marginBottom="md">
            {/* Bedrooms */}
            <Container flexDirection="row" alignItems="center">
              <Icon name="bed-outline" size={iconSize.md} color="secondary" />
              <Container marginLeft="xs">
                <Text variant="body" color="secondary">
                  {property.bedrooms}&nbsp;
                  {property.bedrooms === 1
                    ? t("property.bedroom")
                    : t("property.bedrooms")}
                </Text>
              </Container>
            </Container>

            <Container marginLeft="lg">
              <Container>{null}</Container>
            </Container>

            {/* Bathrooms */}
            <Container flexDirection="row" alignItems="center">
              <Icon name="water-outline" size={iconSize.md} color="secondary" />
              <Container marginLeft="xs">
                <Text variant="body" color="secondary">
                  {property.bathrooms}&nbsp;
                  {property.bathrooms === 1
                    ? t("property.bath")
                    : t("property.baths")}
                </Text>
              </Container>
            </Container>

            <Container marginLeft="lg">
              <Container>{null}</Container>
            </Container>

            {/* Guests */}
            <Container flexDirection="row" alignItems="center">
              <Icon
                name="people-outline"
                size={iconSize.md}
                color="secondary"
              />
              <Container marginLeft="xs">
                <Text variant="body" color="secondary">
                  {property.maxGuests} {t("property.guests")}
                </Text>
              </Container>
            </Container>
          </Container>

          <SectionDivider />

          {/* Pricing Section */}
          <Container>
            <Container marginBottom="md">
              <Text variant="h6" weight="medium">
                {t("pricing.title")}
              </Text>
            </Container>
            <Container>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                marginBottom="sm"
              >
                <Text variant="body" color="secondary">
                  {t("property.weekdayPrice")}
                </Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(
                    property.weekdayPrice || getPropertyPrice(),
                    property.currency
                  )}{" "}
                  / {t("property.night")}
                </Text>
              </Container>
              <Container flexDirection="row" justifyContent="space-between">
                <Text variant="body" color="secondary">
                  {t("property.weekendPrice")}
                </Text>
                <Text variant="body" weight="medium">
                  {formatCurrency(
                    property.weekendPrice || getPropertyPrice(),
                    property.currency
                  )}{" "}
                  / {t("property.night")}
                </Text>
              </Container>
            </Container>

            {/* Active Discounts */}
            {(property.discounts?.newListingPromo ||
              property.discounts?.lastMinuteDiscount) && (
              <Container
                marginTop="md"
                padding="sm"
                backgroundColor="surface"
                borderRadius="md"
              >
                <Container marginBottom="xs">
                  <Text variant="caption" weight="medium" color="primary">
                    {t("property.activeDiscounts")}
                  </Text>
                </Container>
                {property.discounts.newListingPromo && (
                  <Container flexDirection="row" alignItems="center">
                    <Icon
                      name="pricetag-outline"
                      size={iconSize.sm}
                      color="success"
                    />
                    <Container marginLeft="xs">
                      <Text variant="caption" color="secondary">
                        {t("property.newListingDiscount")}
                      </Text>
                    </Container>
                  </Container>
                )}
                {property.discounts.lastMinuteDiscount && (
                  <Container
                    flexDirection="row"
                    alignItems="center"
                    marginTop="xs"
                  >
                    <Icon
                      name="time-outline"
                      size={iconSize.sm}
                      color="success"
                    />
                    <Container marginLeft="xs">
                      <Text variant="caption" color="secondary">
                        {t("property.lastMinuteDiscount")}
                      </Text>
                    </Container>
                  </Container>
                )}
              </Container>
            )}
          </Container>

          <SectionDivider />

          {/* Check-in Experiences */}
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

          {/* Description */}
          <PropertyDescription
            description={
              property.description || t("property.noDescriptionAvailable")
            }
          />

          <SectionDivider />

          {/* Amenities */}
          <AmenitiesGrid
            amenities={transformAmenities(property.amenities || [])}
          />

          <SectionDivider />

          {/* Host Info */}
          <HostInfoSection host={hostInfo} />

          <SectionDivider />

          {/* House Rules */}
          <HouseRulesSection rules={houseRules} />

          <SectionDivider />

          {/* Property Management */}
          <Container>
            <PolicyNavigationItem
              icon="calendar-outline"
              title={t("property.manageAvailability")}
              subtitle={t("property.updateCalendarAndPricing")}
              onPress={() => openModal("availability")}
            />
            <PolicyNavigationItem
              icon="clipboard-outline"
              title={t("property.viewBookings")}
              subtitle={`${property.reviewCount || 0} ${t(
                "property.totalBookings"
              )}`}
              onPress={() => console.log("View bookings")}
            />
            <PolicyNavigationItem
              icon="close-circle-outline"
              title={t("property.cancellationPolicy")}
              subtitle={
                property.cancellationPolicy?.policyType ||
                t("property.moderate")
              }
              onPress={() => openModal("cancellation")}
            />
            <PolicyNavigationItem
              icon="home-outline"
              title={t("property.houseRules")}
              subtitle={`${t("property.common.checkIn")}: ${
                property.houseRules?.checkInTime?.from || "15:00"
              } - ${property.houseRules?.checkInTime?.to || "22:00"}`}
              onPress={() => openModal("houseRules")}
            />
            <PolicyNavigationItem
              icon="shield-outline"
              title={t("property.safetyAndProperty")}
              subtitle={t("property.details.safetyInformation")}
              onPress={() => openModal("safety")}
            />
          </Container>

          {/* Property Details */}
          <SectionDivider />
          <Container>
            <Container marginBottom="md">
              <Text variant="h6" weight="medium">
                {t("property.propertyDetails")}
              </Text>
            </Container>
            <Container>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                marginBottom="xs"
              >
                <Text variant="body" color="secondary">
                  {t("property.propertyType")}
                </Text>
                <Text variant="body">{property.propertyType}</Text>
              </Container>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                marginBottom="xs"
              >
                <Text variant="body" color="secondary">
                  {t("property.guestAccess")}
                </Text>
                <Text variant="body">
                  {property.guestAccessType
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </Container>
              <Container
                flexDirection="row"
                justifyContent="space-between"
                marginBottom="xs"
              >
                <Text variant="body" color="secondary">
                  {t("property.hostType")}
                </Text>
                <Text variant="body">
                  {property.hostType?.charAt(0).toUpperCase() +
                    property.hostType?.slice(1)}
                </Text>
              </Container>
              <Container flexDirection="row" justifyContent="space-between">
                <Text variant="body" color="secondary">
                  {t("property.totalBeds")}
                </Text>
                <Text variant="body">{property.beds}</Text>
              </Container>
            </Container>
          </Container>

          {/* Bottom spacing */}
          <Container height={100}>{null}</Container>
        </Container>
      </DetailScreen>

      {/* Toast positioned above the fixed bottom tab */}
      <Container
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <Toast
          visible={toastVisible}
          onHide={hideToast}
          showCloseButton={false}
        >
          <Container flexDirection="row" alignItems="center">
            <Container flex={1}>
              <Text variant="body" weight="medium" color="primary">
                {toastMessage}
              </Text>
            </Container>
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
      </Container>

      {/* Fixed bottom tab */}
      <Container
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <HostPropertyTab
          monthlyPotential={calculateMonthlyPotential()}
          currency={property.currency}
          onAnalytics={handleAnalytics}
          onEdit={onEdit}
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
    </Container>
  );
}
