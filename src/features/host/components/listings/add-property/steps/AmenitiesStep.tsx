import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Container, Text, Icon } from "@shared/components";
import { PropertyFormData, AMENITIES } from "@core/types";
import { spacing, iconSize, radius } from "@core/design";
import { useTheme } from "@core/hooks";
import StepHeader from "../StepHeader";
import InfoBox from "../InfoBox";

interface AmenitiesStepProps {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: any) => void;
}

const getAmenityIcon = (amenity: string): any => {
  const iconMap: Record<string, any> = {
    WiFi: "wifi",
    Kitchen: "restaurant-outline",
    AC: "snow-outline",
    Heating: "flame-outline",
    TV: "tv-outline",
    Washer: "shirt-outline",
    Dryer: "leaf-outline",
    Parking: "car-outline",
    Pool: "water-outline",
    Gym: "barbell-outline",
    Balcony: "home-outline",
    Garden: "leaf-outline",
    "Smart TV": "tv-sharp",
    Netflix: "film-outline",
    Dishwasher: "disc-outline",
    Microwave: "keypad-outline",
    "Coffee Maker": "cafe-outline",
    "Hair Dryer": "cut-outline",
    Iron: "hardware-chip-outline",
    Workspace: "laptop-outline",
  };
  return iconMap[amenity] || "ellipse-outline";
};

// Internal component for a single amenity item
const AmenityItem = ({
  amenity,
  onPress,
  isSelected,
}: {
  amenity: string;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const { theme } = useTheme();
  const iconName = getAmenityIcon(amenity);

  return (
    <Container flex={1}>
      <TouchableOpacity onPress={onPress}>
        <Container
          padding="md"
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderRadius="md"
          borderColor={isSelected ? theme.primary : theme.border}
          backgroundColor={isSelected ? theme.primaryLight : theme.background}
          style={{ minHeight: 120 }}
        >
          {isSelected && (
            <Container
              style={{
                position: "absolute",
                top: spacing.xs,
                right: spacing.xs,
              }}
            >
              <Icon
                name="checkmark-circle"
                size={iconSize.md}
                color={theme.primary}
              />
            </Container>
          )}
          <Container
            width={48}
            height={48}
            borderRadius="circle"
            alignItems="center"
            justifyContent="center"
            backgroundColor={isSelected ? theme.primary : theme.secondaryLight}
            marginBottom="sm"
          >
            <Icon
              name={iconName}
              size={iconSize.lg}
              color={isSelected ? theme.white : theme.primary}
            />
          </Container>
          <Text
            variant="body"
            weight={isSelected ? "bold" : "normal"}
            color={isSelected ? theme.primary : theme.text.primary}
            align="center"
          >
            {amenity}
          </Text>
        </Container>
      </TouchableOpacity>
    </Container>
  );
};

// Main Step Component
export default function AmenitiesStep({
  formData,
  updateFormData,
}: AmenitiesStepProps) {
  const { t } = useTranslation();

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((item) => item !== amenity)
      : [...currentAmenities, amenity];
    updateFormData("amenities", updatedAmenities);
  };

  const chunkedAmenities = AMENITIES.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 2);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, [] as string[][]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Container paddingBottom="xxl">
        <StepHeader
          title={t("property.amenities.title")}
          description={t("property.amenities.description")}
        />

        <Container>
          {chunkedAmenities.map((amenityPair, index) => (
            <Container
              key={index}
              flexDirection="row"
              marginBottom="sm"
              style={{ gap: spacing.sm }}
            >
              {amenityPair.map((amenity) => (
                <AmenityItem
                  key={amenity}
                  amenity={amenity}
                  isSelected={formData.amenities.includes(amenity)}
                  onPress={() => toggleAmenity(amenity)}
                />
              ))}
              {amenityPair.length === 1 && (
                <Container flex={1}>
                  <></>
                </Container>
              )}
            </Container>
          ))}
        </Container>

        <Container alignItems="center" marginVertical="lg">
          <Text variant="body" color="secondary" weight="medium">
            {t("property.amenities.selectedCount", {
              count: formData.amenities.length,
            })}
          </Text>
        </Container>

        <InfoBox
          title={t("property.amenities.tipTitle")}
          content={t("property.amenities.tipContent")}
          icon="bulb-outline"
          variant="tip"
        />
      </Container>
    </ScrollView>
  );
}
