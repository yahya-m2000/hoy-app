/**
 * PropertyDetailsSkeletons - Skeleton loading states for property detail components
 * Matches exact dimensions and layout of real components for seamless transitions
 */

import React from "react";
import { Dimensions } from "react-native";
import { Container } from "@shared/components/layout";
import { DetailScreen } from "@shared/components";
import { Skeleton } from "@rneui/base/dist";
import { radius, spacing, fontSize, iconSize } from "@core/design";
import { useTheme } from "@core/hooks/useTheme";
import { SectionDivider } from "./index";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface PropertyDetailsSkeletonsProps {
  showImageCarousel?: boolean;
}

/**
 * PropertyImageCarouselSkeleton - Matches PropertyImageCarousel dimensions
 */
export const PropertyImageCarouselSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container
      style={{
        width: "100%",
        height: (screenHeight * 1) / 2.5, // Match PropertyImageCarousel height
        position: "relative",
      }}
    >
      <Skeleton
        animation="pulse"
        height={(screenHeight * 1) / 2.5}
        width={screenWidth}
        style={{
          backgroundColor: skeletonBackground,
        }}
        skeletonStyle={{
          backgroundColor: skeletonColor,
        }}
      />
      
      {/* Pagination dots skeleton */}
      <Container
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {[1, 2, 3].map((_, idx) => (
          <Skeleton
            key={idx}
            animation="pulse"
            height={8}
            width={8}
            style={{
              borderRadius: 4,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              marginHorizontal: 4,
            }}
            skeletonStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
            }}
          />
        ))}
      </Container>
    </Container>
  );
};

/**
 * PropertyHeaderSkeleton - Matches PropertyHeader layout
 */
export const PropertyHeaderSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container paddingVertical="lg">
      {/* Title skeleton */}
      <Container alignItems="center" marginBottom="md">
        <Skeleton
          animation="pulse"
          height={28}
          width={250}
          style={{
            borderRadius: radius.md,
            backgroundColor: skeletonBackground,
          }}
          skeletonStyle={{
            backgroundColor: skeletonColor,
          }}
        />
      </Container>

      {/* Host info skeleton */}
      <Container
        flex={1}
        flexDirection="column"
        alignItems="center"
        marginBottom="sm"
      >
        {/* Avatar skeleton */}
        <Container paddingTop="sm">
          <Skeleton
            animation="pulse"
            height={48}
            width={48}
            style={{
              borderRadius: 24,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
        </Container>
        
        {/* Host name skeleton */}
        <Container paddingTop="sm" alignItems="center">
          <Skeleton
            animation="pulse"
            height={16}
            width={120}
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

      {/* Rating and reviews skeleton */}
      <Container
        flex={1}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginHorizontal="xxxl"
      >
        {/* Rating section */}
        <Container alignItems="center" flexDirection="column">
          <Skeleton
            animation="pulse"
            height={24}
            width={50}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          {/* Stars skeleton */}
          <Container flexDirection="row">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <Skeleton
                key={idx}
                animation="pulse"
                height={iconSize.xxs}
                width={iconSize.xxs}
                style={{
                  borderRadius: iconSize.xxs / 2,
                  backgroundColor: skeletonBackground,
                  marginHorizontal: 1,
                }}
                skeletonStyle={{
                  backgroundColor: skeletonColor,
                }}
              />
            ))}
          </Container>
        </Container>

        {/* Reviews section */}
        <Container alignItems="center" flexDirection="column">
          <Skeleton
            animation="pulse"
            height={24}
            width={40}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Skeleton
            animation="pulse"
            height={16}
            width={60}
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
  );
};

/**
 * CheckInDatesSectionSkeleton - Matches CheckInDatesSection layout
 */
export const CheckInDatesSectionSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container>
      {/* Date card skeleton */}
      <Container
        flexDirection="row"
        borderRadius="md"
        backgroundColor="card"
        marginBottom="md"
        padding="md"
      >
        {/* Check In */}
        <Container flex={1}>
          <Skeleton
            animation="pulse"
            height={18}
            width={80}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Skeleton
            animation="pulse"
            height={16}
            width={100}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Skeleton
            animation="pulse"
            height={16}
            width={60}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
        </Container>
        
        {/* Check Out */}
        <Container flex={1} alignItems="flex-end">
          <Skeleton
            animation="pulse"
            height={18}
            width={80}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Skeleton
            animation="pulse"
            height={16}
            width={100}
            style={{
              borderRadius: radius.md,
              backgroundColor: skeletonBackground,
              marginBottom: spacing.xs,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          <Skeleton
            animation="pulse"
            height={16}
            width={60}
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

      {/* Change dates link skeleton */}
      <Container alignItems="flex-start" marginBottom="md">
        <Skeleton
          animation="pulse"
          height={16}
          width={120}
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
  );
};

/**
 * PropertyDescriptionSkeleton - Matches PropertyDescription layout
 */
export const PropertyDescriptionSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container paddingVertical="md">
      {/* Title skeleton */}
      <Skeleton
        animation="pulse"
        height={24}
        width={200}
        style={{
          borderRadius: radius.md,
          backgroundColor: skeletonBackground,
          marginBottom: spacing.md,
        }}
        skeletonStyle={{
          backgroundColor: skeletonColor,
        }}
      />

      {/* Description lines skeleton */}
      {[1, 2, 3, 4].map((_, idx) => (
        <Skeleton
          key={idx}
          animation="pulse"
          height={16}
          width={idx === 3 ? "60%" : "90%"}
          style={{
            borderRadius: radius.md,
            backgroundColor: skeletonBackground,
            marginBottom: spacing.xs,
          }}
          skeletonStyle={{
            backgroundColor: skeletonColor,
          }}
        />
      ))}
    </Container>
  );
};

/**
 * AmenitiesGridSkeleton - Matches AmenitiesGrid layout
 */
export const AmenitiesGridSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container paddingVertical="md">
      {/* Title skeleton */}
      <Skeleton
        animation="pulse"
        height={24}
        width={150}
        style={{
          borderRadius: radius.md,
          backgroundColor: skeletonBackground,
          marginBottom: spacing.md,
        }}
        skeletonStyle={{
          backgroundColor: skeletonColor,
        }}
      />

      {/* Amenity items skeleton */}
      <Container marginTop="md">
        {[1, 2, 3, 4, 5, 6].map((_, idx) => (
          <Container
            key={idx}
            flexDirection="row"
            alignItems="center"
            marginBottom="md"
          >
            {/* Icon skeleton */}
            <Skeleton
              animation="pulse"
              height={iconSize.md}
              width={iconSize.md}
              style={{
                borderRadius: iconSize.md / 2,
                backgroundColor: skeletonBackground,
                marginRight: spacing.md,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
            
            {/* Text skeleton */}
            <Skeleton
              animation="pulse"
              height={16}
              width={Math.random() * 100 + 80} // Random width for variety
              style={{
                borderRadius: radius.md,
                backgroundColor: skeletonBackground,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
          </Container>
        ))}
      </Container>
    </Container>
  );
};

/**
 * PolicyNavigationSkeleton - Matches PolicyNavigationItem layout
 */
export const PolicyNavigationSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const skeletonColor = theme.skeleton;
  const skeletonBackground = theme.colors.gray[100];

  return (
    <Container>
      {[1, 2, 3, 4].map((_, idx) => (
        <Container
          key={idx}
          flexDirection="row"
          alignItems="center"
          paddingVertical="md"
          style={{
            borderBottomWidth: idx < 3 ? 1 : 0,
            borderBottomColor: theme.colors.gray[200],
          }}
        >
          {/* Icon skeleton */}
          <Skeleton
            animation="pulse"
            height={iconSize.md}
            width={iconSize.md}
            style={{
              borderRadius: iconSize.md / 2,
              backgroundColor: skeletonBackground,
              marginRight: spacing.md,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
          
          {/* Content skeleton */}
          <Container flex={1}>
            <Skeleton
              animation="pulse"
              height={18}
              width="70%"
              style={{
                borderRadius: radius.md,
                backgroundColor: skeletonBackground,
                marginBottom: spacing.xs,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
            <Skeleton
              animation="pulse"
              height={14}
              width="50%"
              style={{
                borderRadius: radius.md,
                backgroundColor: skeletonBackground,
              }}
              skeletonStyle={{
                backgroundColor: skeletonColor,
              }}
            />
          </Container>

          {/* Arrow skeleton */}
          <Skeleton
            animation="pulse"
            height={iconSize.sm}
            width={iconSize.sm}
            style={{
              borderRadius: iconSize.sm / 2,
              backgroundColor: skeletonBackground,
            }}
            skeletonStyle={{
              backgroundColor: skeletonColor,
            }}
          />
        </Container>
      ))}
    </Container>
  );
};

/**
 * Main PropertyDetailsSkeletons component combining all skeletons
 * Now wrapped with DetailScreen to match the actual content structure
 */
const PropertyDetailsSkeletons: React.FC<PropertyDetailsSkeletonsProps> = ({
  showImageCarousel = true,
}) => {
  const { theme } = useTheme();

  return (
    <DetailScreen
      title=""
      showFavorite
      isFavorited={false}
      onFavorite={() => {}} // No-op for skeleton
      loading={false}
      error={null}
      style={{ paddingBottom: 80 }}
    >
      <Container flex={1} backgroundColor={theme.background}>
        {/* Image carousel skeleton */}
        {showImageCarousel && (
          <Container height={300}>
            <PropertyImageCarouselSkeleton />
          </Container>
        )}

        {/* Content area skeleton */}
        <Container
          paddingHorizontal="md"
          backgroundColor={theme.background}
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
          style={{ marginTop: showImageCarousel ? -20 : 0 }}
        >
          <PropertyHeaderSkeleton />
          <CheckInDatesSectionSkeleton />
          <SectionDivider />
          <PropertyDescriptionSkeleton />
          <SectionDivider />
          <AmenitiesGridSkeleton />
          <SectionDivider />
          <PolicyNavigationSkeleton />
          
          {/* Bottom spacing */}
          <Container height={20} />
        </Container>
      </Container>
    </DetailScreen>
  );
};

export default PropertyDetailsSkeletons;