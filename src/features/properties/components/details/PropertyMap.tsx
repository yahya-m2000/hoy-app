import React, { useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { useTranslation } from "react-i18next";

import { Container, Text, Icon } from "@shared/components";
import { useTheme } from "@core/hooks/useTheme";
import { iconSize } from "@core/design";
import { handleGetDirectionsToProperty } from "../../utils/propertyUtils";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PropertyMapProps {
  coordinates: Coordinates;
  propertyName: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  onPress?: () => void;
  showToast?: (params: { message: string; type: "success" | "error" }) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  coordinates,
  propertyName,
  address,
  onPress,
  showToast,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mapError, setMapError] = useState<string | null>(null);

  // Format address for display
  const formatAddress = () => {
    if (!address) return "";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const displayAddress = formatAddress();

  // Check if coordinates are valid (not 0,0)
  const isValidCoordinates =
    coordinates.latitude !== 0 && coordinates.longitude !== 0;

  // Use fallback coordinates (New York) if invalid
  const mapCoordinates = isValidCoordinates
    ? coordinates
    : {
        latitude: 40.7589,
        longitude: -73.9851,
      };

  // Handle directions button press
  const handleDirectionsPress = () => {
    if (showToast) {
      handleGetDirectionsToProperty(coordinates, showToast, t);
    } else if (onPress) {
      onPress();
    }
  };

  // Debug logging
  console.log("PropertyMap Debug:", {
    originalCoordinates: coordinates,
    mapCoordinates,
    isValidCoordinates,
    propertyName,
    displayAddress,
    platform: Platform.OS,
  });

  return (
    <Container>
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom="md"
      >
        <Container flex={1}>
          <Text variant="h6" weight="semibold" color="primary">
            {t("property.locationTitle")}
          </Text>
          {displayAddress && (
            <Text variant="body" color="secondary" marginTop="sm">
              {displayAddress}
            </Text>
          )}
          {!isValidCoordinates && (
            <Text variant="caption" color="warning" marginTop="sm">
              Using default location (coordinates not available)
            </Text>
          )}
        </Container>
        <TouchableOpacity onPress={handleDirectionsPress}>
          <Container
            flexDirection="row"
            alignItems="center"
            backgroundColor="surface"
            paddingHorizontal="md"
            paddingVertical="sm"
            borderRadius="md"
          >
            <Container marginRight="sm">
              <Icon
                name="navigate-outline"
                size={iconSize.sm}
                color="primary"
              />
            </Container>
            <Text variant="body" weight="medium" color="primary">
              {t("property.getDirections")}
            </Text>
          </Container>
        </TouchableOpacity>
      </Container>

      <Container
        height={200}
        borderRadius="lg"
        backgroundColor="surface"
        overflow="hidden"
        marginBottom="md"
      >
        {mapError ? (
          <Container flex={1} alignItems="center" justifyContent="center">
            <Text variant="body" color="error">
              {mapError}
            </Text>
          </Container>
        ) : Platform.OS === "ios" ? (
          <AppleMaps.View
            style={{ flex: 1 }}
            cameraPosition={{
              coordinates: {
                latitude: mapCoordinates.latitude,
                longitude: mapCoordinates.longitude,
              },
              zoom: 15,
            }}
            annotations={[
              {
                id: "property-marker",
                coordinates: {
                  latitude: mapCoordinates.latitude,
                  longitude: mapCoordinates.longitude,
                },
                title: propertyName,
              },
            ]}
            onMapClick={(event) => {
              console.log("Apple Maps clicked:", event);
            }}
          />
        ) : Platform.OS === "android" ? (
          <GoogleMaps.View
            style={{ flex: 1 }}
            cameraPosition={{
              coordinates: {
                latitude: mapCoordinates.latitude,
                longitude: mapCoordinates.longitude,
              },
              zoom: 11,
            }}
            markers={[
              {
                id: "property-marker",
                coordinates: {
                  latitude: mapCoordinates.latitude,
                  longitude: mapCoordinates.longitude,
                },
                title: propertyName,
                snippet: displayAddress || undefined,
              },
            ]}
            onMapLoaded={() => {
              console.log("Google Maps loaded successfully");
            }}
            onMapClick={(event) => {
              console.log("Google Maps clicked:", event);
            }}
          />
        ) : (
          <Container flex={1} alignItems="center" justifyContent="center">
            <Text variant="body" color="secondary">
              {t("property.mapComingSoon")}
            </Text>
          </Container>
        )}
      </Container>

      <Container
        flexDirection="row"
        alignItems="center"
        marginTop="sm"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor="surface"
        borderRadius="md"
      >
        <Container marginRight="sm">
          <Icon name="location-outline" size={iconSize.sm} color="secondary" />
        </Container>
        <Container flex={1}>
          <Text variant="caption" color="secondary">
            {t("property.exactLocation")}
          </Text>
          <Text variant="body" weight="medium" color="primary">
            {coordinates.latitude.toFixed(6)},{" "}
            {coordinates.longitude.toFixed(6)}
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

export { PropertyMap };
export default PropertyMap;
