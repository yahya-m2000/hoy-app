/**
 * Debug Setting Component
 * Handles debug settings and font testing
 */

import React from "react";
import { useTranslation } from "react-i18next";

import { Container, Text } from "@shared/components";

interface DebugSettingProps {
  title: string;
  description: string;
  infoContent: string;
}

export const DebugSetting: React.FC<DebugSettingProps> = ({
  title,
  description,
  infoContent,
}) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Container marginBottom="lg">
        <Text variant="h4" marginBottom="sm">
          Font Test
        </Text>
        <Text variant="body2" color="secondary" marginBottom="lg">
          Test different Satoshi font weights and styles
        </Text>
      </Container>

      <Text variant="h1" weight="bold">
        Satoshi Bold - Heading 1
      </Text>
      <Text variant="h2" weight="bold">
        Satoshi Bold - Heading 2
      </Text>
      <Text variant="h3" weight="semibold">
        Satoshi SemiBold - Heading 3
      </Text>
      <Text variant="h4" weight="medium">
        Satoshi Medium - Heading 4
      </Text>
      <Text variant="h5" weight="normal">
        Satoshi Regular - Heading 5
      </Text>
      <Text variant="h6" weight="normal">
        Satoshi Regular - Heading 6
      </Text>

      <Text variant="subtitle" weight="medium">
        Satoshi Medium - Subtitle
      </Text>
      <Text variant="body" weight="normal">
        Satoshi Regular - Body
      </Text>
      <Text variant="body2" weight="normal">
        Satoshi Regular - Body 2
      </Text>
      <Text variant="caption" weight="normal">
        Satoshi Regular - Caption
      </Text>

      <Text variant="button" weight="semibold">
        Satoshi SemiBold - Button
      </Text>
      <Text variant="buttonSmall" weight="medium">
        Satoshi Medium - Small Button
      </Text>

      <Text variant="body" weight="normal" style={{ fontStyle: "italic" }}>
        Satoshi Italic - Regular Italic
      </Text>
      <Text variant="body" weight="bold" style={{ fontStyle: "italic" }}>
        Satoshi Bold Italic - Bold Italic
      </Text>

      <Text variant="body" weight="bold">
        Satoshi Bold - Bold Weight
      </Text>
      <Text variant="body" weight="semibold">
        Satoshi SemiBold - SemiBold Weight
      </Text>

      <Text variant="body" style={{ fontFamily: "Satoshi-Regular" }}>
        Direct font family: Satoshi-Regular
      </Text>
      <Text variant="body" style={{ fontFamily: "Satoshi-Bold" }}>
        Direct font family: Satoshi-Bold
      </Text>

      <Text variant="body" marginTop="lg">
        Font Family Debug Info:
      </Text>
      <Text variant="caption" style={{ fontFamily: "Satoshi-Regular" }}>
        Regular: Satoshi-Regular
      </Text>
      <Text variant="caption" style={{ fontFamily: "Satoshi-Medium" }}>
        Medium: Satoshi-Medium
      </Text>
      <Text variant="caption" style={{ fontFamily: "Satoshi-Bold" }}>
        Bold: Satoshi-Bold
      </Text>
      <Text variant="caption" style={{ fontFamily: "Satoshi-Light" }}>
        Light: Satoshi-Light
      </Text>
      <Text variant="caption" style={{ fontFamily: "Satoshi-Black" }}>
        Black: Satoshi-Black
      </Text>
    </Container>
  );
};
