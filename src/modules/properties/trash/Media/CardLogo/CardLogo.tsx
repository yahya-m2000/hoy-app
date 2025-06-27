/**
 * Card Logo Component with fallback for the Hoy application
 * Used to display payment card logos with graceful fallback to text-based logos
 */

import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@shared/hooks/useTheme";

import { getCardLogoSource } from "@shared/utils/asset";
// Constants
import { fontSize, spacing, radius, fontWeight } from "@shared/constants";

interface CardLogoProps {
  brand: string;
  size?: "small" | "medium" | "large";
}

const CardLogo: React.FC<CardLogoProps> = ({ brand, size = "medium" }) => {
  const { theme, isDark } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageError, setImageError] = useState(false);

  // Generate different background colors based on card brand
  const getBrandColor = () => {
    if (!brand) return theme.colors.gray[600];

    switch (brand.toLowerCase()) {
      case "visa":
        return "#1A1F71"; // Visa blue
      case "mastercard":
        return "#EB001B"; // Mastercard red
      case "amex":
      case "american express":
        return "#006FCF"; // Amex blue
      case "discover":
        return "#FF6600"; // Discover orange
      default:
        return isDark ? theme.colors.gray[700] : theme.colors.gray[300];
    }
  };

  // Generate text based on card brand
  const getBrandText = () => {
    if (!brand) return "CC";

    switch (brand.toLowerCase()) {
      case "visa":
        return "VI";
      case "mastercard":
        return "MC";
      case "american express":
        return "AX";
      case "amex":
        return "AX";
      case "discover":
        return "DS";
      default:
        return brand.substring(0, 2).toUpperCase();
    }
  };
  // Get dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 30, height: 20 };
      case "large":
        return { width: 60, height: 40 };
      case "medium":
      default:
        return { width: 40, height: 25 };
    }
  };

  const dimensions = getDimensions();

  // Use our safe asset helper to get the logo
  const logoSource = getCardLogoSource(brand);

  // If we have a valid logo source, try to render it
  if (logoSource) {
    return (
      <Image
        source={logoSource}
        style={[styles.logo, dimensions]}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  }

  // Otherwise use our text fallback
  return (
    <View
      style={[
        styles.textLogoContainer,
        {
          backgroundColor: getBrandColor(),
          width: dimensions.width,
          height: dimensions.height,
        },
      ]}
    >
      <Text style={styles.textLogoText}>{getBrandText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
  },
  textLogoContainer: {
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  textLogoText: {
    color: "white",
    fontWeight: "bold",
    fontSize: fontSize.sm,
  },
});

export default CardLogo;
