/**
 * AuthInput component
 * Reusable input field for authentication forms
 */

import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import { useTheme } from "@shared/hooks/useTheme";
import { fontSize, spacing, radius } from "@shared/constants";

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  style?: any;
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  editable = true,
  style,
}: AuthInputProps) {
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
      <TextInput
        style={[
          styles.input,
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
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
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
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
});
