import React, { useState } from "react";
import { TouchableOpacity } from "react-native";

import { Container, Text, Icon } from "@shared/components";
import { iconSize, spacing } from "@core/design";
import { t } from "i18next";

interface Amenity {
  name: string;
  icon?: string;
  available?: boolean;
}

interface AmenitiesGridProps {
  title?: string;
  amenities: Amenity[];
  maxVisible?: number;
}

// Icon mapping for common amenities (using outlined versions)
const AMENITY_ICONS: Record<string, string> = {
  wifi: "wifi-outline",
  pool: "water-outline",
  parking: "car-outline",
  kitchen: "restaurant-outline",
  gym: "fitness-outline",
  laundry: "shirt-outline",
  tv: "tv-outline",
  ac: "snow-outline",
  heating: "flame-outline",
  "pet-friendly": "paw-outline",
  smoking: "ban-outline",
  fireplace: "flame-outline",
  balcony: "home-outline",
  garden: "leaf-outline",
  elevator: "arrow-up-outline",
};

/**
 * AmenitiesGrid - Displays property amenities in a clean list format
 * Features: expandable list, outlined icon mapping, availability states
 * Matches the design pattern of HouseRulesSection
 */
const AmenitiesGrid: React.FC<AmenitiesGridProps> = ({
  title = t("home.whatThisPlaceOffers"),
  amenities,
  maxVisible = 6,
}) => {
  const [showAll, setShowAll] = useState(false);
  // Get appropriate outlined icon for amenity
  const getAmenityIcon = (amenity: Amenity): string => {
    // If amenity has a specific icon, ensure it's outlined
    if (amenity.icon) {
      return amenity.icon.endsWith("-outline")
        ? amenity.icon
        : `${amenity.icon}-outline`;
    }

    // Search through common amenity icons
    const lowerName = amenity.name.toLowerCase();
    for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
      if (lowerName.includes(key)) {
        return icon; // Already outlined from the mapping
      }
    }

    // Default fallback icon (outlined)
    return "checkmark-circle-outline";
  };

  const visibleAmenities = showAll ? amenities : amenities.slice(0, maxVisible);
  const shouldShowToggle = amenities.length > maxVisible;
  const renderAmenityItem = (amenity: Amenity, index: number) => {
    const isAvailable = amenity.available !== false;

    return (
      <Container
        key={index}
        flexDirection="row"
        alignItems="center"
        marginBottom="md"
      >
        <Icon
          name={getAmenityIcon(amenity) as any}
          size={iconSize.md}
          color={isAvailable ? "primary" : "secondary"}
          style={{ marginRight: spacing.md }}
        />
        <Text
          weight="normal"
          color="secondary"
          style={{
            textDecorationLine: isAvailable ? "none" : "line-through",
          }}
        >
          {amenity.name}
        </Text>
      </Container>
    );
  };
  return (
    <Container paddingVertical="md">
      <Text variant="h6">{title}</Text>

      <Container marginTop="md">
        {visibleAmenities.map(renderAmenityItem)}
      </Container>

      {shouldShowToggle && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
          <Text size="lg" weight="medium" color="primary">
            {showAll
              ? t("property.showLess")
              : t("property.showAll", { count: amenities.length })}
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
};

export { AmenitiesGrid };
export default AmenitiesGrid;
