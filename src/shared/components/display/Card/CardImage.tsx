/**
 * Card Image component
 * Handles image display within cards with fallback for broken/invalid URLs
 */

import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "src/core/hooks/useTheme";
import { radius } from "@core/design";
import { CardImageProps } from "./types";
import { Icon } from "../../base/Icon";

export const CardImage: React.FC<CardImageProps> = ({
  imageUrl,
  images,
  style,
  containerStyle,
  resizeMode = "cover",
  placeholder,
  overlay,
  aspectRatio = 1,
}) => {
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Validate if a URL is legitimate
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string") return false;
    if (url.trim() === "") return false;

    // Basic URL validation - must start with http/https or be a valid URI
    const urlPattern = /^(https?:\/\/|data:image\/|file:\/\/|content:\/\/)/i;
    return urlPattern.test(url.trim());
  };

  // Get the primary image URL and validate it
  const primaryImageUrl =
    imageUrl || (images && images.length > 0 ? images[0] : undefined);

  const hasValidImage = isValidImageUrl(primaryImageUrl) && !imageLoadError;

  // Handle image load error
  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Reset error state when image URL changes
  React.useEffect(() => {
    setImageLoadError(false);
  }, [primaryImageUrl]);

  // Render placeholder
  const renderPlaceholder = () =>
    placeholder || (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: theme.colors.gray[200] },
        ]}
      >
        <Icon name="home-outline" size={32} color={theme.colors.gray[400]} />
      </View>
    );

  return (
    <View style={[styles.container, { aspectRatio }, containerStyle]}>
      {hasValidImage ? (
        <Image
          source={{ uri: primaryImageUrl }}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onError={handleImageError}
        />
      ) : (
        renderPlaceholder()
      )}
      {overlay && <View style={styles.overlay}>{overlay}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.lg,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.lg,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CardImage;
