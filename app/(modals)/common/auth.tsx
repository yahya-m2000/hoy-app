/**
 * Authentication Modal for the Hoy application
 * Provides login and registration functionality with social login options
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Context and hooks
import { useTheme } from "@common/context/ThemeContext";
import { useAuth } from "@common/context/AuthContext";
import { useToast } from "@common/context/ToastContext";
// import { useTranslation } from "react-i18next";

// Components
import BottomSheetModal from "@common/components/BottomSheetModal";

// Services
import * as authService from "@common/services/authService";

// Constants
import { fontSize } from "@common/constants/typography";
import { spacing } from "@common/constants/spacing";
import { radius } from "@common/constants/radius";
import { useTranslation } from "node_modules/react-i18next";

type AuthView = "login" | "register";

export default function AuthModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showToast } = useToast();

  // State for view switching
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Form validation for login form
  const validateLoginForm = () => {
    if (!email.trim()) return "Email is required";
    if (!password) return "Password is required";
    return "";
  };

  // Form validation for registration form
  const validateRegisterForm = () => {
    if (!email.trim()) return "Email is required";
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!password) return "Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  // Handle login submission
  const handleLogin = async () => {
    const validationError = validateLoginForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      showToast({
        type: "success",
        message: "Login successful",
      });
      router.back();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle register submission
  const handleRegister = async () => {
    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Register user
      await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // Auto-login after registration
      await login(email, password);

      showToast({
        type: "success",
        message: "Account created successfully!",
      });
      router.back();
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Switch between login and register views
  const toggleAuthView = () => {
    setAuthView(authView === "login" ? "register" : "login");
    setError("");
  };

  return (
    <BottomSheetModal
      title={authView === "login" ? t("auth.login") : t("auth.register")}
      showSaveButton={false}
      fullHeight={authView === "register"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Auth Form */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {error ? (
              <View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: isDark
                      ? theme.colors.errorPalette[900]
                      : theme.colors.errorPalette[50],
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.error}
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

            {/* Registration fields */}
            {authView === "register" && (
              <>
                <View style={styles.nameContainer}>
                  {/* First Name */}
                  <View
                    style={[
                      styles.inputContainer,
                      { flex: 1, marginRight: spacing.sm },
                    ]}
                  >
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
                      {t("auth.firstName")}
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
                      placeholder={t("auth.firstNamePlaceholder")}
                      placeholderTextColor={
                        isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                      }
                      value={firstName}
                      onChangeText={setFirstName}
                      editable={!loading}
                    />
                  </View>

                  {/* Last Name */}
                  <View style={[styles.inputContainer, { flex: 1 }]}>
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
                      {t("auth.lastName")}
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
                      placeholder={t("auth.lastNamePlaceholder")}
                      placeholderTextColor={
                        isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                      }
                      value={lastName}
                      onChangeText={setLastName}
                      editable={!loading}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Password Field */}
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
                {t("auth.password")}
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
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
                  placeholder={t("auth.passwordPlaceholder")}
                  placeholderTextColor={
                    isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                  }
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.passwordVisibilityBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={
                      isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password (Register only) */}
            {authView === "register" && (
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
                  {t("auth.confirmPassword")}
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput,
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
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                    placeholderTextColor={
                      isDark ? theme.colors.gray[500] : theme.colors.gray[400]
                    }
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordVisibilityBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={
                        isDark ? theme.colors.gray[400] : theme.colors.gray[600]
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {authView === "login" && (
              <TouchableOpacity
                style={styles.forgotPasswordBtn}
                onPress={() => router.push("/(modals)/common/forgot-password")}
              >
                <Text
                  style={[
                    styles.forgotPasswordText,
                    { color: theme.colors.primary },
                  ]}
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
              onPress={authView === "login" ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {authView === "login"
                    ? t("auth.login")
                    : t("auth.createAccount")}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle between login/register views */}
            <View style={styles.toggleContainer}>
              <Text
                style={[
                  styles.toggleText,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {authView === "login"
                  ? t("auth.noAccount")
                  : t("auth.alreadyHaveAccount")}
              </Text>
              <TouchableOpacity onPress={toggleAuthView}>
                <Text
                  style={[
                    styles.toggleActionText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {authView === "login" ? t("auth.register") : t("auth.login")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Login Options - Placeholder */}
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
                    color: isDark
                      ? theme.colors.gray[400]
                      : theme.colors.gray[600],
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

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  {
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.white,
                    borderColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  },
                ]}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text
                  style={[
                    styles.socialButtonText,
                    {
                      color: isDark
                        ? theme.colors.gray[300]
                        : theme.colors.gray[700],
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
                    backgroundColor: isDark
                      ? theme.colors.gray[800]
                      : theme.white,
                    borderColor: isDark
                      ? theme.colors.gray[700]
                      : theme.colors.gray[300],
                  },
                ]}
                disabled={loading}
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
                      color: isDark
                        ? theme.colors.gray[300]
                        : theme.colors.gray[700],
                    },
                  ]}
                >
                  Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy */}
            <Text
              style={[
                styles.termsText,
                {
                  color: isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600],
                },
              ]}
            >
              {t("auth.termsAgreement")}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.termsOfService")}
              </Text>
              {t("auth.and")}
              <Text style={{ color: theme.colors.primary }}>
                {t("auth.privacyPolicy")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    padding: spacing.md,
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
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    paddingRight: spacing.xl * 2,
  },
  passwordVisibilityBtn: {
    position: "absolute",
    right: spacing.md,
    height: 48,
    justifyContent: "center",
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  toggleText: {
    fontSize: fontSize.sm,
  },
  toggleActionText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
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
  termsText: {
    fontSize: fontSize.xs,
    textAlign: "center",
    marginTop: spacing.md,
  },
});

