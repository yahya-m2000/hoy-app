/**
 * CollectionCard component
 * Displays collection as a card with image on top and text below
 * Replicates PropertyCard structure for visual consistency
 */

import React from "react";

// Base components
import { BaseCard, Container, Text } from "@shared/components";
import { PropertyImageContainer } from "../../components/details";

// Hooks and utilities
import { useTheme } from "@core/hooks";
import { fontSize, radius } from "@core/design";

interface CollectionCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  propertyCount?: number;
  onPress?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: "large" | "small" | "collection";
  isLoading?: boolean;
  animateOnMount?: boolean;
  fadeInDuration?: number;
  style?: any;
  testID?: string;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  propertyCount = 0,
  onPress,
  onEdit,
  onDelete,
  variant = "collection",
  isLoading = false,
  animateOnMount = false,
  fadeInDuration = 300,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // Get size-specific dimensions matching PropertyCard logic
  const getDimensions = () => {
    switch (variant) {
      case "small":
        return {
          width: 120,
          height: 120,
          imageHeight: 120,
        };
      case "large":
        return {
          width: 200,
          height: 200,
          imageHeight: 200,
        };
      case "collection":
        return {
          width: 180,
          height: 180,
          imageHeight: 180,
        };
      default:
        return {
          width: 180,
          height: 180,
          imageHeight: 180,
        };
    }
  };

  const dimensions = getDimensions();

  return (
    <BaseCard
      variant="vertical"
      style={{ width: dimensions.width }}
      onPress={handlePress}
      isLoading={isLoading}
      animateOnMount={animateOnMount}
      fadeInDuration={fadeInDuration}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${name}, ${propertyCount} ${
        propertyCount === 1 ? "property" : "properties"
      }`}
    >
      {/* Image Container */}
      <Container style={{ position: "relative" }}>
        <PropertyImageContainer
          imageUrl={imageUrl}
          images={imageUrl ? [imageUrl] : undefined}
          variant={variant === "large" ? "large" : "small"}
          containerStyle={{
            borderRadius: radius.lg,
            aspectRatio: 1,
          }}
          resizeMode="cover"
        />
      </Container>

      {/* Content Container */}
      <Container paddingTop="xs">
        {/* Collection Name */}
        <Container>
          <Text variant="body" weight="medium" numberOfLines={1}>
            {name}
          </Text>
        </Container>

        {/* Description */}
        {description && (
          <Container marginBottom="xs">
            <Text weight="normal" size="xs" color="secondary" numberOfLines={1}>
              {description}
            </Text>
          </Container>
        )}

        {/* Property Count */}
        <Container
          flexDirection="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Text weight="normal" size="xs" color="secondary">
            {propertyCount} {propertyCount === 1 ? "property" : "properties"}
          </Text>
        </Container>
      </Container>
    </BaseCard>
  );
};

export default CollectionCard;
