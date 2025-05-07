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

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  size?: AvatarSize;
  source?: string | ImageSourcePropType | null;
  name?: string;
  showBorder?: boolean;
  status?: "online" | "offline" | "away" | "busy" | null;
}

const Avatar: React.FC<AvatarProps> = ({
  size = "md",
  source,
  name = "",
  showBorder = false,
  status = null,
}) => {
  const { theme, isDark } = useTheme();

  // Get size dimensions
  const getSizeDimensions = () => {
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
    if (!name) return "";

    const nameParts = name.trim().split(" ");
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
        return theme.success[500];
      case "offline":
        return isDark ? theme.colors.gray[500] : theme.colors.gray[400];
      case "away":
        return theme.warning[500];
      case "busy":
        return theme.error[500];
      default:
        return "transparent";
    }
  };

  // Generate background color from name (consistent for same name)
  const getBackgroundColor = () => {
    if (!name) return isDark ? theme.colors.gray[700] : theme.colors.gray[300];

    // Simple hash function to generate consistent color for the same name
    const hash = name.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const colorOptions = [
      theme.primary[400],
      theme.secondary[400],
      theme.success[400],
      theme.warning[400],
      theme.info[400],
    ];

    return colorOptions[hash % colorOptions.length];
  };

  const dimension = getSizeDimensions();
  const textSize = getTextSize();
  const statusSize = dimension * 0.3;
  return (
    <View style={{ width: dimension, height: dimension }}>
      {source ? (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: radius.circle,
              borderWidth: showBorder ? 2 : 0,
              borderColor: isDark ? theme.colors.gray[700] : theme.white,
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
              borderColor: isDark ? theme.colors.gray[700] : theme.white,
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
