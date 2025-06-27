/**
 * PropertyImageContainer - Reusable image container component for property cards
 * Handles image display, fallback icons, and overlay buttons with robust error handling
 */

import React, { useState, useRef, useEffect } from "react";
import { ImageStyle, Animated, StyleSheet } from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { Container, Icon } from "@shared/components/base";

export interface PropertyImageContainerProps {
  /** Image source URI or array of URIs (uses first image) */
  imageUrl?: string;
  images?: string[];
  /** Custom container styles */
  containerStyle?: ViewStyle;
  /** Custom image styles */
  imageStyle?: ImageStyle;
  /** Image resize mode */
  resizeMode?:
    | "cover"
    | "contain"
    | "stretch"
    | "repeat"
    | "center" /** Children to render as overlays (e.g., wishlist button) */;
  children?: React.ReactNode;
  /** Variant size affects fallback icon size */
  variant?: "small" | "large" | "collection";
}

const PropertyImageContainer: React.FC<PropertyImageContainerProps> = ({
  imageUrl,
  images,
  containerStyle,
  imageStyle,
  resizeMode = "cover",
  children,
  variant = "large",
}) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Validate if a URL is legitimate
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string") return false;
    if (url.trim() === "") return false;

    // Basic URL validation - must start with http/https or be a valid URI
    const urlPattern = /^(https?:\/\/|data:image\/|file:\/\/|content:\/\/)/i;
    return urlPattern.test(url.trim());
  };
  // Determine the image source
  const getImageSource = () => {
    if (images && images.length > 0 && isValidImageUrl(images[0])) {
      return { uri: images[0] };
    }
    if (isValidImageUrl(imageUrl)) {
      return { uri: imageUrl };
    }
    return null;
  }; // Handle image load error
  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Handle image load start
  const handleImageLoadStart = () => {
    setImageLoadError(false);
  }; // Handle image load success
  const handleImageLoad = () => {
    setImageLoadError(false);
    // Fade in the image
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Reset states when image URL changes
  useEffect(() => {
    setImageLoadError(false);
    fadeAnim.setValue(0);
  }, [imageUrl, images, fadeAnim]); // Render fallback icon when no image is available
  const renderFallbackIcon = () => {
    const iconSize = variant === "small" ? 32 : 48;

    return (
      <Container
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            backgroundColor: theme.colors.gray[200],
          },
          containerStyle,
        ]}
      >
        <Icon
          name="home-outline"
          size={iconSize}
          color={theme.colors.gray[400]}
        />
      </Container>
    );
  };
  const imageSource = getImageSource();

  // Always show fallback icon first for immediate display
  return (
    <Container
      style={[
        {
          position: "relative",
          width: "100%",
          overflow: "hidden",
        },
        containerStyle,
      ]}
    >
      {/* Always show fallback icon as base layer */}
      {renderFallbackIcon()}
      {/* Overlay image when available and not failed */}
      {imageSource && !imageLoadError && (
        <Animated.Image
          source={imageSource}
          style={[
            {
              width: "100%",
              height: "100%",
            },
            imageStyle,
            StyleSheet.absoluteFill,
            { opacity: fadeAnim }, // Animated fade in
          ]}
          resizeMode={resizeMode}
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {children}
    </Container>
  );
};

export default PropertyImageContainer;
