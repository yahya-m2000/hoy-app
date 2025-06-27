/**
 * Avatar Component
 * Simple avatar component for user profile pictures and initials
 */

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from "react-native";

interface AvatarProps {
  source?: string;
  name: string;
  size?: number;
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({ source, name, size = 32, style }) => {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: "hidden",
    ...style,
  };

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source) {
    return (
      <Image source={{ uri: source }} style={imageStyle} resizeMode="cover" />
    );
  }
  return (
    <View style={[containerStyle, styles.initialsContainer]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default Avatar;
