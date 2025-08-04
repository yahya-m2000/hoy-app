/**
 * PropertyDetailsContent - Real content components that mirror PropertyDetailsSkeletons exactly
 * Matches exact dimensions and layout of skeleton components for seamless transitions
 */

import React from "react";
import { Dimensions } from "react-native";
import { Container } from "@shared/components/layout";
import { useTheme } from "@core/hooks/useTheme";
import {
  PropertyHeader,
  CheckInDatesSection,
  PropertyDescription,
  AmenitiesGrid,
  PolicyNavigationItem,
  PropertyImageCarousel,
  HostInfoSection,
  PropertyMap,
  SectionDivider,
  ExperienceCard,
} from "./index";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface PropertyDetailsContentProps {
  property: any;
  host: any;
  safeSelectedDates: any;
  experiences: any[];
  hostInfo: any;
  transformedAmenities: any[];
  onShowReviews: () => void;
  onOpenModal: (modalType: string) => void;
  onShowMapToast: (params: {
    message: string;
    type: "success" | "error";
  }) => void;
  showImageCarousel?: boolean;
}

/**
 * PropertyImageCarouselContent - Matches PropertyImageCarouselSkeleton dimensions
 */
export const PropertyImageCarouselContent: React.FC<{ property: any }> = ({
  property,
}) => {
  return (
    <Container
      style={{
        width: "100%",
        height: (screenHeight * 1) / 2.5, // Match skeleton height exactly
        position: "relative",
      }}
    >
      <PropertyImageCarousel property={property} />
    </Container>
  );
};

/**
 * PropertyHeaderContent - Matches PropertyHeaderSkeleton layout
 */
export const PropertyHeaderContent: React.FC<{
  property: any;
  host: any;
  onShowReviews: () => void;
  t: (key: string, params?: any) => string;
}> = ({ property, host, onShowReviews, t }) => {
  return (
    <Container>
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
        onShowReviews={onShowReviews}
      />
    </Container>
  );
};

/**
 * CheckInDatesSectionContent - Matches CheckInDatesSectionSkeleton layout
 */
export const CheckInDatesSectionContent: React.FC<{
  safeSelectedDates: any;
  openModal: (modalType: string) => void;
}> = ({ safeSelectedDates, openModal }) => {
  return (
    <Container>
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
    </Container>
  );
};

/**
 * PropertyDescriptionContent - Matches PropertyDescriptionSkeleton layout
 */
export const PropertyDescriptionContent: React.FC<{
  property: any;
  t: (key: string, params?: any) => string;
}> = ({ property, t }) => {
  return (
    <Container paddingVertical="md">
      <PropertyDescription
        description={
          property?.description ||
          t("features.property.details.common.defaults.noDescriptionAvailable")
        }
      />
    </Container>
  );
};

/**
 * AmenitiesGridContent - Matches AmenitiesGridSkeleton layout
 */
export const AmenitiesGridContent: React.FC<{
  amenities: any[];
}> = ({ amenities }) => {
  return (
    <Container paddingVertical="md">
      <AmenitiesGrid amenities={amenities} />
    </Container>
  );
};

/**
 * PolicyNavigationContent - Matches PolicyNavigationSkeleton layout
 */
export const PolicyNavigationContent: React.FC<{
  openModal: (modalType: string) => void;
  t: (key: string, params?: any) => string;
}> = ({ openModal, t }) => {
  return (
    <Container>
      <PolicyNavigationItem
        icon="calendar-outline"
        title={t("features.property.details.policies.availability")}
        subtitle={t("features.property.details.policies.checkAvailableDates")}
        onPress={() => openModal("availability")}
      />
      <PolicyNavigationItem
        icon="close-circle-outline"
        title={t("features.property.details.policies.cancellationPolicy")}
        subtitle={t(
          "features.property.details.policies.moderateCancellationPolicy"
        )}
        onPress={() => openModal("cancellation")}
      />
      <PolicyNavigationItem
        icon="home-outline"
        title={t("features.property.details.policies.houseRules")}
        subtitle={t("features.property.details.policies.checkinAfter")}
        onPress={() => openModal("houseRules")}
      />
      <PolicyNavigationItem
        icon="shield-outline"
        title={t("features.property.details.policies.safetyAndProperty")}
        subtitle={t("features.property.details.policies.safetyInformation")}
        onPress={() => openModal("safety")}
      />
    </Container>
  );
};

/**
 * Main PropertyDetailsContent component combining all content - mirrors PropertyDetailsSkeletons exactly
 */
const PropertyDetailsContent: React.FC<PropertyDetailsContentProps> = ({
  property,
  host,
  safeSelectedDates,
  experiences,
  hostInfo,
  transformedAmenities,
  onShowReviews,
  onOpenModal,
  onShowMapToast,
  showImageCarousel = true,
}) => {
  const { theme } = useTheme();

  return (
    <Container flex={1} backgroundColor={theme.background}>
      {/* Image carousel content */}
      {showImageCarousel && (
        <Container height={300}>
          <PropertyImageCarouselContent property={property} />
        </Container>
      )}

      {/* Content area */}
      <Container
        paddingHorizontal="md"
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
          onShowReviews={onShowReviews}
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
          onPress={() => onOpenModal("dateSelection")}
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
            property?.description ||
            "No description available"
          }
        />
        <SectionDivider />
        <AmenitiesGrid
          amenities={transformedAmenities}
        />
        <SectionDivider />
        <HostInfoSection host={hostInfo} />
        <SectionDivider />
        {property?.coordinates && (
          <PropertyMap
            coordinates={property.coordinates}
            propertyName={property?.name || "Property"}
            address={property?.address}
            showToast={onShowMapToast}
          />
        )}
        <SectionDivider />
        <Container>
          <PolicyNavigationItem
            icon="calendar-outline"
            title="Availability"
            subtitle="Check available dates"
            onPress={() => onOpenModal("availability")}
          />
          <PolicyNavigationItem
            icon="close-circle-outline"
            title="Cancellation Policy"
            subtitle="Moderate cancellation policy"
            onPress={() => onOpenModal("cancellation")}
          />
          <PolicyNavigationItem
            icon="home-outline"
            title="House Rules"
            subtitle="Check-in after 3:00 PM"
            onPress={() => onOpenModal("houseRules")}
          />
          <PolicyNavigationItem
            icon="shield-outline"
            title="Safety & Property"
            subtitle="Safety information"
            onPress={() => onOpenModal("safety")}
          />
        </Container>
        {/* Bottom spacing */}
        <Container height={20}>{null}</Container>
      </Container>
    </Container>
  );
};

export default PropertyDetailsContent;
