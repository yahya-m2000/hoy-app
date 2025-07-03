/**
 * PropertyDescription Component
 * Displays property description with expandable "Show more" functionality
 */

import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text, Container } from "@shared/components";

interface PropertyDescriptionProps {
  title?: string;
  description: string;
  maxLines?: number;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  title = "About this place",
  description,
  maxLines = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Simple check for long text (more than 200 characters)
  const shouldShowToggle = description.length > 200;
  return (
    <Container paddingVertical="md">
      <Text variant="h6" weight="semibold" color="primary">
        {title}
      </Text>
      <Text
        variant="body"
        color="secondary"
        numberOfLines={isExpanded ? undefined : maxLines}
        style={{ marginBottom: shouldShowToggle ? 8 : 0 }}
      >
        {description}
      </Text>
      {shouldShowToggle && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text variant="body" weight="medium" color="primary">
            {isExpanded ? "Show less" : "Show more"}
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
};

export default PropertyDescription;
