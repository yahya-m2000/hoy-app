/**
 * Authentication Screen for the Hoy application
 * Provides login and registration functionality with social login options
 */

import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Context and hooks
import { useAuth, useToast } from "@core/context";
import { useTheme } from "@core/hooks/useTheme";
import { getAuthDebugInfo } from "@core/auth";

// Base Components
import { Text, Button, Input } from "src/shared/components/base";
import { Container, Header, Screen } from "src/shared";

// Auth Components (refined to use base components where possible)
import { AuthToggle, SocialLogin } from "src/features/auth";

export default function SignInScreen() {
  const { login: authLogin } = useAuth();
  const { showToast } = useToast();
  const { theme, isDark } = useTheme();

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
    if (!email.trim()) return "Email is required";
    if (!password) return "Password is required";
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
      // Use the new login method from AuthContext
      await authLogin(email, password);

      // Debug: Check token storage after login
      console.log("🔍 Checking token storage after login...");
      await getAuthDebugInfo();

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

  return (
    <Container flex={1}>
      <Header
        title="Sign In"
        left={{
          icon: "arrow-back",
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
            {/* Error Message */}
            {error ? (
              <Container
                marginBottom="md"
                padding="md"
                backgroundColor="error"
                borderRadius="md"
              >
                <Text
                  variant="body"
                  color="white"
                  style={{ textAlign: "center" }}
                >
                  {error}
                </Text>
              </Container>
            ) : null}

            {/* Auth Form */}
            <Container marginBottom="lg">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: 16 }}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={{ marginBottom: 24 }}
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                style={{ marginBottom: 16 }}
              />

              <Button
                title="Create Account"
                variant="ghost"
                onPress={() => router.push("/(auth)/sign-up")}
                style={{ alignSelf: "center" }}
              />
            </Container>

            {/* Social Login Options */}
            <SocialLogin loading={loading} />
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
