/**
 * ExperienceCard Component
 * Individual card displaying guest experience information
 */

import React from "react";
import { Text } from "@shared/components/base/Text";
import { Icon } from "@shared/components/base/Icon";
import { Container } from "@shared/components/base/Container";
import { iconSize } from "@shared/constants";

interface ExperienceCardProps {
  icon?: string;
  title: string;
  description: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  icon = "checkmark-outline",
  title,
  description,
}) => {
  // Safely handle icon naming - ensure it's a valid format for the Icon component
  // Add fallbacks for common icon names from the API that might not match the exact icon component names
  const getIconName = (iconName: string) => {
    // Map API icon names to component icon names if needed
    const iconMap: Record<string, string> = {
      "check-circle": "checkmark-circle-outline",
      "message-circle": "chatbubble-outline",
      "shield-check": "shield-checkmark-outline",
    };

    return iconMap[iconName] || iconName;
  };

  const iconName = getIconName(icon);

  return (
    <Container
      flexDirection="row"
      paddingVertical="md"
      borderRadius="lg"
      marginBottom="sm"
    >
      <Container
        borderRadius="circle"
        justifyContent="center"
        alignItems="center"
        marginRight="md"
      >
        <Icon name={iconName as any} size={iconSize.md} color="primary" />
      </Container>
      <Container flex={1}>
        <Text variant="body" weight="bold" color="primary">
          {title}
        </Text>
        <Text variant="body" color="secondary">
          {description}
        </Text>
      </Container>
    </Container>
  );
};

export default ExperienceCard;
