/**
 * Base Image component for the Hoy application
 * Provides consistent image rendering with fallback support
 */

// React imports
import React, { useState } from "react";

// React Native imports
import { Image as RNImage, StyleSheet } from "react-native";

// Types
import { BaseImageProps } from "./Image.types";

const Image: React.FC<BaseImageProps> = ({
  source,
  style,
  resizeMode = "cover",
  width,
  height,
  borderRadius,
  fallback,
  onLoad,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSource = hasError && fallback ? fallback : source;

  return (
    <RNImage
      source={
        typeof imageSource === "string" ? { uri: imageSource } : imageSource
      }
      style={[
        styles.image,
        width && { width },
        height && { height },
        borderRadius && { borderRadius },
        style,
      ]}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    // Base styles
  },
});

export default Image;
