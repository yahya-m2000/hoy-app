/**
 * Property Image Component
 * A reusable component for displaying property images with fallback icon
 * Uses the same fallback pattern as PropertyCard and PropertyImageCarousel
 */

import React, { useState } from "react";
import {
  Image,
  ImageStyle,
  ViewStyle,
  StyleSheet,
  DimensionValue,
} from "react-native";
import { Container } from "../../layout";
import { Icon } from "../../base/Icon";
import { useTheme } from "src/core/hooks/useTheme";

// Size variants for different use cases
export type PropertyImageSize =
  | "xs" // 24px - for small icons
  | "sm" // 40px - default, for avatars and small previews
  | "md" // 80px - for medium previews
  | "lg" // 120px - for list items
  | "xl" // 180px - for cards
  | "2xl" // 240px - for large previews
  | "full"; // 100% width/height - for responsive layouts

interface PropertyImageProps {
  uri?: string;
  size?: PropertyImageSize | number; // Support both variants and custom sizes
  borderRadius?: "sm" | "md" | "lg" | "xl";
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  width?: DimensionValue; // For custom width
  height?: DimensionValue; // For custom height
  fill?: boolean; // NEW: fill parent container
}

export type { PropertyImageProps };

// Size mapping for variants
const SIZE_VARIANTS: Record<PropertyImageSize, number> = {
  xs: 24,
  sm: 40,
  md: 80,
  lg: 120,
  xl: 180,
  "2xl": 240,
  full: 0, // Special case for responsive layouts
};

export const PropertyImage: React.FC<PropertyImageProps> = ({
  uri,
  size = "sm",
  borderRadius = "md",
  style,
  containerStyle,
  resizeMode = "cover",
  width,
  height,
  fill,
}) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Calculate dimensions
  const getDimensions = (): {
    width: DimensionValue;
    height: DimensionValue;
  } => {
    // If custom width/height are provided, use those
    if (width || height) {
      return {
        width: width || (typeof height === "number" ? height : 40),
        height: height || (typeof width === "number" ? width : 40),
      };
    }

    // If size is a number, use it directly
    if (typeof size === "number") {
      return { width: size, height: size };
    }

    // If size is a variant
    const variantSize = SIZE_VARIANTS[size];

    // Special case for 'full' - use container dimensions
    if (size === "full") {
      return { width: "100%", height: "100%" };
    }

    return { width: variantSize, height: variantSize };
  };

  const dimensions = getDimensions();
  const isSquare =
    typeof dimensions.width === "number" &&
    typeof dimensions.height === "number" &&
    dimensions.width === dimensions.height;
  const iconSize = isSquare
    ? (dimensions.width as number) * 0.4
    : Math.min(dimensions.width as number, dimensions.height as number) * 0.4;

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
            width: dimensions.width,
            height: dimensions.height,
          },
        ]}
        justifyContent="center"
        alignItems="center"
      >
        <Icon
          name="home-outline"
          size={iconSize}
          color={theme.colors.gray[400]}
        />
      </Container>
    );
  };

  const hasValidImage = isValidImageUrl(uri) && !imageLoadError;

  // If custom dimensions are provided, render without outer container to fill parent
  if (width || height) {
    return (
      <>
        {hasValidImage ? (
          <Image
            source={{ uri: uri! }}
            style={[
              {
                width: dimensions.width,
                height: dimensions.height,
                borderRadius:
                  borderRadius === "sm"
                    ? 4
                    : borderRadius === "md"
                    ? 8
                    : borderRadius === "lg"
                    ? 12
                    : borderRadius === "xl"
                    ? 16
                    : 8,
                overflow: "hidden",
              },
              style,
            ]}
            resizeMode={resizeMode}
            onError={() => {
              console.warn("Failed to load property image:", uri);
              setImageLoadError(true);
            }}
          />
        ) : (
          <Container
            style={[
              styles.fallbackContainer,
              {
                backgroundColor: theme.colors.gray[200],
                width: dimensions.width,
                height: dimensions.height,
                borderRadius:
                  borderRadius === "sm"
                    ? 4
                    : borderRadius === "md"
                    ? 8
                    : borderRadius === "lg"
                    ? 12
                    : borderRadius === "xl"
                    ? 16
                    : 8,
              },
            ]}
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              name="home-outline"
              size={iconSize}
              color={theme.colors.gray[400]}
            />
          </Container>
        )}
      </>
    );
  }

  // If fill is true, fill parent container
  if (fill) {
    return (
      <>
        {hasValidImage ? (
          <Image
            source={{ uri: uri! }}
            style={[
              {
                flex: 1,
                width: "100%",
                height: "100%",
                alignSelf: "stretch",
                borderRadius:
                  borderRadius === "sm"
                    ? 4
                    : borderRadius === "md"
                    ? 8
                    : borderRadius === "lg"
                    ? 12
                    : borderRadius === "xl"
                    ? 16
                    : 8,
                overflow: "hidden",
              },
              style,
            ]}
            resizeMode={resizeMode}
            onError={() => {
              console.warn("Failed to load property image:", uri);
              setImageLoadError(true);
            }}
          />
        ) : (
          <Container
            style={[
              styles.fallbackContainer,
              {
                flex: 1,
                width: "100%",
                height: "100%",
                alignSelf: "stretch",
                backgroundColor: theme.colors.gray[200],
                borderRadius:
                  borderRadius === "sm"
                    ? 4
                    : borderRadius === "md"
                    ? 8
                    : borderRadius === "lg"
                    ? 12
                    : borderRadius === "xl"
                    ? 16
                    : 8,
              },
            ]}
            justifyContent="center"
            alignItems="center"
          >
            <Icon
              name="home-outline"
              size={iconSize}
              color={theme.colors.gray[400]}
            />
          </Container>
        )}
      </>
    );
  }

  // Default behavior with outer container for size variants
  return (
    <Container
      width={dimensions.width}
      height={dimensions.height}
      borderRadius={borderRadius}
      style={[
        { overflow: "hidden" },
        ...(containerStyle ? [containerStyle] : []),
      ]}
    >
      {hasValidImage ? (
        <Image
          source={{ uri: uri! }}
          style={[
            { width: dimensions.width, height: dimensions.height },
            style,
          ]}
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
