import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Container } from "src/shared";
import { Text } from "src/shared/components/base";
import { useTheme } from "@core/hooks/useTheme";

export default function Auth0RedirectScreen() {
  const { theme } = useTheme();

  useEffect(() => {
    // Immediately navigate away – Auth0 flow is handled internally in the useAuth0Integration hook.
    // This page simply prevents an unmatched route crash and shows a short loader.
    const timer = setTimeout(() => {
      router.replace("/");
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container flex={1} justifyContent="center" alignItems="center">
      <ActivityIndicator size="large" color={theme.primary} />
      <Text variant="body" marginTop="md">
        Finishing authentication…
      </Text>
    </Container>
  );
}
