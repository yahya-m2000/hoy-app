import React from "react";
import { Container } from "@shared/components/layout/Container";
import { Text } from "@shared/components/base/Text";
import { Icon } from "@shared/components/base/Icon";
import { useTheme } from "@core/hooks/useTheme";

export const EmptyReviews: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Container
      alignItems="center"
      paddingHorizontal="xl"
      paddingVertical="xl"
      marginTop="xl"
    >
      <Icon name="star-outline" size={48} color={theme.colors.gray[400]} />

      <Text
        variant="h5"
        weight="semibold"
        color={theme.text.primary}
        style={{ marginTop: 16, marginBottom: 8 }}
      >
        No Reviews Yet
      </Text>

      <Text
        variant="body"
        color={theme.text.secondary}
        style={{ textAlign: "center", lineHeight: 22 }}
      >
        This property doesn&apos;t have any reviews yet.
      </Text>
    </Container>
  );
};
