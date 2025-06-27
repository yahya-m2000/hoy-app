import React from "react";
import { Image } from "react-native";
import { Container } from "../Container";
import { Text } from "../Text";
import { useTheme } from "@shared/hooks/useTheme";

export interface AvatarProps {
  size?: "small" | "medium" | "large" | "xlarge";
  src?: string;
  source?: string; // Alias for src
  alt?: string;
  name?: string; // Alias for alt
  initials?: string;
  backgroundColor?: string;
  showBorder?: boolean;
  style?: any;
}

const SIZES = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 80,
};

const Avatar: React.FC<AvatarProps> = ({
  size = "medium",
  src,
  source,
  alt,
  name,
  initials,
  backgroundColor,
  showBorder,
  style,
}) => {
  const { theme } = useTheme();
  const avatarSize = SIZES[size];
  const borderRadius = avatarSize / 2;

  // Use src or source, prefer src
  const imageUri = src || source;
  const altText = alt || name;

  // Generate initials from name if not provided
  const getInitials = (text: string) => {
    if (!text) return "?";
    const words = text.trim().split(" ");
    if (words.length === 1) {
      return words[0].charAt(0);
    }
    return words[0].charAt(0) + words[words.length - 1].charAt(0);
  };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius,
            ...(showBorder && {
              borderWidth: 2,
              borderColor: theme.colors.gray[300],
            }),
          },
          style,
        ]}
        accessibilityLabel={altText}
      />
    );
  }

  const displayInitials = initials || getInitials(altText || "");
  const bgColor = backgroundColor || theme.colors.gray[200];

  return (
    <Container
      width={avatarSize}
      height={avatarSize}
      backgroundColor={bgColor}
      justifyContent="center"
      alignItems="center"
      style={[
        {
          borderRadius,
        },
        showBorder && {
          borderWidth: 2,
          borderColor: theme.colors.gray[300],
        },
        style,
      ]}
    >
      <Text variant="body" weight="bold" color={theme.colors.gray[600]}>
        {displayInitials.toUpperCase()}
      </Text>
    </Container>
  );
};

export default Avatar;
