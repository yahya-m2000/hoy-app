/**
 * PropertyCollectionPreview - Grid layout component for collection property images
 * Handles different image counts and loading states
 */

import React from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { useTheme } from "src/shared/context";
import { spacing, fontSize } from "src/shared/constants";
import { Icon } from "src/shared/components/base/Icon";

export interface PropertyCollectionPreviewProps {
  /** Collection data */
  collection?: {
    name: string;
    propertyCount: number;
    previewImages: string[];
    isLoading?: boolean;
  };
  /** Custom container styles */
  style?: any;
}

const PropertyCollectionPreview: React.FC<PropertyCollectionPreviewProps> = ({
  collection,
  style,
}) => {
  const { theme } = useTheme();

  if (!collection) return null;

  const { previewImages, isLoading } = collection;

  if (isLoading) {
    return (
      <View
        style={[
          styles.previewContainer,
          { backgroundColor: theme.surface },
          style,
        ]}
      >
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: theme.text.disabled },
          ]}
        >
          <Icon name="image-outline" size={24} color={theme.text.secondary} />
        </View>
      </View>
    );
  }

  if (previewImages.length === 0) {
    return (
      <View
        style={[
          styles.previewContainer,
          { backgroundColor: theme.surface },
          style,
        ]}
      >
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.text.disabled },
          ]}
        >
          <Icon name="heart-outline" size={24} color={theme.text.secondary} />
          <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
            No properties
          </Text>
        </View>
      </View>
    );
  }

  // Single image
  if (previewImages.length === 1) {
    return (
      <View style={[styles.previewContainer, style]}>
        <Image
          source={{ uri: previewImages[0] }}
          style={styles.singleImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Two images
  if (previewImages.length === 2) {
    return (
      <View style={[styles.previewContainer, style]}>
        <Image
          source={{ uri: previewImages[0] }}
          style={styles.twoImageLeft}
          resizeMode="cover"
        />
        <Image
          source={{ uri: previewImages[1] }}
          style={styles.twoImageRight}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Three or four images
  return (
    <View style={[styles.previewContainer, style]}>
      <Image
        source={{ uri: previewImages[0] }}
        style={styles.gridImageLarge}
        resizeMode="cover"
      />
      <View style={styles.gridRight}>
        <Image
          source={{ uri: previewImages[1] }}
          style={styles.gridImageSmall}
          resizeMode="cover"
        />
        <Image
          source={{ uri: previewImages[2] }}
          style={styles.gridImageSmall}
          resizeMode="cover"
        />
        {previewImages.length === 4 && (
          <Image
            source={{ uri: previewImages[3] }}
            style={styles.gridImageSmallBottom}
            resizeMode="cover"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
  },
  singleImage: {
    width: "100%",
    height: "100%",
  },
  twoImageLeft: {
    width: "50%",
    height: "100%",
  },
  twoImageRight: {
    width: "50%",
    height: "100%",
    marginLeft: 1,
  },
  gridImageLarge: {
    width: "67%",
    height: "100%",
  },
  gridRight: {
    width: "33%",
    height: "100%",
    marginLeft: 1,
  },
  gridImageSmall: {
    width: "100%",
    height: "50%",
  },
  gridImageSmallBottom: {
    marginTop: 1,
  },
});

export default PropertyCollectionPreview;
