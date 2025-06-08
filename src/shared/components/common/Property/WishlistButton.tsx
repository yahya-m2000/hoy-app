/**
 * WishlistButton - Reusable heart/wishlist button component
 * Handles wishlist toggle functionality with authentication check
 */

import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useTheme, useAuth } from "src/shared/context";
import { useWishlist } from "src/shared/hooks";
import { spacing } from "src/shared/constants";
import { Icon } from "src/shared/components/base/Icon";
import { showAuthPrompt } from "src/shared/utils";

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
  const { theme, isDark } = useTheme();
  const { isPropertyWishlisted, isToggling } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isWishlisted = isPropertyWishlisted(propertyId);
  const iconSize = variant === "small" ? 14 : 18;
  const buttonSize = variant === "small" ? 24 : 32;

  // Handle wishlist toggle - show collections modal
  const handleWishlistPress = (e: any) => {
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
    onShowCollections?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.6)"
            : "rgba(255, 255, 255, 0.9)",
        },
        style,
      ]}
      onPress={handleWishlistPress}
      disabled={isToggling}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon
        name={isWishlisted ? "heart" : "heart-outline"}
        size={iconSize}
        color={
          isWishlisted
            ? "#ff385c"
            : isDark
            ? theme.colors.gray[50]
            : theme.colors.gray[900]
        }
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default WishlistButton;
