/**
 * PropertyLocationDisplay - Reusable location text component for properties
 * Handles different location data structures and displays formatted location
 */

import React from "react";
import { TextStyle } from "react-native";
import { Text } from "@shared/components";
import { useTheme } from "@core/hooks";

export interface PropertyLocationDisplayProps {
  /** Modern address structure */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Legacy location string or object */
  location?: string | any;
  /** Legacy city prop */
  city?: string;
  /** Legacy country prop */
  country?: string;
  /** Custom text styles */
  style?: TextStyle;
  /** Size variant */
  variant?: "small" | "large";
  /** Number of lines to display */
  numberOfLines?: number;
  /** Text ellipsize mode */
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
}

const PropertyLocationDisplay: React.FC<PropertyLocationDisplayProps> = ({
  address,
  location,
  city,
  country,
  style,
  variant = "large",
  numberOfLines = 1,
  ellipsizeMode = "tail",
}) => {
  const { theme, isDark } = useTheme();

  const defaultColor = isDark ? theme.colors.gray[50] : theme.colors.gray[900];

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
      color={defaultColor}
      style={style}
    >
      {locationText}
    </Text>
  );
};

export default PropertyLocationDisplay;
