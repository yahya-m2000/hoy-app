/**
 * CollectionCard component
 * Extends base Card component for collection display
 */

// React
import React, { useState } from "react";

// React Native
import { View, StyleSheet, TouchableOpacity } from "react-native";

// Context
import { useTheme } from "@shared/context";

// Constants
import { spacing } from "@shared/constants";

// Base components
import { Text, Icon, Image, Container } from "@shared/components/base";

// Components
import Card from "@shared/components/common/Card/Card";

// Types
import { CollectionCardProps } from "@shared/components/common/Card/Card.types";

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  propertyCount = 0,
  onPress,
  onEdit,
  onDelete,
  variant = "elevated",
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };
  const renderImage = () => {
    if (imageError || !imageUrl) {
      return (
        <View
          style={[
            styles.imagePlaceholder,
            {
              backgroundColor: isDark
                ? theme.colors.grayPalette[700]
                : theme.colors.grayPalette[100],
            },
          ]}
        >
          <Icon
            name="folder"
            size={40}
            color={
              isDark
                ? theme.colors.grayPalette[500]
                : theme.colors.grayPalette[400]
            }
          />
        </View>
      );
    }

    return (
      <Image
        source={imageUrl}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {onEdit && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEdit}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon
            name="pencil"
            size={16}
            color={
              isDark
                ? theme.colors.grayPalette[400]
                : theme.colors.grayPalette[600]
            }
          />
        </TouchableOpacity>
      )}

      {onDelete && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon name="trash" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCollectionDetails = () => (
    <Container padding="small">
      {/* Collection Name */}
      <Text
        variant="h4"
        weight="semibold"
        numberOfLines={2}
        style={styles.collectionName}
      >
        {name}
      </Text>

      {/* Description */}
      {description && (
        <Text
          variant="body"
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[600]
          }
          numberOfLines={2}
          style={styles.description}
        >
          {description}
        </Text>
      )}

      {/* Property Count */}
      <View style={styles.metaContainer}>
        <Icon
          name="home"
          size={14}
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[600]
          }
        />
        <Text
          variant="body"
          color={
            isDark
              ? theme.colors.grayPalette[400]
              : theme.colors.grayPalette[600]
          }
          style={styles.propertyCount}
        >
          {propertyCount} {propertyCount === 1 ? "property" : "properties"}
        </Text>
      </View>
    </Container>
  );

  return (
    <Card
      variant={variant}
      onPress={handlePress}
      style={style}
      padding="none"
      testID={testID}
    >
      <View style={styles.imageContainer}>
        {renderImage()}
        {(onEdit || onDelete) && renderActions()}
      </View>
      {renderCollectionDetails()}
    </Card>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    height: 150,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  collectionName: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xs,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyCount: {
    marginLeft: spacing.xs / 2,
  },
});

export default CollectionCard;
