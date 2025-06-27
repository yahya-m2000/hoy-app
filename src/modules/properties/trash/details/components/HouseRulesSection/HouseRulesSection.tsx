/**
 * HouseRulesSection Component
 * Displays house rules and property policies
 */

import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "@shared/components/base/Text";
import { Icon } from "@shared/components/base/Icon";
import { Container } from "@shared/components/base/Container";
import { iconSize, spacing } from "src/shared";

interface HouseRule {
  text: string;
  icon?: string;
}

interface HouseRulesSectionProps {
  title?: string;
  rules: HouseRule[];
  maxVisible?: number;
}

export const HouseRulesSection: React.FC<HouseRulesSectionProps> = ({
  title = "House rules",
  rules,
  maxVisible = 3,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleRules = showAll ? rules : rules.slice(0, maxVisible);
  const shouldShowToggle = rules.length > maxVisible;
  const renderRule = (rule: HouseRule, index: number) => {
    // Get outlined icon name, with fallback
    const getIconName = (iconName?: string): string => {
      if (!iconName) return "information-circle-outline";
      return iconName.endsWith("-outline") ? iconName : `${iconName}-outline`;
    };

    return (
      <Container
        key={index}
        flexDirection="row"
        alignItems="center"
        marginBottom="md"
      >
        <Icon
          name={getIconName(rule.icon) as any}
          size={iconSize.md}
          style={{ marginRight: spacing.md }}
        />
        <Text weight="normal" color="secondary">
          {rule.text}
        </Text>
      </Container>
    );
  };

  return (
    <Container paddingVertical="md">
      <Text variant="h6">{title}</Text>

      <Container marginTop="md">
        {visibleRules.map((rule, index) => renderRule(rule, index))}
      </Container>

      {shouldShowToggle && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
          <Text variant="body" weight="medium" color="primary">
            {showAll ? "Show less" : "Show more"}
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
};

export default HouseRulesSection;
