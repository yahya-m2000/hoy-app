/**
 * Authentication Modal for the Hoy application
 * Provides login and registration functionality with social login options
 */

import React, { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

// Context and hooks
import { useAuth } from "@common/context/AuthContext";
import { useToast } from "@common/context/ToastContext";

// Components
import BottomSheetModal from "@common/components/BottomSheetModal";
import {
  AuthForm,
  AuthToggle,
  ErrorMessage,
  SocialLogin,
  TermsText,
} from "src/common/components/Modals/Auth";

// Services
import * as authService from "@common/services/authService";

// Constants
import { spacing } from "@common/constants/spacing";

type AuthView = "login" | "register";

export default function AuthModal() {
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
      title={authView === "login" ? "Login" : "Register"}
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
          <View style={styles.formContainer}>
            {/* Error Message */}
            <ErrorMessage error={error} />

            {/* Auth Form */}
            <AuthForm
              authView={authView}
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onSubmit={authView === "login" ? handleLogin : handleRegister}
            />

            {/* Toggle between login/register views */}
            <AuthToggle authView={authView} onToggle={toggleAuthView} />

            {/* Social Login Options */}
            <SocialLogin loading={loading} />

            {/* Terms & Privacy */}
            <TermsText />
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
});
