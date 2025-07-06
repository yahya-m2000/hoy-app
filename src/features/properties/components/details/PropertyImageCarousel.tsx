import React, { useState, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "src/core/hooks/useTheme";
import { spacing } from "@core/design";
import { PropertyImageCarouselProps } from "@core/types";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  property,
  images: imagesProp = [],
  showPropertyInfo = false,
  overlayGradient = true,
  fallbackImage,
  style,
  onImagePress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const viewerListRef = useRef<FlatList<string>>(null);

  // Render fallback icon when no image is available
  const renderFallbackIcon = () => {
    const iconSize = 48; // Slightly smaller for Airbnb aesthetic

    return (
      <View
        style={[
          styles.fallbackContainer,
          { backgroundColor: theme.colors.gray[200] },
        ]}
      >
        <View style={styles.fallbackIconWrapper}>
          <Ionicons
            name="home-outline"
            size={iconSize}
            color={theme.colors.gray[400]}
          />
        </View>
      </View>
    );
  };

  // Determine listing type display text
  const getListingTypeText = () => {
    if (property.propertyType) {
      switch (property.propertyType.toLowerCase()) {
        case "apartment":
          return t("property.entireApartment");
        case "room":
          return t("property.privateRoom");
        case "house":
          return t("property.entireHouse");
        case "villa":
          return t("property.entireVilla");
        case "condo":
          return t("property.entireCondo");
        default:
          return t("property.entireProperty", {
            type: property.propertyType.toLowerCase(),
          });
      }
    }
    // Fallback to using the main type if propertyType is not available
    if (property.type) {
      return t("property.entireProperty", {
        type: property.type,
      });
    }
    return t("property.entirePlace");
  };

  // Prefer explicit images prop if provided and non-empty; otherwise fallback to property.images
  const effectiveImages =
    imagesProp.length > 0 ? imagesProp : property.images || [];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width
    );
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const isFailed = failedImages.has(index);
    const isValid = !isFailed && item && item.trim() !== "";

    const handleError = () => {
      setFailedImages((prev) => new Set(prev).add(index));
    };

    const imageElement = isValid ? (
      <Image
        source={{ uri: item }}
        style={[styles.image, { width: screenWidth }]}
        resizeMode="cover"
        onError={handleError}
      />
    ) : (
      renderFallbackIcon()
    );

    const handlePress = () => {
      if (onImagePress) {
        onImagePress(index);
      } else {
        setViewerIndex(index);
        setViewerVisible(true);
        // give a slight delay then scroll to index
        setTimeout(() => {
          viewerListRef.current?.scrollToIndex({ index, animated: false });
        }, 0);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={{ width: screenWidth, height: "100%" }}
      >
        {imageElement}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {effectiveImages.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={effectiveImages}
          keyExtractor={(item, idx) => `${item}-${idx}`}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, i) => ({
            length: screenWidth,
            offset: screenWidth * i,
            index: i,
          })}
        />
      ) : (
        renderFallbackIcon()
      )}

      {/* Pagination Dots */}
      {effectiveImages.length > 1 && (
        <View style={styles.paginationContainer}>
          {effectiveImages.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentIndex ? styles.activeDot : {}]}
            />
          ))}
        </View>
      )}

      {/* Full-screen image viewer */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setViewerVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          <FlatList
            ref={viewerListRef}
            data={effectiveImages}
            keyExtractor={(item, idx) => `${item}-${idx}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            )}
            horizontal
            pagingEnabled
            initialScrollIndex={viewerIndex}
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({
              length: screenWidth,
              offset: screenWidth * i,
              index: i,
            })}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: (screenHeight * 1) / 2.5, // 2/3 of screen height
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%", // Airbnb-style subtle gradient
    zIndex: 1, // Above image, below overlays
  },

  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fallbackIconWrapper: {
    padding: spacing.xl * 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  propertyInfoOverlay: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 2, // Above gradient and image
  },
  propertyDetailsContainer: {
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs / 2,
  },
  locationText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: spacing.xs,
    letterSpacing: -0.4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listingTypeText: {
    fontSize: 15,
    fontWeight: "500",
    opacity: 0.9,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
  },

  // Viewer styles
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: screenWidth,
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
});

export default PropertyImageCarousel;
