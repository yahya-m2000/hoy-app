/**
 * LocationDisplay - Reusable location text component
 * Handles different location data formats and fallbacks
 */

import React from "react";
import { TextStyle } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@shared/hooks/useTheme";

export interface LocationDisplayProps {
  /** New address structure */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Legacy props for backward compatibility */
  city?: string;
  country?: string;
  location?: string | any;
  /** Custom text styles */
  style?: TextStyle;
  /** Size variant */
  variant?: "small" | "large";
  /** Maximum number of lines */
  numberOfLines?: number;
  /** Ellipsize mode */
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
}

const LocationDisplay: React.FC<LocationDisplayProps> = ({
  address,
  city,
  country,
  location,
  style,
  variant = "large",
  numberOfLines = 1,
  ellipsizeMode = "tail",
}) => {
  const { theme, isDark } = useTheme();

  const textColor = isDark ? theme.colors.gray[50] : theme.colors.gray[900];

  // Format location for display using new address structure
  const getLocationDisplay = () => {
    // Use new address structure first
    if (address?.city && address?.country) {
      return `${address.city}, ${address.country}`;
    }

    if (address?.city && address?.state) {
      return `${address.city}, ${address.state}`;
    }

    if (address?.city) {
      return address.city;
    }

    // Fallback to legacy props for backward compatibility
    if (city && country) {
      return `${city}, ${country}`;
    }

    if (city) {
      return city;
    }

    // Handle legacy string location (for backward compatibility)
    if (typeof location === "string" && location.trim()) {
      return location;
    }

    // Handle legacy location object
    if (typeof location === "object" && location) {
      if (location.city && location.country) {
        return `${location.city}, ${location.country}`;
      }

      if (location.city) {
        return location.city;
      }

      // Handle nested address object in legacy structure
      if (location.address) {
        const addr = location.address;
        if (addr.city && addr.country) {
          return `${addr.city}, ${addr.country}`;
        }
        if (addr.city && addr.state) {
          return `${addr.city}, ${addr.state}`;
        }
        if (addr.city) {
          return addr.city;
        }
      }

      // Note: Don't try to render GeoJSON location objects directly
      // They have {type: "Point", coordinates: [lat, lng]} structure
    }

    return "Location not available";
  };

  const locationText = getLocationDisplay();
  return (
    <Text
      size={variant === "small" ? "xs" : "sm"}
      weight="semibold"
      color={textColor}
      style={style}
    >
      {locationText}
    </Text>
  );
};

export default LocationDisplay;
