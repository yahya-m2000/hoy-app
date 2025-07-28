/**
 * Setup Prompt Component
 * Displays a prompt to complete host setup when user hasn't finished the setup process
 */

import React from "react";
import { useTranslation } from "react-i18next";

// Shared components
import { Container, Text, Button, Icon } from "@shared/components";

// Core hooks and design
import { useTheme } from "@core/hooks";
import { spacing, radius } from "@core/design";

interface SetupPromptProps {
  onStartSetup: () => void;
  title?: string;
  message?: string;
  variant?: "default" | "compact" | "card";
}

export const SetupPrompt: React.FC<SetupPromptProps> = ({
  onStartSetup,
  title,
  message,
  variant = "default",
}) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const defaultTitle = t("features.host.setup.main.promptTitle");
  const defaultMessage = t("features.host.setup.main.promptMessage");

  if (variant === "compact") {
    return (
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        padding="md"
        backgroundColor={
          isDark ? theme.colors.gray[800] : theme.colors.gray[50]
        }
        borderRadius="md"
        marginVertical="sm"
      >
        <Container flex={1} marginRight="md">
          <Text variant="subtitle" color="primary" marginBottom="sm">
            {title || defaultTitle}
          </Text>
          <Text variant="body" color="secondary">
            {message || defaultMessage}
          </Text>
        </Container>
        <Button
          title={t("features.host.setup.navigation.startSetup")}
          variant="primary"
          size="small"
          onPress={onStartSetup}
        />
      </Container>
    );
  }

  if (variant === "card") {
    return (
      <Container
        padding="lg"
        backgroundColor="background"
        borderRadius="lg"
        borderWidth={1}
        borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
        alignItems="center"
        marginVertical="lg"
      >
        <Container
          width={60}
          height={60}
          borderRadius="circle"
          backgroundColor={theme.colors.primary}
          justifyContent="center"
          alignItems="center"
          marginBottom="md"
        >
          <Icon name="settings-outline" size={24} color="white" />
        </Container>

        <Text
          variant="h2"
          color="primary"
          marginBottom="sm"
          style={{ textAlign: "center" }}
        >
          {title || defaultTitle}
        </Text>

        <Text
          variant="body"
          color="secondary"
          marginBottom="lg"
          style={{ textAlign: "center" }}
        >
          {message || defaultMessage}
        </Text>

        <Button
          title={t("features.host.setup.navigation.startSetup")}
          variant="primary"
          onPress={onStartSetup}
          style={{ minWidth: 200 }}
        />
      </Container>
    );
  }

  // Default variant
  return (
    <Container
      padding="xl"
      backgroundColor={isDark ? theme.colors.gray[900] : theme.white}
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <Container
        width={80}
        height={80}
        borderRadius="xl"
        backgroundColor={theme.colors.primary}
        justifyContent="center"
        alignItems="center"
        marginBottom="lg"
      >
        <Icon name="business-outline" size={32} color="white" />
      </Container>

      <Text
        variant="h2"
        color="primary"
        marginBottom="md"
        style={{ textAlign: "center" }}
      >
        {title || defaultTitle}
      </Text>

      <Text
        variant="body"
        color="secondary"
        marginBottom="xl"
        style={{ textAlign: "center", maxWidth: 300 }}
      >
        {message || defaultMessage}
      </Text>

      <Button
        title={t("features.host.setup.navigation.startSetup")}
        variant="primary"
        size="large"
        onPress={onStartSetup}
        style={{ minWidth: 250 }}
      />
    </Container>
  );
};
