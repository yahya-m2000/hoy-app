/**
 * Authentication Screen for the Hoy application
 * Provides login and registration functionality with social login options
 */

import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";

// Context and hooks
import { useAuth, useToast } from "@core/context";
import { useTheme } from "@core/hooks/useTheme";
import { getAuthDebugInfo } from "@core/auth";
import { useAuth0Integration } from "@core/hooks/useAuth0Integration";

// Base Components
import { Text, Button, Input } from "src/shared/components/base";
import { Container, Header, Screen } from "src/shared";

// Auth Components (refined to use base components where possible)
import { AuthToggle, SocialLogin } from "src/features/auth";

export default function SignInScreen() {
  const { t } = useTranslation();
  const { login: authLogin } = useAuth();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();
  const { authenticateWithAuth0, isAuth0Loading } = useAuth0Integration();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form validation for login form
  const validateLoginForm = () => {
    if (!email.trim())
      return t("validation.required", {
        field: t("features.auth.forms.fields.email"),
      });
    if (!password)
      return t("validation.required", {
        field: t("features.auth.forms.fields.password"),
      });
    return "";
  };

  // Handle Auth0 login
  const handleAuth0Login = async (
    connection?: "google-oauth2" | "facebook"
  ) => {
    setLoading(true);
    setError("");

    try {
      await authenticateWithAuth0(connection);

      showToast({
        type: "success",
        message: t("features.auth.social.sso.auth0LoginSuccess"),
      });

      router.back();
    } catch (err) {
      // Check if user needs to sign up (not an error, expected flow)
      if (err instanceof Error && err.message === "USER_NEEDS_SIGNUP") {
        // Navigate to signup page (maintains back stack)
        router.push("/(auth)/sign-up");
        return; // Don't set error state for expected flow
      } else if (
        err instanceof Error &&
        err.message === "ACCOUNT_LINKING_REQUIRED"
      ) {
        // Navigate to account linking page (maintains back stack)
        router.push("/(auth)/account-linking");
        return; // Don't set error state for expected flow
      } else {
        // Only log and set error for actual errors
        console.error("Auth0 login error:", err);
        setError(
          err instanceof Error
            ? err.message
            : t("features.auth.social.sso.auth0LoginFailed")
        );
      }
    } finally {
      setLoading(false);
    }
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
      // Use the new login method from AuthContext
      await authLogin(email, password);

      // Debug: Check token storage after login
      console.log("🔍 Checking token storage after login...");
      await getAuthDebugInfo();

      showToast({
        type: "success",
        message: t("common.success"),
      });
      router.back();
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("features.auth.forms.validation.emailInvalid")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container flex={1}>
      <Header
        title={t("features.auth.forms.signIn")}
        left={{
          icon: "chevron-back-outline",
          onPress: () => router.back(),
        }}
      />
      <StatusBar style={isDark ? "light" : "dark"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Container flex={1} padding="lg">
            {/* Welcome Section */}
            <Container marginBottom="xl">
              <Text
                variant="h4"
                color="primary"
                align="center"
                style={{ marginBottom: 8 }}
              >
                {t("features.auth.forms.welcomeBack")}
              </Text>
              <Text variant="body" color="secondary" align="center">
                {t("features.auth.forms.signInToContinue")}
              </Text>
            </Container>

            {/* Error Message */}
            {error ? (
              <Text
                variant="body"
                color="error"
                weight="bold"
                align="center"
                style={{ marginBottom: 16 }}
              >
                {error}
              </Text>
            ) : null}

            {/* Traditional Login Section */}
            <Container marginBottom="xl">
              <Container marginBottom="md">
                <Text variant="h6" color="primary">
                  {t("features.auth.forms.signInWithEmail")}
                </Text>
              </Container>

              <Container marginBottom="md">
                <Input
                  label={t("features.auth.forms.fields.email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t("features.auth.forms.fields.email")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoComplete="email"
                  style={{ marginBottom: 8 }}
                />
                <Text variant="caption" color="secondary">
                  {t("features.auth.forms.helpers.emailHelper")}
                </Text>
              </Container>

              <Container marginBottom="lg">
                <Input
                  label={t("features.auth.forms.fields.password")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("features.auth.forms.fields.password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightIcon={showPassword ? "eye-off" : "eye"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  style={{ marginBottom: 8 }}
                  textContentType="password"
                  autoComplete="password"
                />
                <Text variant="caption" color="secondary">
                  {t("features.auth.forms.helpers.passwordHelper")}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ marginTop: 4, fontStyle: "italic" }}
                >
                  {t("features.auth.social.passwordManager.autofillHint")}
                </Text>
              </Container>

              <Button
                title={t("features.auth.forms.signIn")}
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                style={{ marginBottom: 16 }}
              />

              <Button
                title={t("features.auth.forms.createAccount")}
                variant="ghost"
                onPress={() => router.push("/(auth)/sign-up")}
                style={{ alignSelf: "center" }}
              />
            </Container>
            {/* Social Login Section */}
            <Container>
              <SocialLogin
                loading={loading || isAuth0Loading}
                onGooglePress={() => handleAuth0Login("google-oauth2")}
                onFacebookPress={() => handleAuth0Login("facebook")}
              />
            </Container>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
