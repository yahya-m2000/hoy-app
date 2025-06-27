/**
 * PropertyCardSkeleton component
 * Exactly matches PropertyCard dimensions and structure
 * Supports fade in/out animations with easing and different variants
 * Column layout: image on top, content below (matches PropertyCard exactly)
 */

import React, { useEffect, useMemo } from "react";
import { Animated, ViewStyle, Easing } from "react-native";
import { Container } from "@shared/components/base";
import { radius, spacing, fontSize } from "@shared/constants";
import LoadingSkeleton from "./LoadingSkeleton";

interface PropertyCardSkeletonProps {
  variant?: "large" | "medium" | "small";
  style?: ViewStyle | ViewStyle[];
  fadeAnimation?: boolean; // Whether to show fade in/out animation
  onFadeOut?: () => void; // Callback when fade out completes
}

const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  variant = "large",
  style,
  fadeAnimation = true,
}) => {
  const fadeAnim = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    if (fadeAnimation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [fadeAnim, fadeAnimation]);

  // Get size-specific dimensions exactly matching PropertyCard
  const getDimensions = () => {
    switch (variant) {
      case "small":
        return {
          width: 120,
          height: 120,
          imageHeight: 120,
        };
      case "medium":
        return {
          width: 160,
          height: 160,
          imageHeight: 160,
        };
      case "large":
        return {
          width: 200,
          height: 200,
          imageHeight: 200,
        };
      default:
        return {
          width: 160,
          height: 160,
          imageHeight: 160,
        };
    }
  };

  const dimensions = getDimensions();

  const containerStyles: ViewStyle[] = [
    { marginBottom: spacing.md },
    { width: dimensions.width },
  ];

  if (style) {
    if (Array.isArray(style)) {
      containerStyles.push(...style);
    } else {
      containerStyles.push(style);
    }
  }

  return (
    <Animated.View style={[containerStyles, { opacity: fadeAnim }]}>
      {/* Image Container - matching PropertyCard imageContainer exactly */}
      <Container
        style={{
          height: dimensions.imageHeight,
          position: "relative",
          borderRadius: radius.lg,
        }}
      >
        <LoadingSkeleton style={{ flex: 1, borderRadius: radius.lg }} />

        {/* Wishlist Button - positioned exactly like PropertyCard */}
        <Container style={{ position: "absolute", top: 8, right: 8 }}>
          <LoadingSkeleton width={24} height={24} borderRadius={12} />
        </Container>
      </Container>
      {/* Details Container - matching PropertyCard detailsContainer exactly */}
      <Container style={{ paddingTop: spacing.xs }}>
        {/* Property Type and Location */}
        <LoadingSkeleton
          height={fontSize.sm}
          width="70%"
          borderRadius={radius.md}
          style={{ marginBottom: spacing.xs }}
        />

        {/* Host Type */}
        <LoadingSkeleton
          height={fontSize.xs}
          width="45%"
          borderRadius={radius.md}
          style={{ marginBottom: spacing.xs }}
        />

        {/* Price and Rating Row */}
        <Container
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Price skeleton */}
          <LoadingSkeleton
            height={variant === "large" ? fontSize.sm : fontSize.xs}
            width="45%"
            borderRadius={radius.md}
          />
          {/* Rating skeleton */}
          <LoadingSkeleton
            height={fontSize.xs}
            width="25%"
            borderRadius={radius.md}
          />
        </Container>
      </Container>
    </Animated.View>
  );
};

export default PropertyCardSkeleton;
