import React from "react";
import { TouchableOpacity } from "react-native";

import { Container } from "@shared/components/base/Container";
import { Text } from "@shared/components/base/Text";
import { Icon } from "@shared/components/base/Icon";
import type { PolicyNavigationItemProps } from "../../../../types/details";

/**
 * PolicyNavigationItem
 */
const PolicyNavigationItem: React.FC<PolicyNavigationItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  withDivider = false,
  style,
  testID,
}) => {
  // Handle modal presentation with error handling
  const handlePress = () => {
    try {
      onPress();
    } catch (error) {
      console.error("PolicyNavigationItem: Press handler failed", error);
    }
  };

  return (
    <Container paddingVertical="md">
      {/* Main navigation button */}
      <TouchableOpacity
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Navigate to ${title}`}
        testID={testID}
      >
        <Container
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Left side: Icon and text content */}
          <Container flexDirection="row" alignItems="center" flex={1}>
            {/* Policy icon */}
            <Container marginRight="md">
              <Icon name={icon} size={24} color="secondary" />
            </Container>

            {/* Text content container */}
            <Container flex={1}>
              <Text variant="body" weight="semibold" color="primary">
                {title}
              </Text>
              <Text color="secondary">{subtitle}</Text>
            </Container>
          </Container>

          {/* Right side: Chevron indicator */}
          <Icon name="chevron-forward" size={20} color="tertiary" />
        </Container>
      </TouchableOpacity>
    </Container>
  );
};

export default PolicyNavigationItem;
