import React, { useState } from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/hooks/useTheme";
import { spacing } from "@shared/constants/spacing";
import { PropertyImageCarouselProps } from "../../../components/types/carousels";

const { height: screenHeight } = Dimensions.get("window");

const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({
  property,
  showPropertyInfo = false,
  overlayGradient = true,
  fallbackImage,
  style,
  onImagePress,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Check if property has valid images
  const hasValidImage = () => {
    if (imageLoadError) {
      return false;
    }

    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0];
      return (
        firstImage &&
        firstImage.trim() !== "" &&
        !firstImage.includes("example.com") &&
        !firstImage.includes("placeholder")
      );
    }

    return false;
  };
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
  return (
    <View style={[styles.container]}>
      {/* Property Image */}
      {hasValidImage() ? (
        <Image
          source={{ uri: property.images![0] }}
          style={[styles.image]}
          resizeMode="cover"
          onError={() => setImageLoadError(true)}
        />
      ) : (
        renderFallbackIcon()
      )}
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
});

export default PropertyImageCarousel;
