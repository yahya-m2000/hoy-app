/**
 * SocialLogin component
 * Social login buttons with divider
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@shared/context";
import { fontSize, spacing, radius } from "@shared/constants";

interface SocialLoginProps {
  loading?: boolean;
  onGooglePress?: () => void;
  onApplePress?: () => void;
}

export default function SocialLogin({
  loading = false,
  onGooglePress,
  onApplePress,
}: SocialLoginProps) {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  return (
    <>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />
        <Text
          style={[
            styles.dividerText,
            {
              color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              backgroundColor: isDark
                ? theme.colors.gray[900]
                : theme.colors.gray[50],
            },
          ]}
        >
          {t("auth.orContinueWith")}
        </Text>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
        />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          disabled={loading}
          onPress={onGooglePress}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text
            style={[
              styles.socialButtonText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
              borderColor: isDark
                ? theme.colors.gray[700]
                : theme.colors.gray[300],
            },
          ]}
          disabled={loading}
          onPress={onApplePress}
        >
          <Ionicons
            name="logo-apple"
            size={20}
            color={isDark ? theme.white : "#000000"}
          />
          <Text
            style={[
              styles.socialButtonText,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            Apple
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.md,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  socialButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: "500",
  },
});
