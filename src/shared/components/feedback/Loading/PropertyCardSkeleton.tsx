/**
 * PropertyCardSkeleton component
 * Exactly matches PropertyCard dimensions and structure
 * Supports fade in/out animations with easing and different variants
 * Column layout: image on top, content below (matches PropertyCard exactly)
 */

import React from "react";
import { Container } from "../../layout";
import { Skeleton } from "@rneui/themed/dist";
import { radius, spacing, fontSize } from "@core/design";
import { useTheme } from "@core/hooks";

interface PropertyCardSkeletonProps {
  variant?: "large" | "medium" | "small" | "collection";
}

const getDimensions = (variant: string) => {
  switch (variant) {
    case "small":
      return { width: 120, imageHeight: 120 };
    case "medium":
      return { width: 160, imageHeight: 160 };
    case "large":
      return { width: 200, imageHeight: 200 };
    case "collection":
      return { width: 180, imageHeight: 180 };
    default:
      return { width: 180, imageHeight: 180 };
  }
};

const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  variant = "large",
}) => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];
  const { width, imageHeight } = getDimensions(variant);
  return (
    <Container>
      {/* Card container (matches BaseCard) */}
      <Container style={{ width }}>
        {/* Image skeleton with wishlist button */}
        <Container
          borderRadius="lg"
          height={imageHeight}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <Skeleton
            height={imageHeight}
            width={width}
            style={{
              borderRadius: radius.lg,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Container style={{ position: "absolute", top: 8, right: 8 }}>
            <Skeleton
              width={24}
              height={24}
              style={{ borderRadius: 12, backgroundColor: skeletonBackground }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
          </Container>
        </Container>
        {/* Content skeleton */}
        <Container paddingTop="xs">
          {/* Property Type and Location */}
          <Skeleton
            height={fontSize.sm}
            width={width * 0.7}
            style={{
              borderRadius: radius.md,
              marginBottom: spacing.xs,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          {/* Host Type */}
          <Skeleton
            height={fontSize.xs}
            width={width * 0.45}
            style={{
              borderRadius: radius.md,
              marginBottom: spacing.xs,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          {/* Price and Rating Row */}
          <Container
            flexDirection="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Skeleton
              height={fontSize.sm}
              width={width * 0.45}
              style={{
                borderRadius: radius.md,
                backgroundColor: skeletonBackground,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
            <Skeleton
              height={fontSize.xs}
              width={width * 0.25}
              style={{
                borderRadius: radius.md,

                backgroundColor: skeletonBackground,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
          </Container>
        </Container>
      </Container>
    </Container>
  );
};

export default PropertyCardSkeleton;
