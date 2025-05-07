/**
 * Change Password Modal for the Hoy application
 * Allows users to update their password
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BottomSheetModal from "../../src/components/BottomSheetModal";
import { fontSize } from "../../src/constants/typography";
import { spacing } from "../../src/constants/spacing";
import { radius } from "../../src/constants/radius";
import { useUpdatePassword } from "../../src/hooks/useUser";
import { useToast } from "../../src/context/ToastContext";

export default function ChangePasswordModal() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { mutateAsync: updatePassword, isPending: isLoading } = useUpdatePassword();

  // Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation
  const validateForm = () => {
    if (!currentPassword) return t("password.currentRequired");
    if (!newPassword) return t("password.newRequired");
    if (newPassword.length < 8) return t("password.lengthError");
    if (newPassword === currentPassword) return t("password.differentError");
    if (newPassword !== confirmPassword) return t("password.matchError");
    return "";
  };

  // Handle form submission
  const handleChangePassword = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });

      showToast({
        type: "success",
        message: t("password.updateSuccess"),
      });

      router.back();
    } catch (err) {
      console.error("Password update error:", err);
      setError(err instanceof Error ? err.message : t("password.updateError"));
    }
  };

  // Password input field renderer
  const renderPasswordField = (
    label: string,
    value: string,
    setValue: (text: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    placeholder: string
  ) => {
    return (
      <View style={styles.inputContainer}>
        <Text
          style={[
            styles.inputLabel,
            {
              color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
            },
          ]}
        >
          {label}
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              {
                backgroundColor: isDark ? theme.colors.gray[800] : theme.white,
                borderColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[300],
                color: isDark ? theme.white : theme.colors.gray[900],
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={
              isDark ? theme.colors.gray[500] : theme.colors.gray[400]
            }
            secureTextEntry={!showPassword}
            value={value}
            onChangeText={setValue}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.passwordVisibilityBtn}
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={isDark ? theme.colors.gray[400] : theme.colors.gray[600]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <BottomSheetModal
      title={t("password.changePassword")}
      showSaveButton={true}
      onSave={handleChangePassword}
      saveText={t("common.save")}
      disabled={isLoading}
      loading={isLoading}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
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

          <Text
            style={[
              styles.description,
              {
                color: isDark ? theme.colors.gray[300] : theme.colors.gray[700],
              },
            ]}
          >
            {t("password.description")}
          </Text>

          {/* Password Fields */}
          {renderPasswordField(
            t("password.current"),
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            setShowCurrentPassword,
            t("password.currentPlaceholder")
          )}

          {renderPasswordField(
            t("password.new"),
            newPassword,
            setNewPassword,
            showNewPassword,
            setShowNewPassword,
            t("password.newPlaceholder")
          )}

          {renderPasswordField(
            t("password.confirm"),
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            t("password.confirmPlaceholder")
          )}

          {/* Password Requirements */}
          <View
            style={[
              styles.requirementsContainer,
              {
                backgroundColor: isDark
                  ? theme.colors.gray[700]
                  : theme.colors.gray[100],
                borderColor: isDark
                  ? theme.colors.gray[600]
                  : theme.colors.gray[200],
              },
            ]}
          >
            <Text
              style={[
                styles.requirementsTitle,
                {
                  color: isDark
                    ? theme.colors.gray[200]
                    : theme.colors.gray[800],
                },
              ]}
            >
              {t("password.requirements.title")}
            </Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  newPassword.length >= 8
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  newPassword.length >= 8
                    ? theme.colors.success[500]
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600]
                }
                style={styles.requirementIcon}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {t("password.requirements.length")}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                    ? theme.colors.success[500]
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600]
                }
                style={styles.requirementIcon}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {t("password.requirements.case")}
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={
                  /[0-9]/.test(newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[0-9]/.test(newPassword)
                    ? theme.colors.success[500]
                    : isDark
                    ? theme.colors.gray[400]
                    : theme.colors.gray[600]
                }
                style={styles.requirementIcon}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: isDark
                      ? theme.colors.gray[300]
                      : theme.colors.gray[700],
                  },
                ]}
              >
                {t("password.requirements.number")}
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
  },
  description: {
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: fontSize.md,
  },
  passwordVisibilityBtn: {
    padding: spacing.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
    flex: 1,
  },
  requirementsContainer: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  requirementsTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  requirementIcon: {
    marginRight: 6,
  },
  requirementText: {
    fontSize: fontSize.sm,
  },
});
