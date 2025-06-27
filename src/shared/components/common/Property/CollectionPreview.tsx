/**
 * CollectionPreview - Grid layout component for collection images
 * Handles different image counts and loading states
 */

import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Text } from "@shared/components/base/Text";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing, fontSize } from "src/shared/constants";
import { Icon } from "src/shared/components/base/Icon";

export interface CollectionPreviewProps {
  /** Array of image URLs for preview */
  previewImages: string[];
  /** Loading state */
  isLoading?: boolean;
  /** Container height */
  height?: number;
}

const CollectionPreview: React.FC<CollectionPreviewProps> = ({
  previewImages,
  isLoading = false,
  height,
}) => {
  const { theme } = useTheme();
  const containerStyle = {
    height: height || 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden" as "hidden",
    flexDirection: "row" as "row",
  };

  if (isLoading) {
    return (
      <View style={[containerStyle, { backgroundColor: theme.surface }]}>
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
      <View style={[containerStyle, { backgroundColor: theme.surface }]}>
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
      <View style={containerStyle}>
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
      <View style={containerStyle}>
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
    <View style={containerStyle}>
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
          style={[
            styles.gridImageSmall,
            previewImages.length === 4 && styles.gridImageSmallBottom,
          ]}
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

export default CollectionPreview;
