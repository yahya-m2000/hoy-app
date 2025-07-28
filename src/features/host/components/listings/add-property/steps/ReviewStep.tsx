import React from "react";
import { ScrollView, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { Container, Text, Icon } from "@shared/components";
import { PropertyFormData } from "@core/types";
import { spacing, iconSize, radius } from "@core/design";
import { useTheme } from "@core/hooks";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";

interface ReviewStepProps {
  formData: PropertyFormData;
  isEditMode: boolean;
}

// Property Overview Card Component
const PropertyOverviewCard = ({ formData }: { formData: PropertyFormData }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const address = `${formData.address?.street || ""}, ${
    formData.address?.city || ""
  }, ${formData.address?.state || ""} ${formData.address?.postalCode || ""}, ${
    formData.address?.country || ""
  }`;

  return (
    <Container
      padding="lg"
      borderRadius="lg"
      backgroundColor="surface"
      borderWidth={1}
      borderColor={theme.border}
    >
      <Container flexDirection="row" style={{ gap: spacing.md }}>
        {formData.images && formData.images.length > 0 && (
          <Image
            source={{ uri: formData.images[0] }}
            style={{
              width: 80,
              height: 80,
              borderRadius: radius.md,
              backgroundColor: theme.border,
            }}
            resizeMode="cover"
          />
        )}

        <Container flex={1}>
          <Container marginBottom="xs">
            <Text variant="h6" weight="semibold" color="primary">
              {formData.name || t("features.property.listing.details.noName")}
            </Text>
          </Container>

          <Container marginBottom="xs">
            <Text variant="body" color="secondary">
              {formData.propertyType?.charAt(0).toUpperCase() +
                formData.propertyType?.slice(1) || ""}{" "}
              • {formData.type || ""}
            </Text>
          </Container>

          <Container marginBottom="sm">
            <Text variant="body" color="secondary">
              {address}
            </Text>
          </Container>

          <Container
            flexDirection="row"
            style={{ gap: spacing.md }}
            marginBottom="sm"
          >
            <Container
              flexDirection="row"
              alignItems="center"
              style={{ gap: spacing.xs }}
            >
              <Icon
                name="bed-outline"
                size={iconSize.sm}
                color={theme.text.secondary}
              />
              <Text variant="body" color="secondary">
                {formData.bedrooms || 0}{" "}
                {t(`property.${formData.bedrooms === 1 ? "bed" : "beds"}`)}
              </Text>
            </Container>

            <Container
              flexDirection="row"
              alignItems="center"
              style={{ gap: spacing.xs }}
            >
              <Icon
                name="water-outline"
                size={iconSize.sm}
                color={theme.text.secondary}
              />
              <Text variant="body" color="secondary">
                {formData.bathrooms || 0}{" "}
                {t(`property.${formData.bathrooms === 1 ? "bath" : "baths"}`)}
              </Text>
            </Container>

            <Container
              flexDirection="row"
              alignItems="center"
              style={{ gap: spacing.xs }}
            >
              <Icon
                name="people-outline"
                size={iconSize.sm}
                color={theme.text.secondary}
              />
              <Text variant="body" color="secondary">
                {formData.maxGuests || 0}{" "}
                {t(`property.${formData.maxGuests === 1 ? "guest" : "guests"}`)}
              </Text>
            </Container>
          </Container>

          <Container flexDirection="row" alignItems="baseline">
            <Text variant="h5" weight="bold" color="primary">
              ${String(formData.price || 0)}
            </Text>
            <Container marginLeft="xs">
              <Text variant="body" color="secondary">
                {t("features.property.listing.pricing.perNight")}
              </Text>
            </Container>
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

// Amenities Section Component
const AmenitiesSection = ({ amenities }: { amenities: string[] }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!amenities || amenities.length === 0) return null;

  return (
    <Container
      padding="lg"
      borderRadius="lg"
      backgroundColor="surface"
      borderWidth={1}
      borderColor={theme.border}
    >
      <Container marginBottom="md">
        <Text variant="h6" weight="semibold" color="primary">
          {t("features.property.listing.amenities.title")} ({amenities.length})
        </Text>
      </Container>

      <Container
        flexDirection="row"
        flexWrap="wrap"
        style={{ gap: spacing.sm }}
      >
        {amenities.map((amenity, index) => (
          <Container
            key={index}
            paddingHorizontal="sm"
            paddingVertical="xs"
            borderRadius="md"
            backgroundColor={theme.primaryLight}
          >
            <Text variant="body" weight="medium" color="primary">
              {amenity}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  );
};

// Photos Section Component
const PhotosSection = ({ images }: { images: string[] }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 6);
  const remainingCount = images.length - 6;

  return (
    <Container
      padding="lg"
      borderRadius="lg"
      backgroundColor="surface"
      borderWidth={1}
      borderColor={theme.border}
    >
      <Container marginBottom="md">
        <Text variant="h6" weight="semibold" color="primary">
          {t("features.property.listing.images.title")} ({images.length})
        </Text>
      </Container>

      <Container
        flexDirection="row"
        flexWrap="wrap"
        style={{ gap: spacing.sm }}
      >
        {displayImages.map((imageUri, index) => (
          <Container key={index} style={{ position: "relative", width: "32%" }}>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: 60,
                borderRadius: radius.sm,
                backgroundColor: theme.border,
              }}
              resizeMode="cover"
            />
            {index === 0 && (
              <Container
                style={{
                  position: "absolute",
                  top: spacing.xs,
                  left: spacing.xs,
                }}
                paddingHorizontal="xs"
                paddingVertical="xxs"
                borderRadius="sm"
                backgroundColor="success"
              >
                <Text variant="caption" weight="semibold" color="white">
                  {t("features.property.listing.images.main")}
                </Text>
              </Container>
            )}
          </Container>
        ))}

        {remainingCount > 0 && (
          <Container
            style={{
              width: "32%",
              height: 60,
              backgroundColor: theme.border,
              borderRadius: radius.sm,
            }}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="caption" weight="medium" color="secondary">
              +{remainingCount} {t("features.property.listing.images.showAll")}
            </Text>
          </Container>
        )}
      </Container>
    </Container>
  );
};

export default function ReviewStep({ formData, isEditMode }: ReviewStepProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Container paddingBottom="xxl">
        <StepHeader
          title={t("features.property.listing.steps.review.title")}
          description={t("features.property.listing.steps.review.description")}
        />

        {/* Property Overview */}
        <Container marginBottom="lg">
          <Container marginBottom="md">
            <Text variant="h6" weight="semibold" color="primary">
              {t("features.property.listing.steps.review.overview")}
            </Text>
          </Container>
          <PropertyOverviewCard formData={formData} />
        </Container>

        {/* Description */}
        {formData.description && (
          <Container marginBottom="lg">
            <Container marginBottom="md">
              <Text variant="h6" weight="semibold" color="primary">
                {t("features.property.listing.steps.description.title")}
              </Text>
            </Container>
            <Container
              padding="lg"
              borderRadius="lg"
              backgroundColor="surface"
              borderWidth={1}
              borderColor={theme.border}
            >
              <Text variant="body" color="secondary">
                {formData.description}
              </Text>
            </Container>
          </Container>
        )}

        {/* Amenities */}
        <Container marginBottom="lg">
          <AmenitiesSection amenities={formData.amenities || []} />
        </Container>

        {/* Photos */}
        <Container marginBottom="lg">
          <PhotosSection images={formData.images || []} />
        </Container>

        <InfoBox
          title={t("features.property.listing.steps.review.readyTo", {
            action: isEditMode
              ? t("features.property.listing.steps.review.update")
              : t("features.property.listing.steps.review.publish"),
          })}
          content={
            isEditMode
              ? t("features.property.listing.steps.review.updateMessage")
              : t("features.property.listing.steps.review.publishMessage")
          }
        />
      </Container>
    </ScrollView>
  );
}
