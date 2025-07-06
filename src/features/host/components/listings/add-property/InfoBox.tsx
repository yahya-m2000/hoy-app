import React from "react";
import { Container, Text, Icon } from "@shared/components";
import { spacing, iconSize } from "@core/design";
import { useTheme } from "@core/hooks";

interface InfoBoxProps {
  title?: string;
  content: string;
  icon?: string;
  variant?: "info" | "tip" | "warning" | "success";
}

export default function InfoBox({
  title,
  content,
  icon = "information-circle",
  variant = "info",
}: InfoBoxProps) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "tip":
        return {
          backgroundColor: theme.surface,
          textColor: theme.text.primary,
          iconColor: theme.text.primary,
        };
      case "warning":
        return {
          backgroundColor: theme.surface,
          textColor: theme.text.primary,
          iconColor: theme.warning,
        };
      case "success":
        return {
          backgroundColor: theme.surface,
          textColor: theme.text.primary,
          iconColor: theme.success,
        };
      default:
        return {
          backgroundColor: theme.surface,
          textColor: theme.text.primary,
          iconColor: theme.text.primary,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Container
      padding="md"
      marginTop="lg"
      style={{
        borderRadius: 12,
        backgroundColor: styles.backgroundColor,
      }}
    >
      <Container flexDirection="row" alignItems="flex-start">
        <Icon
          name={icon as any}
          size={iconSize.md}
          color={styles.iconColor}
          style={{ marginRight: spacing.sm, marginTop: 2 }}
        />
        <Container flex={1}>
          {title && (
            <Text
              variant="subtitle"
              weight="medium"
              style={{
                color: styles.textColor,
                marginBottom: spacing.xs,
              }}
            >
              {title}
            </Text>
          )}
          <Text
            variant="body"
            style={{
              color: styles.textColor,
              lineHeight: 20,
            }}
          >
            {content}
          </Text>
        </Container>
      </Container>
    </Container>
  );
}
