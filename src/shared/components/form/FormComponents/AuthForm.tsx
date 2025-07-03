/**
 * AuthForm component
 * Main form container with all form fields and submit button
 */

/**
 * AuthForm component
 * Main form container with all form fields and submit button
 */

// React
import React from "react";

// React Native
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

// Expo
import { router } from "expo-router";

// i18n
import { useTranslation } from "react-i18next";

// Context
import { useTheme } from "src/core/hooks/useTheme";

// Constants
import { fontSize, spacing, radius } from "@core/design";

// Components
import AuthInput from "src/features/auth/components/AuthInput";
import PasswordInput from "src/features/auth/components/PasswordInput";

interface AuthFormProps {
  authView: "login" | "register";
  loading: boolean;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  firstName: string;
  setFirstName: (text: string) => void;
  lastName: string;
  setLastName: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  onSubmit: () => void;
}

export default function AuthForm({
  authView,
  loading,
  email,
  setEmail,
  password,
  setPassword,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
}: AuthFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <>
      {/* Email Field */}
      <AuthInput
        label={t("auth.email")}
        placeholder={t("auth.emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      {/* Registration fields */}
      {authView === "register" && (
        <View style={styles.nameContainer}>
          {/* First Name */}
          <AuthInput
            label={t("auth.firstName")}
            placeholder={t("auth.firstNamePlaceholder")}
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
            style={[styles.nameInput, { marginRight: spacing.sm }]}
          />

          {/* Last Name */}
          <AuthInput
            label={t("auth.lastName")}
            placeholder={t("auth.lastNamePlaceholder")}
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
            style={styles.nameInput}
          />
        </View>
      )}

      {/* Password Field */}
      <PasswordInput
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        editable={!loading}
      />

      {/* Confirm Password (Register only) */}
      {authView === "register" && (
        <PasswordInput
          label={t("auth.confirmPassword")}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          editable={!loading}
        />
      )}

      {/* Forgot Password (Login only) */}
      {authView === "login" && (
        <TouchableOpacity
          style={styles.forgotPasswordBtn}
          onPress={() => router.push("/(overlays)/auth/forgot-password")}
        >
          <Text
            style={[styles.forgotPasswordText, { color: theme.colors.primary }]}
          >
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: theme.colors.primary,
            opacity: loading ? 0.7 : 1,
          },
        ]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.white} size="small" />
        ) : (
          <Text style={styles.submitButtonText}>
            {authView === "login" ? t("auth.login") : t("auth.createAccount")}
          </Text>
        )}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameInput: {
    flex: 1,
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
  },
  submitButton: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitButtonText: {
    color: "white",
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
