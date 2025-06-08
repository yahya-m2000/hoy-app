/**
 * Base Input component for the Hoy application
 * Supports icons, error states, and field validation
 */

// React
import React, { useState } from "react";

// React Native
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
} from "react-native";

// Context
import { useTheme } from "@shared/context";

// Constants
import { spacing, radius, fontSize, fontWeight } from "@shared/constants";

// Base components
import { Text } from "../Text";

// Types
import type { BaseInputProps } from "./Input.types";

export const Input: React.FC<BaseInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: error ? spacing.xs : spacing.md,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: theme.text.secondary,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: multiline ? "flex-start" : "center",
      backgroundColor: theme.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: error
        ? theme.error
        : isFocused
        ? theme.primary
        : theme.border,
      paddingHorizontal: spacing.md,
      paddingVertical: multiline ? spacing.md : spacing.sm,
      minHeight: multiline ? 80 : 50,
    },
    input: {
      flex: 1,
      fontSize: fontSize.md,
      color: theme.text.primary,
      paddingVertical: 0,
      textAlignVertical: multiline ? "top" : "center",
    },
    iconContainer: {
      marginHorizontal: spacing.xs,
    },
    leftIcon: {
      marginRight: spacing.xs,
      marginLeft: 0,
    },
    rightIcon: {
      marginLeft: spacing.xs,
      marginRight: 0,
    },
    error: {
      fontSize: fontSize.sm,
      color: theme.error,
      marginTop: spacing.xs,
      marginLeft: spacing.xs,
    },
    disabled: {
      opacity: 0.6,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.error }}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputContainer, disabled && styles.disabled]}>
        {leftIcon && (
          <View style={[styles.iconContainer, styles.leftIcon]}>
            {leftIcon}
          </View>
        )}
        <RNTextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.secondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...props}
        />
        {rightIcon && (
          <Pressable
            style={[styles.iconContainer, styles.rightIcon]}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};
