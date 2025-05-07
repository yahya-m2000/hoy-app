/**
 * Forgot Password Modal for the Hoy application
 * Provides password reset functionality
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import BottomSheetModal from "../../src/components/BottomSheetModal";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import * as authService from "../../src/services/authService";
import { useToast } from "../../src/context/ToastContext";

export default function ForgotPasswordModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
      showToast({
        type: "success",
        message: "Password reset instructions sent",
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModal title={t("auth.forgotPassword")} showSaveButton={false}>
      <View style={styles.container}>
        {success ? (
          // Success state
          <View style={styles.successContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.success[100] },
              ]}
            >
              <Ionicons
                name="checkmark"
                size={36}
                color={theme.colors.success[500]}
              />
            </View>
            <Text
              style={[
                styles.successTitle,
                {
                  color: isDark
                    ? theme.colors.gray[100]
                    : theme.colors.gray[900],
                },
              ]}
            >
              {t("auth.resetEmailSent")}
            </Text>
            <Text
              style={[
                styles.successText,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("auth.resetEmailInstructions")}
            </Text>
            <Text
              style={[styles.emailText, { color: theme.colors.primary[500] }]}
            >
              {email}
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.colors.primary[500] },
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>{t("common.ok")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Form state
          <View>
            <Text
              style={[
                styles.description,
                {
                  color: isDark
                    ? theme.colors.gray[300]
                    : theme.colors.gray[700],
                },
              ]}
            >
              {t("auth.forgotPasswordDesc")}
            </Text>

            {/* Error Message */}
            {error ? (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.error[900]
                      : theme.colors.error[50],
                    borderColor: theme.colors.error[500],
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.error[500]}
                />
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: isDark
                        ? theme.colors.error[100]
                        : theme.colors.error[700],
                    },
                  ]}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {t("auth.email")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.white,
                    borderColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                    color: isDark ? theme.white : theme.colors.gray[900],
                  },
                ]}
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor={
                  isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                }
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary[500],
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>{t("auth.sendResetLink")}</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(modals)/AuthModal")}
            >
              <Text
                style={[
                  styles.backButtonText,
                  { color: theme.colors.primary[500] },
                ]}
              >
                {t("auth.backToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  button: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  backButton: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: fontSize.md,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emailText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.xl,
  },
});
