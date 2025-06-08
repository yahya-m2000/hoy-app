/**
 * SignInSection component
 * Displays sign-in prompt and buttons for unauthenticated users
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import { useTheme, useUserRole } from "@shared/context";
import { radius, fontSize, fontWeight, spacing } from "@shared/constants";

export default function SignInSection() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.primary[900]
                  : theme.colors.primary[100],
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={32}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("account.signInTitle", {
                defaultValue: "Sign In to Continue",
              })}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("account.signInPrompt", {
                defaultValue:
                  "Access your bookings, saved places, and personalized recommendations",
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[
          styles.signInButton,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
        onPress={() => router.push("/(overlays)/auth")}
      >
        <View
          style={[
            styles.buttonIconContainer,
            {
              backgroundColor: isDark
                ? theme.colors.primary[900]
                : theme.colors.primary[100],
            },
          ]}
        >
          <Ionicons
            name="log-in-outline"
            size={20}
            color={theme.colors.primary[500]}
          />
        </View>
        <View style={styles.buttonContent}>
          <Text
            style={[
              styles.buttonTitle,
              {
                color: isDark ? theme.colors.gray[100] : theme.colors.gray[900],
              },
            ]}
          >
            {t("account.signIn", { defaultValue: "Sign In" })}
          </Text>
          <Text
            style={[
              styles.buttonSubtitle,
              {
                color: isDark ? theme.colors.gray[400] : theme.colors.gray[600],
              },
            ]}
          >
            {t("account.signInDesc", {
              defaultValue: "Sign in or create an account",
            })}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
        />
      </TouchableOpacity>

      {/* Create Account Button */}
      <TouchableOpacity
        style={[
          styles.createAccountButton,
          {
            backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
            borderColor: isDark
              ? theme.colors.gray[700]
              : theme.colors.gray[200],
          },
        ]}
        onPress={() => {
          router.push("/(overlays)/auth");
          // We could potentially pass a parameter to open directly to register view
        }}
      >
        <Ionicons
          name="person-add-outline"
          size={20}
          color={isDark ? theme.colors.gray[500] : theme.colors.gray[400]}
          style={styles.createAccountIcon}
        />
        <Text
          style={[
            styles.createAccountText,
            {
              color: isDark ? theme.colors.gray[500] : theme.colors.gray[400],
            },
          ]}
        >
          {t("account.createAccount", { defaultValue: "Create Account" })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },
  header: {
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: fontSize.sm,
  },
  createAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  createAccountIcon: {
    marginRight: spacing.sm,
  },
  createAccountText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
