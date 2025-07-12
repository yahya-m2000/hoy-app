/**
 * CollectionCard component
 * Displays collection as a card with image on top and text below
 * Styled to match BookingCard design with responsive sizing
 */

import React from "react";
import { View, TouchableOpacity } from "react-native";

// Shared Context and Hooks
import { useTheme } from "@core/hooks";

// Shared Components
import { Text, Container } from "@shared/components";
import { PropertyImageContainer } from "../../components/details";

// Shared Constants
import { radius, fontSize, spacing } from "@core/design";

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
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          paddingBottom: spacing.lg,
          backgroundColor: "transparent",
        },
        style,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${name}, ${propertyCount} ${
        propertyCount === 1 ? "property" : "properties"
      }`}
    >
      {/* Image Container */}
      <View
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: 1,
          borderRadius: radius.lg,
          overflow: "hidden",
          marginBottom: spacing.sm,
        }}
      >
        <PropertyImageContainer
          imageUrl={imageUrl}
          images={imageUrl ? [imageUrl] : undefined}
          containerStyle={{
            width: "100%",
            height: "100%",
            borderRadius: radius.lg,
          }}
          variant="small"
        />
      </View>

      {/* Collection Details */}
      <Container>
        {/* Collection Name */}
        <Text
          size="sm"
          weight="semibold"
          color={isDark ? theme.colors.gray[50] : theme.colors.gray[900]}
          style={{
            fontSize: fontSize.sm,
            fontWeight: "600",
            marginBottom: spacing.xs,
          }}
        >
          {name}
        </Text>

        {/* Description */}
        {description && (
          <Text
            size="sm"
            weight="normal"
            color={isDark ? theme.colors.gray[300] : theme.colors.gray[600]}
            style={{
              fontSize: fontSize.sm,
              fontWeight: "400",
              lineHeight: fontSize.sm * 1.2,
            }}
          >
            {description}
          </Text>
        )}

        {/* Property Count */}
        <Container flexDirection="row" alignItems="baseline">
          <Text
            size="sm"
            weight="normal"
            color={isDark ? theme.colors.gray[400] : theme.colors.gray[500]}
            style={{
              fontSize: fontSize.sm,
              fontWeight: "400",
            }}
          >
            {propertyCount} {propertyCount === 1 ? "property" : "properties"}
          </Text>
        </Container>
      </Container>
    </TouchableOpacity>
  );
};

export default CollectionCard;
