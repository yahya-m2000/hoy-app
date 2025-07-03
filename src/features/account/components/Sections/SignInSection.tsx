/**
 * SignInSection component
 * Displays sign-in prompt and buttons for unauthenticated users
 * Updated to match the consistent design pattern of other profile sections
 */

import React from "react";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// Base Components
import { Container, Icon, Text } from "@shared/components";

// Hooks
import { useTheme } from "@core/hooks";
import { iconSize } from "src/core/design";

export default function SignInSection() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  const signInItems = [
    {
      id: "sign-in",
      icon: "log-in-outline",
      title: t("profile.signIn", { defaultValue: "Sign In" }),
      action: () => router.push("/(auth)/sign-in"),
    },
    {
      id: "create-profile",
      icon: "person-add-outline",
      title: t("profile.createProfile", { defaultValue: "Create profile" }),
      action: () => router.push("/(auth)/sign-in"), // Will handle both login and register
    },
  ];

  return (
    <Container marginBottom="lg">
      {/* Section Title */}
      <Text
        variant="caption"
        weight="semibold"
        color={isDark ? theme.colors.gray[300] : theme.colors.gray[700]}
        style={{
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        {t("profile.getStarted", { defaultValue: "Get Started" })}
      </Text>

      {/* Sign In Items Container */}
      <Container
        borderBottomWidth={1}
        borderColor={isDark ? theme.colors.gray[700] : theme.colors.gray[200]}
      >
        {signInItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <Container
              flexDirection="row"
              alignItems="center"
              paddingVertical="lg"
            >
              {/* Icon Container */}
              <Container
                borderRadius="sm"
                alignItems="center"
                justifyContent="center"
                marginRight="md"
              >
                <Icon
                  name={item.icon as any}
                  size={iconSize.md}
                  color={theme.text.primary}
                />
              </Container>

              {/* Content Container */}
              <Container flex={1}>
                <Text variant="body" weight="medium" color={theme.text.primary}>
                  {item.title}
                </Text>
              </Container>

              {/* Right Chevron */}
              <Icon
                name="chevron-forward-outline"
                size={iconSize.sm}
                color={theme.text.primary}
              />
            </Container>
          </TouchableOpacity>
        ))}
      </Container>
    </Container>
  );
}
