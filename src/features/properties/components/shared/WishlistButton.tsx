/**
 * WishlistButton - Reusable heart/wishlist button component
 * Handles wishlist toggle functionality with authentication check
 */

import React, { useCallback } from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useAuth } from "@core/context";
import { useTheme } from "@core/hooks";
import { iconSize, spacing } from "@core/design";
import { Icon, Container } from "@shared/components";
import { showAuthPrompt } from "src/core/auth/utils";
import { useWishlistState } from "@features/properties/context/PropertyContext";

export interface WishlistButtonProps {
  /** Property ID for wishlist operations */
  propertyId: string;
  /** Button size variant */
  variant?: "small" | "large";
  /** Custom button styles */
  style?: ViewStyle;
  /** Called when collections modal should be shown */
  onShowCollections?: () => void;
  /** Called when property is added/removed from collections */
  onCollectionToggle?: (collectionId: string, isAdded: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  propertyId,
  variant = "large",
  style,
  onShowCollections,
  onCollectionToggle,
}) => {
  const { theme } = useTheme();
  const { isPropertyWishlisted, isTogglingWishlist } = useWishlistState();
  const { isAuthenticated } = useAuth();

  const isWishlisted = isPropertyWishlisted(propertyId);

  // Handle wishlist toggle - show collections modal
  const handleWishlistPress = useCallback(
    (e: any) => {
      e.stopPropagation();

      if (!isAuthenticated) {
        // Show authentication prompt
        showAuthPrompt({
          title: "Sign in Required",
          message: "You need to sign in to save properties to your wishlist.",
        });
        return;
      }

      // Show collections modal for authenticated users
      console.log(
        "WishlistButton: Showing collections modal for property:",
        propertyId
      );
      onShowCollections?.();
    },
    [isAuthenticated, propertyId, onShowCollections]
  );
  return (
    <TouchableOpacity
      style={[styles.button]}
      onPress={handleWishlistPress}
      disabled={isTogglingWishlist}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Container alignItems="center" justifyContent="center">
        <Icon
          name={isWishlisted ? "heart" : "heart-outline"}
          size={iconSize.sm}
          color={theme.colors.white}
        />
      </Container>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gradientBackground: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WishlistButton;
