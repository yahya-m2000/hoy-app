/**
 * SocialLogin component
 * Social login buttons with divider
 */

import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text, Button, Container } from "src/shared/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@core/hooks";
import { fontSize, spacing, radius } from "@core/design";
import { gray } from "@core/design/colors";

interface SocialLoginProps {
  loading?: boolean;
  onGooglePress?: () => void;
  onFacebookPress?: () => void;
  onApplePress?: () => void;
}

export default function SocialLogin({
  loading = false,
  onGooglePress,
  onFacebookPress,
  onApplePress,
}: SocialLoginProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <>
      {/* Divider */}
      <Container flexDirection="row" alignItems="center" marginVertical="md">
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDark ? gray[700] : gray[300],
          }}
        />
        <Text
          variant="caption"
          style={{
            paddingHorizontal: spacing.md,
          }}
        >
          {t("features.auth.forms.orContinueWith")}
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: isDark ? gray[700] : gray[300],
          }}
        />
      </Container>

      {/* Social Buttons */}
      <Container flexDirection="column" marginVertical="md">
        <Button
          title="Continue with Google"
          onPress={onGooglePress || (() => {})}
          disabled={loading}
          variant="outline"
          icon={<Ionicons name="logo-google" size={24} color="#DB4437" />}
          iconPosition="left"
          style={{
            marginBottom: spacing.sm,
            height: 52,
            shadowColor: isDark ? gray[900] : gray[400],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        />

        <Button
          title="Continue with Facebook"
          onPress={onFacebookPress || (() => {})}
          disabled={loading}
          variant="outline"
          icon={<Ionicons name="logo-facebook" size={24} color="#1877F2" />}
          iconPosition="left"
          style={{
            marginBottom: spacing.sm,
            height: 52,
            shadowColor: isDark ? gray[900] : gray[400],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        />

        {/* Apple Sign In (commented out for future use) */}
        {/*
        <Button
          title="Continue with Apple"
          onPress={onApplePress || (() => {})}
          disabled={loading}
          variant="outline"
          icon={<Ionicons name="logo-apple" size={24} color={isDark ? gray[100] : gray[900]} />}
          iconPosition="left"
          style={{ 
            marginBottom: spacing.sm,
            height: 52,
            shadowColor: isDark ? gray[900] : gray[400],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        />
        */}
      </Container>
    </>
  );
}
