/**
 * Avatar component for the Hoy application
 * Displays user profile images with fallback initials
 */

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../constants/radius";
import { User } from "../types/user";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

interface AvatarProps {
  size?: AvatarSize;
  source?: string | ImageSourcePropType | null;
  name?: string;
  showBorder?: boolean;
  status?: "online" | "offline" | "away" | "busy" | null;
  user?: User | null; // Add user prop
}

const Avatar: React.FC<AvatarProps> = ({
  size = "md",
  source,
  name = "",
  showBorder = false,
  status = null,
  user = null,
}) => {
  const { theme, isDark } = useTheme();

  // Use user data if provided
  const userName = user?.firstName || name;
  const userImage = user?.avatarUrl || source;
  // Get size dimensions
  const getSizeDimensions = () => {
    if (typeof size === "number") {
      return size;
    }

    switch (size) {
      case "xs":
        return 24;
      case "sm":
        return 32;
      case "md":
        return 40;
      case "lg":
        return 56;
      case "xl":
        return 80;
      default:
        return 40;
    }
  };

  // Get text size based on avatar size
  const getTextSize = () => {
    switch (size) {
      case "xs":
        return 10;
      case "sm":
        return 12;
      case "md":
        return 14;
      case "lg":
        return 18;
      case "xl":
        return 24;
      default:
        return 14;
    }
  };
  // Generate initials from name
  const getInitials = () => {
    const displayName = userName || "";
    if (!displayName) return "";

    const nameParts = displayName.trim().split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      return (
        nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
      ).toUpperCase();
    }
  };
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return theme.colors.success;
      case "offline":
        return isDark ? theme.colors.grayPalette[500] : theme.colors.grayPalette[400];
      case "away":
        return theme.colors.warning;
      case "busy":
        return theme.colors.error;
      default:
        return "transparent";
    }
  };
  // Generate background color from name (consistent for same name)
  const getBackgroundColor = () => {
    const displayName = userName || "";
    if (!displayName)
      return isDark ? theme.colors.grayPalette[700] : theme.colors.gray[300]; // Simple hash function to generate consistent color for the same name
    const hash = displayName.split("").reduce((acc: number, char: string) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const colorOptions = [
      theme.colors.primaryPalette[400],
      theme.colors.secondaryPalette[400],
      theme.colors.successPalette[400],
      theme.colors.warningPalette[400],
      theme.colors.infoPalette[400],
    ];

    return colorOptions[hash % colorOptions.length];
  };

  const dimension = getSizeDimensions();
  const textSize = getTextSize();
  const statusSize = dimension * 0.3;
  return (
    <View style={{ width: dimension, height: dimension }}>
      {userImage ? (
        <Image
          source={
            typeof userImage === "string" ? { uri: userImage } : userImage
          }
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius.circle,
              borderWidth: showBorder ? 2 : 0,
              borderColor: isDark ? theme.colors.grayPalette[700] : theme.white,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius.circle,
              backgroundColor: getBackgroundColor(),
              borderWidth: showBorder ? 2 : 0,
              borderColor: isDark ? theme.colors.grayPalette[700] : theme.white,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: textSize,
                color: theme.white,
              },
            ]}
          >
            {getInitials()}
          </Text>
        </View>
      )}

      {status && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: radius.circle,
              backgroundColor: getStatusColor(),
              borderWidth: 2,
              borderColor: isDark ? theme.colors.gray[800] : theme.white,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    overflow: "hidden",
  },
  initialsContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    fontWeight: "600",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});

export default Avatar;


