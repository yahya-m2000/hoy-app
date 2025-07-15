/**
 * PasswordInput component
 * Password input field with visibility toggle
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@core/hooks";
import { fontSize, spacing, radius } from "@core/design";

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  editable?: boolean;
  style?: any;
  textContentType?: "password" | "newPassword";
  autoComplete?: "password" | "new-password";
  passwordRules?: string;
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
  editable = true,
  style,
  textContentType,
  autoComplete,
  passwordRules,
}: PasswordInputProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.inputContainer, style]}>
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
          onChangeText={onChangeText}
          editable={editable}
          textContentType={textContentType}
          autoComplete={autoComplete}
          passwordRules={passwordRules}
        />
        <TouchableOpacity
          style={styles.passwordVisibilityBtn}
          onPress={onTogglePassword}
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
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
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
});
