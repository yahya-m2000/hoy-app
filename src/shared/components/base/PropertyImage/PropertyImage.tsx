/**
 * Property Image Component
 * A reusable component for displaying property images with fallback icon
 * Uses the same fallback pattern as PropertyCard and PropertyImageCarousel
 */

import React, { useState } from "react";
import { Image, ImageStyle, ViewStyle, StyleSheet } from "react-native";
import { Container } from "../Container";
import { Icon } from "../Icon";
import { useTheme } from "@shared/hooks/useTheme";

interface PropertyImageProps {
  uri?: string;
  size?: number;
  borderRadius?: "sm" | "md" | "lg" | "xl";
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

export type { PropertyImageProps };

export const PropertyImage: React.FC<PropertyImageProps> = ({
  uri,
  size = 40,
  borderRadius = "md",
  style,
  containerStyle,
  resizeMode = "cover",
}) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Validate if URI is legitimate
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string") return false;
    if (url.trim() === "") return false;

    // Basic URL validation - must start with http/https or be a valid URI
    const urlPattern = /^(https?:\/\/|data:image\/|file:\/\/|content:\/\/)/i;
    return urlPattern.test(url.trim());
  };

  // Renders fallback icon when no image is available
  const renderFallbackIcon = () => {
    return (
      <Container
        style={[
          styles.fallbackContainer,
          {
            backgroundColor: theme.colors.gray[200],
            width: size,
            height: size,
          },
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Icon
          name="home-outline"
          size={size * 0.4} // Scale icon to 40% of container size
          color={theme.colors.gray[400]}
        />
      </Container>
    );
  };

  const hasValidImage = isValidImageUrl(uri) && !imageLoadError;

  return (
    <Container
      width={size}
      height={size}
      borderRadius={borderRadius}
      style={[
        { overflow: "hidden" },
        ...(containerStyle ? [containerStyle] : []),
      ]}
    >
      {hasValidImage ? (
        <Image
          source={{ uri: uri! }}
          style={[{ width: size, height: size }, style]}
          resizeMode={resizeMode}
          onError={() => {
            console.warn("Failed to load property image:", uri);
            setImageLoadError(true);
          }}
        />
      ) : (
        renderFallbackIcon()
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
