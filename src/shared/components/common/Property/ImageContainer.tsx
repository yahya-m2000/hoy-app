/**
 * PropertyImageContainer - Reusable image container component for property cards
 * Handles image display, fallback icons, and overlay buttons
 */

import React from "react";
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from "react-native";
import { useTheme } from "src/shared/context";
import { spacing } from "src/shared/constants";
import { Icon } from "src/shared/components/base/Icon";

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

  // Check if property has images
  const hasImage = () => {
    return (images && images.length > 0 && images[0]) || imageUrl;
  };

  // Determine the image source
  const getImageSource = () => {
    if (images && images.length > 0 && images[0]) {
      return { uri: images[0] };
    }
    if (imageUrl) {
      return { uri: imageUrl };
    }
    return null;
  };

  // Render fallback icon when no image is available
  const renderFallbackIcon = () => {
    const iconSize = variant === "small" ? 32 : 48;

    return (
      <View
        style={[
          styles.fallbackContainer,
          containerStyle,
          { backgroundColor: theme.colors.gray[100] },
        ]}
      >
        <View
          style={[
            styles.fallbackIconWrapper,
            { backgroundColor: theme.colors.gray[200] },
          ]}
        >
          <Icon
            name="home-outline"
            size={iconSize}
            color={theme.colors.gray[400]}
          />
        </View>
      </View>
    );
  };

  const imageSource = getImageSource();

  if (!hasImage() || !imageSource) {
    return (
      <View style={[styles.container, containerStyle]}>
        {renderFallbackIcon()}
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={imageSource}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallbackContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  fallbackIconWrapper: {
    borderRadius: 50,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PropertyImageContainer;
